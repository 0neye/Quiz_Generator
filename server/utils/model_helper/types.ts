
import { OpenAIApi, ChatCompletionRequestMessage, ChatCompletionResponseMessage } from "openai";

export interface Tool {
    name: string
    description: string // uses and input format
    failure_patterns: FailurePattern[] // to recognize the model has misunderstood the tool format

    // required methods
    run: (input: string) => Promise<string>
    toModelString: () => string
}
export interface FailurePattern {
    expression: RegExp
    message: string
}

export class ChatThread {
    openai: OpenAIApi
    messages: ChatCompletionRequestMessage[]
    model: string

    constructor(openai: OpenAIApi, messages: ChatCompletionRequestMessage[], model: string = null) {
        this.openai = openai
        this.messages = messages
        this.model = model ? model : process.env.OPENAI_MODEL
    }

    /**
    * Asynchronously generates a chat response message using the OpenAI API.
    * 
    * @param message - The request message to generate a response for.
    * @returns A promise that resolves with the generated response message string.
    */
    async getResponse(message: ChatCompletionRequestMessage): Promise<string> {
        this.messages.push(message)
        const response = await this.openai.createChatCompletion({
            model: this.model,
            temperature: 0.5,
            messages: this.messages,
        })
        const responseMessage = response.data.choices[0].message as ChatCompletionResponseMessage
        this.messages.push({ role: responseMessage.role, content: responseMessage.content })
        return responseMessage.content
    }

    /**
     * A function that accepts a message from the user and returns a response.
     *
     * @param {string} message - The message from the user.
     * @return {Promise<string>} The response to the user's message.
     */
    async userMessage(message: string): Promise<string> {
        return await this.getResponse({ role: "user", content: message })
    }

    /**
     * Returns a JSON string representation of a slice of messages in the object.
     *
     * @param {number} [sliceIndex=1] - The index of the first message to include in the slice.
     * @return {string} A JSON string representation of the slice of messages.
     */
    toString(sliceIndex: number = 1): string {
        return JSON.stringify(this.messages.slice(sliceIndex), null, 2)
    }

    lastMessage(): string {
        return this.messages[this.messages.length - 1].content
    }
}

export class Chain {
    thread: ChatThread
    response_object: { [key: string]: any }
    output_point_prefixes: string[]

    static getPrefix(input: string, match: string): string {
        for (const line of input.split("\n")) {
            if (line.includes(match)) {
                return line.split(match)[0].trim()
            }
        }
        return ""
    }

    constructor(systemMessage: string = null, openai: OpenAIApi = null, prefixes: string[] = [], thread: ChatThread = null) {
        if (!systemMessage && !openai && !thread)
            throw new Error("Either systemMessage and openai, or thread must be provided")
        this.thread = thread ? thread : new ChatThread(openai, [{ role: "system", content: systemMessage }])
        this.response_object = {}
        this.output_point_prefixes = prefixes.length ? prefixes : []
        const outputPointExpr = /\[\[([^ \n]*) *- *(.*)\]\]/mg // [[field_name - model note]] -> [model note]

        // replace all occurrences in system message
        let match: RegExpExecArray | null = outputPointExpr.exec(systemMessage);
        while (match !== null) {
            // get the prefixes if not provided
            if (!prefixes.length)
                this.output_point_prefixes.push(Chain.getPrefix(systemMessage, match[0]))
            // get the field name
            const field_name = match[1];
            this.response_object[field_name] = null; // add a key and null value
            // get the model note
            const model_note = match[2];
            this.thread.messages[0].content = systemMessage.replace(match[0], `[${model_note}]`)
            
            // get the next match
            match = outputPointExpr.exec(systemMessage)
        }
    }

