import { OpenAI } from "openai-streams/node";


export default defineEventHandler(async (event) => {
    console.log("I'm in stream_answers.post.ts")

    //authorization
    const { openaiApiKey: OPENAI_API_KEY } = useRuntimeConfig()
    //prompts
    const systemPrompt = `You are embedded in a quiz generator.

Guidelines for creating effective answer options:
- Write only one correct or best answer that is clear and unambiguous.
- Write two or three distractors that are plausible and similar in length and level of detail to the correct answer (ignore for T/F questions).
- Avoid using grammatical or spelling clues that can indicate the correct answer.
- Avoid using easy or silly distractors that can be easily eliminated.

Your response should include 2-4 answer options (lettered) to the provided question, and only 2 for T/F questions.
One of the answers MUST be the correct one as provided in the user message.
You will say which answer is correct at the end with "ANSWER: [correct answer]".

For example, if the provided question is "What is the capital of France?" and the provided correct answer is "Paris", your response should be (without the quotes):
'A. London
B. Paris
C. Berlin
D. New York
ANSWER: B'

Only respond with answer options and the correct answer at the end. Only follow the syntax above. Letter your answer options.`

    const { question, answer } = await readBody(event)
    const userPrompt = `Question: "${question}"\n\nCorrect answer: "${answer || "<null>"}"`
    console.log(`${userPrompt}`)
    const stream = await OpenAI(
        "chat",
        {
            model: process.env.OPENAI_MODEL,
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

    // ======================================================
    // POTENTIAL ALTERNATIVE PROMPT
    // ======================================================

    // Given the topic, quiz title, question, correct answer, and the difficulty level, create multiple-choice question options. The options have to be in line with the given subject matter and suitable for the stated difficulty level. Make sure to generate one correct answer (that matches the provided correct answer) and two or three plausible, but incorrect options that could potentially mislead someone who does not know the correct answer. For true/false questions, only generate two options. Do not use grammatical or spelling hints that may reveal the correct answer and avoid creating easily dismissable options. The generated options should be lettered and followed by the correct answer, indicated with 'ANSWER: [Letter]'. For example, if the question is "What color is the sky during a clear daytime?" and the correct answer is "Blue", your output could be something like:

    // A. Green
    // B. Blue
    // C. Red 
    // D. Yellow
    // ANSWER: B




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
