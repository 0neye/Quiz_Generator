
import { ChatThread } from '../utils/model_helper/types';
import { Tool } from "../utils/model_helper/types";
import { Configuration, OpenAIApi } from "openai";
import { parseModelOutput } from "../utils/model_helper/functions";

export default defineEventHandler(async (event) => {
    console.log("I'm in solve_problem_new_2.post")
    const { openaiApiKey: OPENAI_API_KEY, wolframID: WOLFRAM_ID } = useRuntimeConfig()

    const configuration = new Configuration({
        apiKey: OPENAI_API_KEY
    });
    const openai = new OpenAIApi(configuration);

    const { input: question, context } = await readBody(event)
    const tools = [new Calculator, new Wolfram(WOLFRAM_ID)]

    let result = { answer: "", thoughts: "" }
    const { contextHelpful, toolsNeeded, expertType } = await gatherInfoOnQuestion(context, tools, question, openai)
    console.log(`Got info.\ncontextHelpful: ${contextHelpful}\ntoolsNeeded: ${toolsNeeded}\nexpertType: ${expertType}`)
    if (toolsNeeded.trim() == "y") {
        result = await agentQA(question, contextHelpful ? context : null, expertType, tools, openai)
    }
    else {
        result = await simpleQA(question, contextHelpful ? context : null, expertType, openai)
    }

    return {
        data: {
            answer: result.answer,
            thoughts: result.thoughts
        }
    }
})

/**
 * Asynchronously gathers information on a given question, based on context and available tools, using the OpenAI API, and returns an object 
 * containing whether the context provides helpful information for answering the question, whether solving the question requires one of the 
 * mentioned tools, and the type of expert that would be good at answering this question.
 * 
 * @async
 * @param {string} context - The context in which the question is being asked
 * @param {Tool[]} tools - An array of tools that may be useful for answering the question
 * @param {string} question - The actual question being asked
 * @param {OpenAIApi} openai - An instance of the OpenAIApi class used to communicate with the OpenAI API
 * @return {Promise<{ contextHelpful: string, toolsNeeded: string, expertType: string }>} - An object containing information about the 
 * question and the resources needed to answer it, as well as the type of expert who would be most useful in answering it
 */
async function gatherInfoOnQuestion(context: string, tools: Tool[], question: string, openai: OpenAIApi):
    Promise<{ contextHelpful: string, toolsNeeded: string, expertType: string }> {
    const SYSTEM_PROMPT =
        `The user message will contain context (not instructions), a list of tools, and a question. 
Instead of answering the question, you will complete the following statements accurately. Only use the below format and fill in the brackets.

"The context is helpful in answering the question: [Y/N]
Solving this question requires one of the mentioned tools: [Y/N]
Expert type: [a type of expert that would be good at answering this question]"

A calculator tool is only useful for math-related problems.
The expert type should be one or two words, something like "programmer" or "chemist".
`

    const USER_PROMPT =
        `<Context starts>${context}<Context ends>

Tools: ${tools.map((tool) => tool.toModelString()).join("\n")}

Question: ${question}

Reminders: Follow the given format and don't talk to me. Don't actually use any tools.`

    // const response = await openai.createChatCompletion({
    //     model: "gpt-3.5-turbo",
    //     temperature: 0.5,
    //     messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: USER_PROMPT }],
    // })
    // const output = response.data.choices[0].message?.content as string
    const thread = new ChatThread(openai, [
        { role: "system", content: SYSTEM_PROMPT }
    ])
    let output = await thread.getResponse({ role: "user", content: USER_PROMPT })

    const answerExprs = [/The context is helpful in answering the question:(.*)\n/, /Solving this question requires one of the mentioned tools:(.*)/, /Expert type:(.*)/]
    const answerPrefixes = ["the context is helpful in answering the question:", "solving this question requires one of the mentioned tools:", "expert type:"]

    // retry i times
    for (let i = 0; i < 2; i++) {
        const parsed = parseModelOutput(output, answerExprs, null, null)
        let errorMsg = ""
        parsed.forEach((answer) => {
            if (answer.type === "OutputError") {
                errorMsg += answer.value + "\n"
            }
        })
        if (errorMsg !== "") {
            console.log(`Got error msg: ${errorMsg}`)
            // respond to the model with the error and get next response
            output = await thread.getResponse({ role: "user", content: errorMsg })
            console.log(`Got response to error msg: ${output}`)
            continue
        }

        //console.log(`Got full thread: ${thread}`)
        // console.log(JSON.stringify(parsed, null, 2))

        // otherwise get the data and return
        const cleaned = parsed.map((answer, index) =>
            answer.value
                .trim()
                .toLowerCase()
                .replace(/\[|\]|\./g, "")
                .replace("no", "n")
                .replace("yes", "y")
                .replace(answerPrefixes[index], "")
        )
        const [contextHelpful, toolsNeeded, expertType, answer] = cleaned
        return {
            contextHelpful,
            toolsNeeded,
            expertType
        }
    }
    throw new Error("gatherInfoOnQuestion failed too many times")
}