    /**
     * Retrieves the outputs in response to a user message.
     * 
     * The system message syntax is used to define output points in the chat thread. An output point is a specific piece of information that the model is expected to provide in its response. The syntax for defining an output point is as follows:
     * [[field_name - model_note]]

     * - field_name: The name of the field where the model's response for this output point will be stored.
     * - model_note: A note or description for the model to provide additional context about the output point.

     * Example:
     * If the system message is "Please provide the answer to the question: [[answer - Model's answer]]", the output point "answer" will be extracted and the response object will have a field named "answer". When the model generates a response that includes the answer, it will be stored in the "answer" field of the response object.
     * This allows for easy retrieval of specific information from the model's response.
     * Null values will be returned for fields that are not present in the model's response.
     *
     * @param {string} userMessage - The user message.
     * @param {(value: string, key: string) => any} transform - An optional function to transform each output point.
     * @return {Promise<any>} A promise that resolves to the response object containing the outputs.
     */
    async getOutputs(userMessage: string, transform: (value: string, key: string) => any = null): Promise<any> {
        let response = await this.thread.userMessage(userMessage)

        for (let i = 0; i < this.output_point_prefixes.length; i++) {
            const prefix = this.output_point_prefixes[i]
            const line = response.split("\n").filter(line => line.includes(prefix))[0]
            if (!line) continue
            let value = line.split(prefix)[1].trim()
            const key = Object.keys(this.response_object)[i]
            if (transform)
                value = transform(value, key)
            this.response_object[key] = value
        }

        return this.response_object
    }
}


export class Agent {
    chain: Chain
    tools: Tool[]

    constructor(systemMessage: string = null, openai: OpenAIApi = null, tools: Tool[], chain: Chain = null) {
        if (!systemMessage && !openai && !chain) throw new Error("Either systemMessage and openai, or chain must be provided.")
        this.chain = chain ? chain : new Chain(systemMessage, openai)
        this.tools = tools
    }
    
    static validToolInput(tool: Tool, toolInput: string): {valid: boolean, message: string} {
        for (const pattern of tool.failure_patterns) {
            if (pattern.expression.test(toolInput)) {
                // respond to the model with the error and get next response
                return { valid: false, message: pattern.message }
            }
        }
        return { valid: true, message: "" }
    }
    /**
     * Retrieves a response from the model based on user input and other parameters.
     *
     * @param {{answerKey: string, toolNameKey: string, toolInputKey: string}} keys - The keys used in the system message
     * @param {string} userMessage - The user's input message.
     * @param {number} tries - The number of times to try getting a response from the model.
     * @param {boolean} [verbose=false] - Whether to log verbose output.
     * @return {Promise<{ answer: string, thoughts: string }>} A promise that resolves to an object containing the answer and thoughts (chat thread).
     */
    async getResponse(keys: { answerKey: string, toolNameKey: string, toolInputKey: string }, userMessage: string, tries: number, verbose: boolean = false): Promise<{ answer: string, thoughts: string }> {
        let outputs = await this.chain.getOutputs(userMessage)

        // main loop, try #times 
        for (let i = 0; i < tries; i++) {
            const [answer, toolName, toolInput] = [outputs[keys.answerKey], outputs[keys.toolNameKey], outputs[keys.toolInputKey]]
            // if it's using a tool
            if (toolName && toolInput) {

                const tool = this.tools.find((tool) => tool.name.toLocaleLowerCase() === toolName.toLocaleLowerCase())
                if (!tool) {
                    // respond to the model with the error and get next response
                    outputs = await this.chain.getOutputs(`Tool not found: "${toolName}"`)
                    if (verbose) { console.log(`Got response to !tool: ${this.chain.thread.lastMessage()}`) }
                    continue
                }
                if (verbose) { console.log(`Input to ${tool.name}: ${toolInput}`) }
                const validated = Agent.validToolInput(tool, toolInput);
                if (!validated.valid) {
                    // respond to the model with the error and get next response
                    outputs = await this.chain.getOutputs(`Invalid tool input: ${validated.message}`)
                    if (verbose) { console.log(`Got response to tool failure: ${this.chain.thread.lastMessage()}`) }
                    continue
                }
                const toolResult = await tool.run(toolInput)
                if (verbose) { console.log(`${tool.name} returned: ${toolResult}`) }
                outputs = await this.chain.getOutputs(`${tool.name} returned: \`${toolResult}\`\nIf this is the full answer respond with your answer using the given syntax, else continue following the system instructions.`)
                continue
            }
            // if it's got the answer
            else if (answer) {
                if (verbose) { console.log(`Got full thread: ${this.chain.thread}`) }
                return { answer: answer, thoughts: this.chain.thread.toString(2) }
            }
            // if it's nothing
            else {
                outputs = await this.chain.getOutputs(`It's fine, you can think. Just remember you have ${tries - i - 1} more responses left. Follow the system instructions.`)
                continue
            }
        }
        return null;
    }
}