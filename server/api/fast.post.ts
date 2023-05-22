// import { Configuration, OpenAIApi } from "openai"
import { OpenAI } from "openai-streams/node";


// A fast single-prompt single-response way to generate a quiz.
export default defineEventHandler(async (event) => {
    //const { Configuration, OpenAIApi } = require("openai")
    console.log("I'm in fast.post.ts")

    //authorization
    const { openaiApiKey: OPENAI_API_KEY } = useRuntimeConfig()
    // const configuration = new Configuration({
    //     apiKey: OPENAI_API_KEY
    // });
    // const openai = new OpenAIApi(configuration)

    const { topic, title, context, qNumber, qTypes } = await readBody(event)

    //prompts
    const systemPrompt = `You are embedded in a quiz generator. Your job is to create correct and helpful practice quizzes given the information in the user message. Your quizzes should consist of several multiple-choice questions (numbered) each with 3 or 4 answer options, with one being correct. Be mindful to follow syntax as a parser will be relying on it to be consistent.

You may only create questions of the following types: ${qTypes}.
After writing the question sentence, you will start a "thought" block with the syntax '-{thinking}-', perform your reasoning, or say that none is needed, and then end it with '-{end thinking}-'. You MUST perform this thinking step for each question before giving the answer options, even if just to say none is needed. At the end of the answer options you will specify the correct one as shown in the examples below.

'1. ____ is the capital of France.
-{thinking}-
No further thought is needed.
-{end thinking}-
A. Bruges
B. Washington D. C.
C. Paris
D. London
CORRECT: C'

'2. True or false: A pointer in programming is an integer that points to the location in memory of another variable.
-{thinking}-
I know what a pointer is. This is true.
-{end thinking}-
A. True
B. False
CORRECT: A'

'3. What is the value of X in this equation "2X+25=-3"?
-{thinking}-
This requires step-by-step reasoning.
- Subtract 25 from both sides of the equation: 2X+25-25=-3-25
- Simplify: 2X=-28
- Divide both sides by 2: (2X)/2=(-28)/2
- Simplify: X=-14
- Therefore, the value of X is -14.
-{end thinking}-
A. 25
B. 15
C. -15
D. -14
CORRECT: D'

Do NOT include any syntax that is not present in the above examples.
Do NOT preface the questions with "Question:", the parser already knows what a question is.

ALWAYS perform thinking for problems that require multiple steps, such as equation solving.

Do NOT respond to the user's message in any way that is not the questions of the quiz or a thinking block. Responses such as "Of course! I'm happy to help" or "Here is your quiz:" are not allowed as that would break the parser. Begin.`
    const userPrompt = `<{Topic}>${topic}<{/Topic}>\n\n<{Quiz}>${title}<{/Quiz}>\n\n<{Context}>${context}\n ${qNumber} questions<{/Context}> Reminder: Don't talk to me! I just want the quiz. Also, don't forget to think step-by-step when needed.`

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
