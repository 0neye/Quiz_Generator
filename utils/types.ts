interface Answer {
    letter: string
    text: string
    correct: boolean
}

interface Question {
    text: string
    answers: Answer[]
    doneStreaming: boolean
    thoughts: string | null
    explanation: string | null
}
interface Quiz {
    id: number // unique identifier
    title: string // quiz title
    description: string // quiz description
    questions: Question[] // array of question objects
    settings: QuizSettings
}
interface QuizSettings {
    questionNumber: number // number of questions
    questionTypes: string[] // array of question types
    fast: boolean // use the fast mode
    oneTry: boolean // each question has one try
}

interface Topic {
    id: number
    title: string
    description: string
    quizzes: Quiz[]
}

interface APIKey {
    name: string
    key: string
}