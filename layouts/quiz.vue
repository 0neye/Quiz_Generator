<template>
  <Head>
    <Title>Quiz Generator | Quizzes</Title>
    <Meta name="description" content="Quiz Generator" />
  </Head>
  <header class="shadow-sm">
    <div class="fixed top-0 w-full z-10">
      <nav class="flex items-center justify-between px-8 py-4 dark:bg-gray-950">
        <NuxtLink class="flex items-center space-x-2" to="/">
          <img src="../assets/images/logo.png" alt="Logo" class="h-8 w-8" />
          <span class="text-2xl font-bold">anyquiz</span>
        </NuxtLink>
        <div class="flex gap-3">
          <div class="btn flex" @click="copyQuiz">
            <span class="material-symbols-outlined mr-1">content_copy</span>
            <span>Copy Quiz</span>
          </div>
          <div class="flex">
            <NuxtLink :to="`/app/topic-${topic}`" class="flex btn">
              <span class="material-symbols-outlined mr-1">quiz</span>
              <span>Quizzes</span>
            </NuxtLink>
          </div>
        </div>
      </nav>
    </div>
  </header>
  <main class="mt-16">
    <!-- page content -->
    <div class="mx-auto p-4">
      <slot />
    </div>
  </main>
</template>

<script setup lang="ts">
// uses 'actual-route-params' middleware
// gets around layouts not being able to access all route params
const topic = useState("topicID").value as number;
const quiz = useState("quizID").value as number;
let store = useTopicStore();

onMounted(() => {
  store = useTopicStore(); // reload the store
  console.log(`topic: ${topic}, quiz: ${quiz}`);
  console.log(store.getQuiz(+topic, +quiz));
});

const copyQuiz = () => {
  // reconstruct the quiz text (sadly can't pull this from the child component)
  const text = store
    .getQuiz(+topic, +quiz)
    .questions.map((q, index) => {
      return (
        `${index + 1}. ${q.text}` +
        q.answers
          .map((a) => {
            return `\n${a.letter}. ${a.text} ${a.correct ? "(correct)" : ""}`;
          })
          .join("")
      );
    })
    .join("\n\n");

  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Text copied to clipboard");
    })
    .catch((error) => {
      console.error("Failed to copy text: ", error);
    });
};
</script>

<style scoped>
/* .router-link-exact-active {
    border-color: rgb(52 211 153);
    box-shadow: 0 0 0.5em rgb(52 211 153);
} */
</style>
