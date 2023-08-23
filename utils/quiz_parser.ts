/**

Parses a quiz from a string input and returns an array of question objects.
@param input - The input string containing the quiz.
@param seed - The optional seed for shuffling the answer options. Default is Math.random().
@returns An array of question objects with text, thoughts, and answer properties. */
export function parseQuiz(input: string, seed: number = Math.random()): Question[] {
    const questions: Question[] = [];
    const lines = input.split("\n");
    let question: Question | null = null; // declare the variable here
    let inThoughts = false;
    let inQuestionText = false;

    for (let line of lines) {
        line = line.trim();
        if (/^\d+\./.test(line)) {
            // new question
            inQuestionText = true;
            question = {
                text: line.replace(/^\d+\.\s*/, ""),
                thoughts: "",
                answers: [],
                doneStreaming: false,
                explanation: ""
            };
            questions.push(question);
        } else if (line.startsWith("-{thinking}-")) {
            // start of thoughts section
            inThoughts = true;
            inQuestionText = false;
        } else if (line.startsWith("-{end thinking}-")) {
            // end of thoughts section
            inThoughts = false;
        } else if (inThoughts) {
            // part of thoughts section
            question!.thoughts += line + "\n";
        } else if (/^([a-z]|[A-Z])\./.test(line)) {
            inQuestionText = false;
            // answer option
            const answer: Answer = {
                letter: line[0].toUpperCase(),
                text: line.replace(/^([a-z]|[A-Z])\.\s*/, ""),
                correct: false,
            };
            if (/\(correct\)/.test(answer.text)) {
                // correct answer
                answer.correct = true;
                answer.text = answer.text.replace(/\s*\(correct\)/, "");
            }
            question!.answers.push(answer);
        }
        // to support a secondary format
        else if (/^ANSWER:/.test(line)) {
            inQuestionText = false
            // get the correct letter
            const correctLetter = line.replace(/^ANSWER:\s*/, "").toUpperCase();
            // set the correct answer
            question!.answers.forEach((answer) => {
                if (answer.letter === correctLetter) {
                    answer.correct = true;
                }
            })
        }
        else if (inQuestionText && question && line !== 'A') {
            // add the line to the question text
            question!.text += "\n" + line;
        }
    }

    // shuffle answers
    questions.forEach((question) => {
        shuffle(question.answers, seed);
    })

    return questions;
}

function shuffle(array: Answer[], seed: number): Answer[] {
    function random(seed: number): number {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }
    let m = array.length, t, i;
    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(random(seed) * m--);
        // And swap it with the current element.
        t = array[m].letter;
        array[m].letter = array[i].letter;
        array[i].letter = t;
        ++seed;
    }
    return array.sort((a, b) => a.letter.localeCompare(b.letter));
}