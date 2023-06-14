

async function streamQuestionsText(store: any, topic: number, q: Quiz, update: CallableFunction) {
    const test = q.questions[q.questions.length - 1]?.text;
    if (test !== undefined && test !== "") return;

    // fetch questions text
    const questionStream = await fetch("/api/stream_questions", {
        method: "POST",
        body: JSON.stringify({
            topic: `Title: ${store.getTopic(topic)?.title}\nDescription: ${store.getTopic(topic)?.description
                }`,
            title: `${q?.title}`,
            context: `${q?.description}`,
            qNumber: `${q?.settings.questionNumber}`,
            qTypes: q?.settings.questionTypes?.join(", "),
        }),
    });
    let questionsText = "";

    // runs for every new token in the stream
    function questionHandler(value: string) {
        questionsText += value;
        //console.log(questionsText);
        // update the quiz in the store
        store.editQuiz(topic, q.id, (quiz: Quiz) => {
            quiz.questions = parseQuiz(questionsText);
        });
        // update the quiz in the component
        update();
    }
    console.log("Streaming questions text...");
    await parseStream(questionStream, questionHandler);
}

async function getCorrectAnswer(question: Question, context: string): Promise<{ answer: string, thoughts: string }> {

    //fetch correct answer and thought process
    const { data } = await useFetch("/api/solve_problem", {
        method: "POST",
        body: {
            input: question.text,
            context: context,
        },
    });

    console.log(`Got data from solver: ${JSON.stringify(data)}`);
    const answer = data.value?.data.answer || "";
    const thoughts = data.value?.data.thoughts || "";
    console.log(`Thoughts is null: ${thoughts === null || thoughts === undefined}`);

    return { answer, thoughts };
}

async function streamQuestionAnswers(store: any, topic: number, q: Quiz, update: CallableFunction) {
    const thisSeed = Math.random();

    //let quizText = "";
    // go through questions
    for (let index = 0; index < q?.questions.length; index++) {
        //questions.value.forEach(async (question, index) => {
        const question = q.questions[index];
        if (question.doneStreaming) continue;

        console.log("Looping questions. On: " + question.text);
        // console.log("Streamstep: " + question.streamStep);

        let answer, thoughts;
        if (question.text != "") {
            // get correct answer
            let res = await getCorrectAnswer(question, q.description);
            answer = res.answer;
            thoughts = res.thoughts;

            if (thoughts) {
                q.questions[index].thoughts = thoughts;
                console.log("Saved thoughts");
            }
        }

        let answerText = "";
        // TODO: add correct answer to questions in store
        if (answer) {

            // fetch answer options
            const answerStream = await fetch("/api/stream_answers", {
                method: "POST",
                body: JSON.stringify({
                    question: question.text,
                    answer: answer,
                }),
            });

            //let questionText = "";
            // runs for every new token in the stream
            function answerHandler(value: string) {
                answerText += value;
                const thisQuestionText = `${index + 1}. ` + question.text + "\n" + answerText;
                //questionText = thisQuestionText + "\n";
                //console.log(thisQuestionText);
                const thisQuestion = parseQuiz(thisQuestionText, thisSeed)[0];
                //console.log("ThisQuestion: ", thisQuestion);

                // update the question in the store
                store.editQuiz(topic, q.id, (quiz: Quiz) => {
                    quiz.questions[index].text = thisQuestion.text;
                    quiz.questions[index].answers = thisQuestion.answers;
                });
                // update the question in the component
                update();
            }
            await parseStream(answerStream, answerHandler);

            console.log(`Finished streaming answers for question ${index + 1}`);
            //quizText += questionText;

            // set done streaming
            store.editQuiz(topic, q.id, (quiz: Quiz) => {
                quiz.questions[index].doneStreaming = true;
            })
        }
    }
    //console.log("Quiz text: " + quizText);
}


export async function streamQuiz(store: any, topic: number, quiz: number, update: CallableFunction) {

    // warn the user if they try to reload the page
    window.onbeforeunload = function (event) {
        //event.preventDefault();
        store.editQuiz(topic, quiz, (quiz: Quiz) => {
            quiz.streaming = false;
        })
        event.returnValue = null;
        return null;
    };

    // flag the quiz as currently streaming
    store.editQuiz(topic, quiz, (quiz: Quiz) => {
        quiz.streaming = true;
    })

    // // set all questions stream step to not started
    // store.editQuiz(topic, quiz, (quiz: Quiz) => {
    //     quiz.questions?.forEach(async (question) => {
    //         if (question.streamStep !== 4) { // if not done
    //             question.streamStep = 0; // set to not started
    //         }
    //     })
    // })

    const q: Quiz = store.getQuiz(topic, quiz);
    console.log("Streaming quiz: " + q);

    if (!q.settings.fast) {
        // first get the question text
        await streamQuestionsText(store, topic, q, update);

        // then get the answers
        await streamQuestionAnswers(store, topic, q, update);

    } else if (q.questions.length != q.settings.questionNumber) {
        // TODO: fix no answer showing as correct despite correct format (maybe in parser)
        // faster but less accurate
        const stream = await fetch("/api/fast", {
            method: "POST",
            body: JSON.stringify({
                topic: `Title: ${store.getTopic(topic)?.title}\nDescription: ${store.getTopic(topic)?.description
                    }`,
                title: `${store.getQuiz(topic, quiz)?.title}`,
                context: `${store.getQuiz(topic, quiz)?.description}`,
                qNumber: `${q?.settings.questionNumber}`,
                qTypes: q?.settings.questionTypes?.join(", "),
            }),
        });

        const thisSeed = Math.random();
        let quizText = "";
        function helper(value: string) {
            quizText += value;
            //console.log(quizText);
            store.editQuiz(topic, q.id, (quiz: Quiz) => {
                quiz.questions = parseQuiz(quizText, thisSeed);

                // set done streaming for all but the last question
                for (let index = 0; index < quiz.questions.length - 1; index++) {
                    quiz.questions[index].doneStreaming = true;
                }
            });
            update();
        }

        await parseStream(stream, helper);
        //console.log("Quiz text: \n" + quizText);

        // set done streaming for the last question
        store.editQuiz(topic, q.id, (quiz: Quiz) => {
            quiz.questions[quiz.questions.length - 1].doneStreaming = true;
        })
    }

    // reset the warning
    window.onbeforeunload = null;

    // reset streaming
    store.editQuiz(topic, quiz, (quiz: Quiz) => {
        quiz.streaming = false;
    })
}