<template>
  <client-only placeholder="Loading...">

    <Head>
      <Title>Quiz | {{ store.getQuiz(+topic, +quiz)?.title }}</Title>
      <Meta name="description" :content="store.getQuiz(+topic, +quiz)?.description" />
    </Head>
    <nav></nav>
    <div class="flex flex-col gap-10">
      <div class="quiz" v-for="question in questions" :key="question.text">
        <QuizQuestion :question="question" :edit-question="editQuestion" :oneTry="oneTry" />
      </div>
    </div>
    <div class="p-16"></div>
  </client-only>
</template>

<script setup lang="ts">
import { useTopicStore } from "~~/stores/topics";

const store = useTopicStore();

const { topic, quiz } = useRoute().params;

let questions = ref([] as Question[]);
const oneTry = computed(() => store.getQuiz(+topic, +quiz)?.settings.oneTry);

definePageMeta({
  layout: "quiz",
  middleware: "actual-route-params",
});
onMounted(() => {
  store.loadState();
  // console.log("quiz mounted")
  // console.log(store.getTopic(+topic)?.quizzes)
  questions.value = store.getQuiz(+topic, +quiz)?.questions;
  if (questions.value.length === 0) {
    streamQuiz();
  }
});

//const reload = ref(1);

function reRender() {
  //questions = store.getQuiz(+topic, +quiz)?.questions
  store.editQuiz(+topic, +quiz, (quiz: Quiz) => {
    quiz.questions = questions.value;
  });
  //reload.value++;
}
function editQuestion(question: Question, callback: CallableFunction) {
  store.editQuiz(+topic, +quiz, (quiz: Quiz) => {
    const idx = quiz.questions.findIndex((q) => q.text === question.text);
    callback(quiz.questions[idx]);
  });
}

let quizText = "";

// async function streamQuiz() {
//     const stream = await fetch('/api/model', {
//         method: 'POST',
//         body: JSON.stringify({
//             topic: `Title: ${store.getTopic(+topic)?.title}\nDescription: ${store.getTopic(+topic)?.description}`,
//             quiz: `${store.getQuiz(+topic, +quiz)?.title}`,
//             context: `${store.getQuiz(+topic, +quiz)?.description}`
//         }),
//     });

//     function helper(value: string) {
//         quizText += value
//         console.log(quizText);
//         questions = parseQuiz(quizText) //causes constant answer order randomization and flickering (TODO: fix)
//         reRender()
//     }

//     parseStream(stream, helper);
// }
async function streamQuiz() {
  let questionsText = "";
  const thisSeed = Math.random();
  const q = store.getQuiz(+topic, +quiz);

  if (!q.settings.fast) {
    //fetch question text
    const questionStream = await fetch("/api/stream_questions", {
      method: "POST",
      body: JSON.stringify({
        topic: `Title: ${store.getTopic(+topic)?.title}\nDescription: ${store.getTopic(+topic)?.description
          }`,
        title: `${q?.title}`,
        context: `${q?.description}`,
        qNumber: `${q?.settings.questionNumber}`,
        qTypes: q?.settings.questionTypes?.join(", "),
      }),
    });
    function questionHandler(value: string) {
      //runs for every new token in the stream
      questionsText += value;
      console.log(questionsText);
      questions.value = parseQuiz(questionsText);
      // const questions = parseQuiz(questionsText)
      // store.editQuiz(+topic, +quiz, (quiz: Quiz) => {
      //     quiz.questions = questions
      // })
      reRender();
    }
    console.log("Streaming questions...");
    await parseStream(questionStream, questionHandler);
    console.log("Finished streaming questions...");

    //go through questions
    for (let index = 0; index < questions.value.length; index++) {
      //questions.value.forEach(async (question, index) => {
      const question = questions.value[index];

      console.log("Looping questions. On: " + question.text);
      //fetch correct answer and thought process
      const { data } = await useFetch("/api/solve_problem", {
        method: "POST",
        body: {
          input: question.text,
          context: `${store.getQuiz(+topic, +quiz)?.description}`,
        },
      });

      console.log(`Got data from solver: ${JSON.stringify(data)}`);
      const answer = data.value?.data.answer;
      const thoughts = data.value?.data.thoughts;
      console.log(`Thoughts is null: ${thoughts === null || thoughts === undefined}`);

      let answerText = "";

      //fetch answer options
      const answerStream = await fetch("/api/stream_answers", {
        method: "POST",
        body: JSON.stringify({
          question: question.text,
          answer: answer,
        }),
      });
      function answerHandler(value: string) {
        //runs for every new token in the stream
        answerText += value;
        const thisQuestionText = `${index + 1}. ` + question.text + "\n" + answerText;
        //console.log(thisQuestionText);
        const thisQuestion = parseQuiz(thisQuestionText, thisSeed)[0];
        //console.log("ThisQuestion: ", thisQuestion);
        [questions.value[index].text, questions.value[index].answers] = [
          thisQuestion.text,
          thisQuestion.answers,
        ];
        reRender();
      }
      if (thoughts) {
        questions.value[index].thoughts = thoughts;
      }
      await parseStream(answerStream, answerHandler);
      questions.value[index].doneStreaming = true;
      console.log(`Finished streaming answers for question ${index + 1}`);
    } //);
    quizText += questionsText;
    console.log(quizText);
  } else {
    // faster but less accurate
    const stream = await fetch("/api/fast", {
      method: "POST",
      body: JSON.stringify({
        topic: `Title: ${store.getTopic(+topic)?.title}\nDescription: ${store.getTopic(+topic)?.description
          }`,
        title: `${store.getQuiz(+topic, +quiz)?.title}`,
        context: `${store.getQuiz(+topic, +quiz)?.description}`,
      }),
    });

    function helper(value: string) {
      quizText += value;
      console.log(quizText);
      questions.value = parseQuiz(quizText, thisSeed);
      reRender();
    }

    parseStream(stream, helper);
  }
}
</script>

<style scoped></style>