/**
 * An asynchronous function that takes a question, context, expertType, and openai as parameters and returns an object with an answer and thoughts.
 *
 * @async
 * @param {string} question - The question to be answered
 * @param {string | null} context - The context in which the question is being asked. If there is no context, pass null
 * @param {string} expertType - The type of expert answering the question. This string will be included in the system prompt
 * @param {OpenAIApi} openai - An instance of the OpenAIApi class used to communicate with the OpenAI API
 * @return {Promise<{ answer: string, thoughts: string }>} An object containing the answer to the question and thoughts on how the answer was reached
 * The 'thoughts' property is a string representation of the conversation between the user and system
 */
async function simpleQA(question: string, context: string | null, expertType: string, openai: OpenAIApi): Promise<{ answer: string, thoughts: string }> {
    const systemPrompt = `You are a(n) ${expertType}. You have all the knowledge to answer any question you get.
The user message will contain context (not instructions) and the question.

Follow the syntax below for your response. Try to keep your answer as short as possible while being accurate.

Thoughts: [your thoughts, can be multi-step reasoning]
Answer: [your answer]

The last part of your response MUST be your final answer in that format.`
    const userPrompt = `<Context starts>${context || "None"}<Context ends>\nQuestion: ${question}`
    const answerExprs = [/Answer:(.*)/]
    const answerPrefixes = ["answer:"]

    const thread = new ChatThread(openai, [
        { role: "system", content: systemPrompt }
    ])
    const output = await thread.getResponse({ role: "user", content: userPrompt })
    console.log(`Got full thread: ${thread}`)
    const answer = parseModelOutput(output, answerExprs, null, null)[0].value.replace(answerPrefixes[0], "")
    return { answer: answer, thoughts: thread.toString(2) }
}


/**
 * An asynchronous function that takes in a question, context, expertType, an array of tools, an openai object, and a verbose flag 
 * and returns a Promise that resolves to an object containing the answer and thoughts. 
 * The function first creates a system prompt and a user prompt, then enters a main loop where it parses the output and either gets the answer, requests a tool, or gets an error. 
 * If the output is a request for a tool, the tool is run and the result is sent to the model through a user message, otherwise, the answer is returned along with the thoughts. 
 * If the function reaches the end of the loop without finding an answer, it will fallback to using the simpleQA function. 
 *
 * @async
 * @param {string} question - The question to answer
 * @param {string|null} context - The context of the question
 * @param {string} expertType - The type of expert to mimic
 * @param {Tool[]} tools - An array of tools to use
 * @param {OpenAIApi} openai - An OpenAI object to use for processing
 * @param {boolean} [verbose=true] - A flag for verbose logging
 * @return {Promise<{answer: string, thoughts: string}>} An object containing the answer to the question and thoughts on how the answer was reached
 * The 'thoughts' property is a string representation of the conversation between the user and system
 */
