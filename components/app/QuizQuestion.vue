<template>
  <client-only>
    <div class="card flex flex-col justify-center m-auto">
      <!-- question -->
      <div class="flex">
        <div class="text-xl p-2 py-2 border-b-2 my-2 border-gray-500">
          <p v-for="line in question.text.split('\n')">{{ line }}</p>
        </div>

        <!-- explain button -->
        <span v-if="question?.doneStreaming" class="btn m-2 ml-auto flex mb-auto" @click="
                    {
          explain();
          showExplanation = showExplanation ? false : true;
        }
          ">
          <span class="material-symbols-outlined mr-1"> segment </span>
          <span>Explain</span>
        </span>
        <span v-else class="btn m-2 ml-auto flex hover:cursor-default border-none mb-auto">
          <span class="material-symbols-outlined mr-1"> segment </span>
          <span>Explain</span>
        </span>
      </div>

      <!-- answer options -->
      <div v-for="(answer, index) in question?.answers" :key="answer.letter" class="flex flex-col my-1">
        <div :class="`flex max-w-full card-clickable ${answerColors[index]}`" :id="index.toString()"
          @click="answerClicked">
          <span class="my-1 mr-2 text-xl" :id="index.toString()">{{ answer.letter }}.
          </span>
          <span class="my-1 text-lg" :id="index.toString()"> {{ answer.text }}</span>
        </div>
      </div>

      <!-- explanation -->
      <div v-if="question?.answers?.length == 0" class="my-1">
        <v-progress-linear indeterminate></v-progress-linear>
      </div>
      <div v-if="explanation.length > 0 && showExplanation" class="p-2 mt-2 border-2 border-green-500 rounded-lg">
        <div class="px-1 text-xl">Explanation:</div>
        <div class="px-1 pt-2">{{ explanation }}</div>
      </div>
      <div v-else-if="explanation.length > 0"
        class="p-2 mt-2 border-2 border-green-500 rounded-lg w-min hover:cursor-pointer" @click="
                  {
          showExplanation = showExplanation ? false : true;
        }
          ">
        Explanation...
      </div>
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { parseStream } from "~~/utils/stream_parser"; //weird i have to do this
import { useTopicStore } from "~~/stores/topics";
const store = useTopicStore();

const guessed = ref(false);
const answerColors = ref([] as string[]);

const question = ref({} as Question);

onMounted(() => {
  question.value = store.getQuiz(props.topic, props.quiz)?.questions[props.questionIndex];
  //console.log("Question: ", question.value);
  if (question.value?.explanation) {
    explanation.value = question.value?.explanation;
  }
  answerColors.value = new Array(question.value?.answers?.length).fill("");
});

/**
 * Handle the click event triggered when an answer is clicked.
 * One Try? Sets the correct answer to green and, if applicable, the clicked red. Stops the user from clicking another option after.
 * Otherwise, sets the clicked answer to red or green based on whether the answer is correct.
 *
 * @param {MouseEvent} event - The click event triggered when an answer is clicked.
 * @return {void} This function does not return any value.
 */
function answerClicked(event: MouseEvent) {
  if (props.oneTry && guessed.value) {
    // do nothing
    return;
  }
  const index = +(event.target as HTMLElement).id;
  //console.log("Inside answerClicked for " + index);
  if (props.oneTry) {
    guessed.value = true;
    // turn the correct answer green
    const correctIndex = question.value?.answers.findIndex((answer) => answer.correct);
    answerColors.value[correctIndex] = "text-green-400";
  }
  // turn the clicked answer either red or green
  answerColors.value[index] = question.value?.answers[index].correct
    ? "text-green-400"
    : "text-red-400";
}

const explanation = ref("");
const showExplanation = ref(false);

/**
 * Asynchronously fetches an explanation for a question and sets it on the current question.
 * If the question has not finished streaming or already has an explanation, this function does nothing.
 *
 * @return {void} Nothing is returned.
 */
async function explain() {
  if (!question.value?.doneStreaming || explanation.value.length > 0) {
    return;
  }
  const stream = await fetch("/api/explain_answer", {
    method: "POST",
    body: JSON.stringify({
      question: question.value?.text,
      thoughts: question.value?.thoughts,
    }),
  });
  function answerHandler(value: string) {
    //runs for every new token in the stream
    explanation.value += value;
  }
  await parseStream(stream, answerHandler);
  console.log(explanation.value);
  // props.editQuestion(
  //   props.question,
  //   (question: Question) => (question.explanation = explanation.value)
  // );
  store.editQuiz(
    props.topic,
    props.quiz,
    (q: Quiz) => (q.questions[props.questionIndex].explanation = explanation.value)
  );
}

const props = defineProps<{
  // question: Question;
  oneTry: boolean;
  // editQuestion: (question: Question, callback: CallableFunction) => void;
  topic: number;
  quiz: number;
  questionIndex: number;
}>();
</script>

<style scoped></style>
