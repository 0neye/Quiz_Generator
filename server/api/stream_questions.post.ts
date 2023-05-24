import { OpenAI } from "openai-streams/node";


export default defineEventHandler(async (event) => {
    console.log("I'm in stream_questions.post.ts")

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


    // let answer = ""
    // for await (const token of streamChatCompletion(messages)) {
    //     console.log(token)
    //     answer += token
    // }

    // const completion = await openai.createChatCompletion({
    //     model: "gpt-3.5-turbo",
    //     messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    // });

    // console.log(completion.data.choices[0].message)
    // const parsed = parseQuiz(completion.data.choices[0].message?.content ?? "")
    // return {
    //     quiz: parsed
    // }
    // const parsed = parseQuiz(answer)
    // return {
    //     quiz: parsed
    // }




    //https://github.com/openai/openai-node/issues/18#issuecomment-1483808526
    // async function* streamChatCompletion(messages: any) {
    //     const response = await openai.createChatCompletion(
    //         {
    //             model: 'gpt-3.5-turbo',
    //             messages,
    //             stream: true,
    //         },
    //         {
    //             responseType: 'stream',
    //         },
    //     )

    //     for await (const chunk of response.data) {
    //         const lines = chunk
    //             .toString('utf8')
    //             .split('\n')
    //             .filter((line: string) => line.trim().startsWith('data: '))

    //         for (const line of lines) {
    //             const message = line.replace(/^data: /, '')
    //             if (message === '[DONE]') {
    //                 return
    //             }

    //             const json = JSON.parse(message)
    //             const token = json.choices[0].delta.content
    //             if (token) {
    //                 yield token
    //             }
    //         }
    //     }
    // }
