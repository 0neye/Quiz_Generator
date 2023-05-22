export default defineNuxtRouteMiddleware((to) => {
    console.log('Middleware', to.params.topic, to.params.quiz)
    const topic = useState('topicID', () => "")
    const quiz = useState('quizID', () => "")
    topic.value = to.params.topic as string
    quiz.value = to.params.quiz as string
})