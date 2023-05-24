import { Configuration, OpenAIApi } from "openai"


export default defineEventHandler(async (event) => {
    console.log("I'm in get_questions.post.ts")

    //authorization
    const { openaiApiKey: OPENAI_API_KEY } = useRuntimeConfig()
    //prompts
    const { topic, title, context, qNumber, qTypes } = await readBody(event)
    console.log(`qTypes: ${qTypes}`)
    const systemPrompt = `You are embedded in a quiz generator. Your job is to create helpful practice quiz questions given the information in the user message.

Guidelines for creating effective questions:
- Write a question stem that is concise, clear, and relevant to the learning outcome.
- Avoid using irrelevant material, trick questions, negative wording, or double negatives in the question stem.
- Use familiar language and terminology that is appropriate for the target audience.

You may create questions of the following types: ${qTypes}.

Label each question with a number like below:
1. What is the capital of France?
2. The capital of England is ___.
3. True or false: The capital of the U.S. is New York.

Don't inlude answer options. Only follow the syntax above. Every question you generate must be solveable.`

    const userPrompt = `<{Topic}>${topic}<{/Topic}>\n\n<{Quiz}>${title}<{/Quiz}>\n\n<{Context}>${context}\n ${qNumber} questions<{/Context}>\nReminder: Don't talk to me! I just want the questions.`

    const configuration = new Configuration({
        apiKey: OPENAI_API_KEY
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0.5,
        messages: [
            { "role": "system", "content": systemPrompt },
            { "role": "user", "content": userPrompt }
        ],
    })

    console.log(response.data.choices[0].message?.content ?? "")
    return {
        response: response.data.choices[0].message?.content ?? ""
    }
})