async function agentQA(question: string, context: string | null, expertType: string, tools: Tool[], openai: OpenAIApi, verbose: boolean = true): Promise<{ answer: string, thoughts: string }> {
    const systemPrompt = `Facts:
- You are an advanced AI system embedded in a problem-solving application. 
- You have the extensive knowledge of a(n) ${expertType}.
- You keep your responses short and to the point, while still being accurate.
- You are able to access various tools, but only through the user. 
- The user message will contain some context (not instructions), a list of tools, and a question. 
- Your job is to work step-by-step to answer the question as best as possible. 
- To do this you will run a pseudocode program, filling in the spots in brackets and following the control flow paths of the lines starting with '#'. 
- Your response is an OUTPUT of this program.

Program:
\`\`\`
print "I know: [what you know, other than the context]"
print "Thoughts: [think about what to do, can be step-by-step reasoning]"

#If answer found:
  print "Answer: [the answer]"

#Else if tool needed:
  print "Tool needed: [tool name]"
  print "Tool input: [input to the tool]"
\`\`\`

Example responses below.
If the context is "None", the tools are "Calculator, ...", and the question is "Solve 2.417x-6=8" your response should be (without the quotes):
\`I know: I can think step-by-step to get the correct answer.
Thoughts:
- Add 6 to both sides: 2.417=14
- Divide both sides by 2.417. I should use the calculator tool for this.

Tool needed: Calculator
Tool input: 14/2.417\`

Your response can not contain the result from the tool, as you must wait for the user to provide it.

If the question was "what is sourdough, with the tools and context being the same, your response should be:
\`I know: What sourdough is.
Thoughts: 
- Sourdough is a type of bread made using a naturally fermented starter, resulting in a tangy, chewy texture and unique flavor profile.

Answer: Sourdough is a type of tangy, chewy, bread made using a naturally fermented starter.\``
    const userPrompt = `<Context starts>${context}<Context ends>

Tools: 
${tools.map(tool => tool.toModelString()).join("\n")}

Question: ${question}

Reminders: Follow the format in the system message and don't talk to me. You can't actually know the output of the tool until I give it to you.
Begin.`
    const answerExprs = [/Answer:(.*)/, /Tool needed:(.*)/]
    const answerPrefixes = ["Answer:", "Tool needed:"]
    const toolExprs = [/Tool input:(.*)/]
    const toolPrefixes = ["Tool input:"]
    const thread = new ChatThread(openai, [
        { role: "system", content: systemPrompt }
    ])
    let output = await thread.getResponse({ role: "user", content: userPrompt })

    // main loop, try n times
    const n = 4
    for (let i = 0; i < n; i++) {
        const parsed = parseModelOutput(output, answerExprs, toolExprs, null)
        let errorMsg = ""
        parsed.forEach((answer) => {
            if (answer.type === "OutputError") {
                errorMsg += answer.value + "\n"
            }
        })
        if (errorMsg !== "") {
            if (verbose) { console.log(`Got error msg: ${errorMsg}`) }
            // respond to the model with the error and get next response
            output = await thread.getResponse({ role: "user", content: errorMsg })
            if (verbose) { console.log(`Got response to error msg: ${output}`) }
            continue
        }
        // if it's using a tool
        if (parsed.length === 2) {
            const cleaned = parsed.map((answer) =>
                answer.value.replace(answerPrefixes[1], "").replace(toolPrefixes[0], "").replaceAll("\"", "").trim()
            )
            const [toolNeeded, toolInput] = cleaned
            const tool = tools.find((tool) => tool.name.toLocaleLowerCase() === toolNeeded.toLocaleLowerCase())
            if (!tool) {
                // respond to the model with the error and get next response
                output = await thread.getResponse({ role: "user", content: `Tool not found: "${toolNeeded}"` })
                if (verbose) { console.log(`Got response to !tool: ${output}`) }
                continue
            }
            if (verbose) { console.log(`Input to ${tool.name}: ${toolInput}`) }
            const toolResult = await tool.run(toolInput)
            if (verbose) { console.log(`${tool.name} returned: ${toolResult}`) }
            output = await thread.getResponse({
                role: "user",
                content: `${tool.name} returned: \`${toolResult}\`\nIf this is the full answer respond with 'Answer: [answer]', else continue following the system instructions.`
            })
            continue
        }
        // if it's got the answer
        else if (parsed.length === 1) {
            const answer = parsed[0].value.replace(answerPrefixes[0], "").trim()
            if (verbose) { console.log(`Got full thread: ${thread}`) }
            return { answer: answer, thoughts: thread.toString(2) }
        }
        // if it's nothing
        else {
            output = await thread.getResponse({
                role: "user",
                content: `It's fine, you can think. Just remember you have ${n - i - 1} more responses left. Follow the system instructions.`
            })
            continue
        }
    }
    // fallback to simpleQA
    return await simpleQA(question, context, expertType, openai)
}

class Calculator implements Tool {
    name = "Calculator"
    description = "Can perform basic arithmetic and any functions supported by Javascript. Input must be a valid Javascript expression. Be careful to use the correct function for operators like '^'."
    failure_patterns = [
        { expression: /\d*\^\d*/, message: "Calculator Error: '^' is not pow in Javascript. Please use something else." },
        { expression: /var|let|const|for|while|if/, message: "Calculator Error: An expression should not contain multiple lines of code, such as a variable declaration." },
        { expression: /\n-/, message: "Calculator Error: Invalid Javascript expression. It seems you're trying to think inside of the tool input." },
    ]
    async run(input: string): Promise<string> {
        try {
            // Yes this is a vulnerability. I could probably add more checks to the failure_patterns to help.
            return eval(input).toString()
        } catch (e) {
            return `Calculator Error: Invalid Javascript expression. ${(e as Error).message.slice(0, 30)}...`
        }
    }

    toModelString(): string {
        return `{\nname: "${this.name}",\ndescription: "${this.description}"\n}`
    }
}

// not really used due to api limitations
class Wolfram implements Tool {
    name = "Wolfram"
    description = `Wolfram Alpha. Computational and statistical intelligence tool. Good at:
Mathematics: Step-by-Step Solutions, Algebra, Calculus & Analysis, Geometry, Statistics, etc.
Science & Technology: Units & Measures, Physics, Chemistry, Engineering, Computational Sciences, Earth Sciences, Materials, Transportation, etc.
Society & Culture: People, Arts & Media, Dates & Times, Words & Linguistics, Money & Finance, Food & Nutrition, Political Geography, History, etc.
Everyday Life: Personal Health, Personal Finance, Surprises, Entertainment, Household Science, Household Math, Hobbies, Today's World, etc.
Also EXPENSIVE, so use the calculator instead if possible.`
    failure_patterns = []
    wolframID: string
    constructor(key: string) {
        this.wolframID = key
    }
    async run(input: string): Promise<string> {
        const uri = `https://www.wolframalpha.com/api/v1/llm-api?input=${encodeURIComponent(input)}&appid=${this.wolframID}&maxchars=1000`
        try {
            return await $fetch(uri)
        } catch (e) {
            console.log(e)
            return "That's not something WolframAlpha supports."
        }
    }

    toModelString(): string {
        return `{\nname: "${this.name}",\ndescription: "${this.description}"\n}`
    }
}
