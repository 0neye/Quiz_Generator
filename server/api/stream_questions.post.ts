import { OpenAI } from "openai-streams/node";

//TODO: still doesn't always use the correct question types, fit it.
export default defineEventHandler(async (event) => {
    console.log("I'm in stream_questions.post.ts")

    //authorization
    const { openaiApiKey: OPENAI_API_KEY } = useRuntimeConfig()
    //prompts
    const { topic, title, context, qNumber, qTypes: qTypesString } = await readBody(event)
    console.log(`qTypes: ${qTypesString}`)

    const qTypes = qTypesString.split(",");
    const qTypeOptions = ["Multiple Choice", "Fill-in-the-blank", "True or False"];
    const qTypeExamples = {
        "Multiple Choice": [
            "What is the capital of France?",
            "How was Kennedy assassinated?",
            "The first person to go to space is which of the following?",
        ],
        "Fill-in-the-blank": [
            "The positive root of 2x^2 + 3x - 4 = 0 is ____.",
            "____ was the first person to go to space.",
            "The capital of France is ____.",
        ],
        "True or False": [
            "True or false: An acid makes H+ ions in solution.",
            "True or false: A pointer in programming is an integer that points to the location in memory of another variable.",
            "True or false: The capital of France is New York.",
        ]
    };

    // select examples
    let selectedExamples: string[] = [];
    // if 3 types, 1 example each, if 1 type 3 each, and 2, 2
    const numOfExamplesPerType = qTypes.length === 3 ? 1 : (qTypes.length === 1 ? 3 : 2);
    for (const qType of qTypeOptions) {
        if (qTypesString.includes(qType)) {
            selectedExamples = selectedExamples.concat(
                qTypeExamples[qType].slice(0, numOfExamplesPerType)
            );
        }
    }

    // number them
    selectedExamples.forEach((example, i) => {
        selectedExamples[i] = `${i + 1}. ${example}`
    })

    //console.log(`selectedExamples: ${selectedExamples.join("\n")}`)

    const systemPrompt = `You are embedded in a quiz generator. Your job is to create helpful practice quiz questions given the information in the user message.

Guidelines for creating effective questions:
- Write a question stem that is concise, clear, and relevant to the learning outcome.
- Avoid using irrelevant material, trick questions, negative wording, or double negatives in the question stem.
- Use familiar language and terminology that is appropriate for the target audience.

You may ONLY respond with ${new Intl.ListFormat("en-US", { style: "short", type: "disjunction" }).format(qTypes)} questions.

Label each question with a number like the below examples:
${selectedExamples.join("\n")}

Don't inlude answer options. Only follow the syntax and question types listed above. Every question you generate must be solveable.`
    console.log(systemPrompt)
    const userPrompt = `<{Topic}>${topic}<{/Topic}>\n\n<{Quiz Title}>${title}<{/Quiz Title}>\n\n<{Context}>${context}\n ${qNumber} questions<{/Context}>\nReminder: Don't talk to me! I just want questions of the given types.`

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
