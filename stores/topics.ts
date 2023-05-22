import { defineStore } from "pinia"

export const useTopicStore = defineStore('topicStore', () => {
    let topics = reactive([] as Topic[])
    const setTopic = (value: Topic) => {
        // set if exists
        const index = topics.findIndex(t => t.id === value.id)
        if (index !== -1) {
            topics[index] = value
        }
        // add if not exists
        else {
            topics.push(value)
        }
        saveState()
    }

    const addTopic = (title: string, description: string) => {
        const newTopic: Topic = {
            id: topics.length,
            title,
            description,
            quizzes: []
        }
        setTopic(newTopic)
        saveState()
    }

    const editTopic = (key: number, action: CallableFunction) => {
        action(topics[key])
        saveState()
    }

    const addQuiz = (key: number, title: string, description: string, questions: Question[], settings: QuizSettings) => {
        const newQuiz: Quiz = {
            id: topics[key].quizzes.length,
            title,
            description,
            questions,
            settings
        }
        topics[key].quizzes.push(newQuiz)
        saveState()
    }

    const removeQuiz = (topicId: number, quizId: number) => {
        topics[topicId].quizzes = topics[topicId].quizzes.filter(q => q.id !== quizId)
        saveState()
    }

    const setQuiz = (key: number, quiz: Quiz) => {
        // set if exists
        const index = topics[key].quizzes.findIndex(q => q.id === quiz.id)
        if (index !== -1) {
            topics[key].quizzes[index] = quiz
        }
        // add if not exists
        else {
            topics[key].quizzes.push(quiz)
        }
        saveState()
    }

    const getQuiz = (topicId: number, quizId: number) => {
        return topics[topicId].quizzes[quizId]
    }

    const editQuiz = (topicId: number, quizId: number, action: CallableFunction) => {
        action(topics[topicId].quizzes[quizId])
        saveState()
    }

    const getTopic = (key: number) => {
        return topics[key]
    }

    const getTopics = () => {
        return topics
    }

    const getQuizzes = (key: number) => {
        return topics[key]?.quizzes || []
    }

    const removeTopic = (key: number) => {
        topics = topics.filter(t => t.id !== key)
        saveState()
    }

    const saveState = () => {
        if (process.client) {
            //go through and set each topic and quiz id to its index in the array
            topics.forEach((topic, index) => {
                topic.id = index
                topic.quizzes.forEach((quiz, quizIndex) => {
                    quiz.id = quizIndex
                })
            })
            console.log("saveState")
            localStorage.setItem('topics', JSON.stringify(topics))
        }
    }

    const loadState = () => {
        if (process.client) {
            console.log("loadState")
            const loaded = localStorage.getItem('topics')
            if (topics) {
                topics = JSON.parse(loaded?.toString() || '[]')
            }
            else {
                topics = []
            }
        }
    }

    return { topics, getTopics, setTopic, addTopic, editTopic, addQuiz, removeQuiz, setQuiz, editQuiz, getQuiz, getQuizzes, getTopic, removeTopic, saveState, loadState }
})