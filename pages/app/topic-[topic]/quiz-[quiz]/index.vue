<template>
  <client-only placeholder="Loading...">
    <Head>
      <Title>Quiz | {{ store.getQuiz(+topic, +quiz)?.title }}</Title>
      <Meta name="description" :content="store.getQuiz(+topic, +quiz)?.description" />
    </Head>

    <nav></nav>
    <div class="flex flex-col gap-10" :key="reRender">
      <div class="quiz" v-for="(_, i) in questions">
        <QuizQuestion
          :quiz="+quiz"
          :topic="+topic"
          :question-index="i"
          :oneTry="oneTry"
        />
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
let oneTry = false;
const reRender = ref(0); //weird hack to get it to work

definePageMeta({
  layout: "quiz",
  middleware: "actual-route-params", // get around layouts not being able to access all route params
});
onMounted(() => {
  store.loadState();
  // console.log("quiz mounted")
  // console.log(store.getTopic(+topic)?.quizzes)
  update();

  const thisQuiz = store.getQuiz(+topic, +quiz);
  // if any questions are not done straming, and it is currently not being streamed
  if (
    thisQuiz.questions.length !== thisQuiz.settings.questionNumber ||
    (thisQuiz.questions.some((q) => !q.doneStreaming) && !thisQuiz.streaming)
  ) {
    streamQuiz(store, +topic, +quiz, update);
  }

  oneTry = store.getQuiz(+topic, +quiz)?.settings.oneTry;
});

// Updates the quiz ref, passed to the streamQuiz function
function update() {
  questions.value = store.getQuiz(+topic, +quiz)?.questions;
  //console.log("update");
  reRender.value++;
}
</script>

<style scoped></style>
