import { OpenAI } from "openai-streams/node";


export default defineEventHandler(async (event) => {
    console.log("I'm in stream_answers.post.ts")

    //authorization
    const { openaiApiKey: OPENAI_API_KEY } = useRuntimeConfig()
    //prompts
    const systemPrompt = `You are embedded in a quiz generator. Your job is to create helpful practice quiz answer options given the questions and context in the user message.

Guidelines for creating effective answer options:
- Write only one correct or best answer that is clear and unambiguous.
- Write two or three distractors that are plausible and similar in length and level of detail to the correct answer (ignore for T/F questions).
- Avoid using grammatical or spelling clues that can indicate the correct answer.
- Avoid using easy or silly distractors that can be easily eliminated.

Your response should include 2-4 answer options (lettered) to the provided question, and only 2 for T/F questions.
One of the answers MUST be the correct one as provided in the user message. 
You will say which answer is correct at the end with "ANSWER: [correct answer]". This is the Aiken format.

For example, if the provided question is "What is the capital of France?" and the provided correct answer is "Paris", your response should be (without the quotes):
'A. London
B. Paris
C. Berlin
D. New York
ANSWER: B'

Only respond with answer options and the correct answer at the end. Only follow the syntax above.
    `

    const { question, answer } = await readBody(event)
    const userPrompt = `<{Question}>${question}<{/Question}>\n\n<{Correct Answer}>${answer || "None given, use your own knowledge"}<{/Correct Answer}>\nReminder: Don't talk to me! I just want the answer options.`
    console.log(`${userPrompt}`)
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
})
