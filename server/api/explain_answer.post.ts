import { OpenAI } from "openai-streams/node"


export default defineEventHandler(async (event) => {
    const { question, thoughts } = await readBody(event)
    console.log("In explain_answers: ", question + "\n", thoughts)
    const { openaiApiKey: OPENAI_API_KEY } = useRuntimeConfig()
    const systemPrompt = `Facts:
- The user message will contain a question (with the correct answer marked) and a log from a conversation where an agent solved the question. 
- Your job is to respond with an explanation of how to solve the question in your own words. Assume the reader does not know how to solve the question. Be encouraging and concise. Do not mention the log.`
    const userPrompt = `Question: ${question}\nLog: ${thoughts}\n\nDo not mention the user or assistant in the above conversation.\nYour concise and encouraging explanation is below.`

    const stream = await OpenAI(
        "chat",
        {
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": systemPrompt },
                { "role": "user", "content": userPrompt }
            ],
            stream: true
        },
        { apiKey: OPENAI_API_KEY }
    );
    console.log("streaming...")
    return sendStream(event, stream);
})