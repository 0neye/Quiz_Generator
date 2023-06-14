import { OpenAIApi, ChatCompletionRequestMessage, ChatCompletionResponseMessage } from "openai";
import { env } from "process";
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
export interface ModelAnswer {
    type: 'ModelAnswer'
    value: string
}
export interface ModelToolUse {
    type: 'ModelToolUse'
    value: string
}
export interface OutputError {
    type: 'OutputError'
    value: string
}
export type ParseOutput = ModelAnswer | ModelToolUse | OutputError

export class ChatThread {
    openai: OpenAIApi
    messages: ChatCompletionRequestMessage[]
    constructor(openai: OpenAIApi, messages: ChatCompletionRequestMessage[]) {
        this.openai = openai
        this.messages = messages
    }

    /**
    * Asynchronously generates a chat response message using the OpenAI API.
    * @param message - The request message to generate a response for.
    * @returns A promise that resolves with the generated response message string.
    */
    async getResponse(message: ChatCompletionRequestMessage): Promise<string> {
        this.messages.push(message)
        const response = await this.openai.createChatCompletion({
            model: process.env.OPENAI_MODEL,
            temperature: 0.5,
            messages: this.messages,
        })
        const responseMessage = response.data.choices[0].message as ChatCompletionResponseMessage
        this.messages.push({ role: responseMessage.role, content: responseMessage.content })
        return responseMessage.content
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
}