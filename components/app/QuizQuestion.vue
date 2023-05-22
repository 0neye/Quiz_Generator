<template>
  <div class="card flex flex-col justify-center m-auto">
    <!-- question -->
    <div class="flex">
      <span class="text-xl p-2 py-2 border-b-2 my-2 border-gray-500">{{
        question.text
      }}</span>

      <!-- explain button -->
      <span
        v-if="props.question.doneStreaming"
        class="btn m-2 ml-auto flex"
        @click="
          {
            explain();
            showExplanation = showExplanation ? false : true;
          }
        "
      >
        <span class="material-symbols-outlined mr-1"> segment </span>
        <span>Explain</span>
      </span>
      <span v-else class="btn m-2 ml-auto flex hover:cursor-default border-none">
        <span class="material-symbols-outlined mr-1"> segment </span>
        <span>Explain</span>
      </span>
    </div>

    <!-- answer options -->
    <div
      v-for="(answer, index) in question.answers"
      :key="answer.letter"
      class="flex flex-col my-1"
    >
      <div
        :class="`flex max-w-full card-clickable ${answerColors[index]}`"
        :id="index.toString()"
        @click="answerClicked"
      >
        <span class="my-1 mr-2 text-xl" :id="index.toString()"
          >{{ answer.letter }}.
        </span>
        <span class="my-1 text-lg" :id="index.toString()"> {{ answer.text }}</span>
      </div>
    </div>

    <!-- explanation -->
    <div v-if="question.answers.length == 0" class="my-1">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div
      v-if="explanation.length > 0 && showExplanation"
      class="p-2 mt-2 border-2 border-green-500 rounded-lg"
    >
      <div class="px-1 text-xl">Explanation:</div>
      <div class="px-1 pt-2">{{ explanation }}</div>
    </div>
    <div
      v-else-if="explanation.length > 0"
      class="p-2 mt-2 border-2 border-green-500 rounded-lg w-min hover:cursor-pointer"
      @click="
        {
          showExplanation = showExplanation ? false : true;
        }
      "
    >
      Explanation...
    </div>
  </div>
</template>

<script setup lang="ts">
import { Component } from "nuxt/schema";

onMounted(() => {
  if (props.question.explanation) {
    explanation.value = props.question.explanation;
  }
  answerColors.value = new Array(props.question.answers.length).fill("");
});

const guessed = ref(false);
const answerColors = ref([] as string[]);
function answerClicked(event: MouseEvent) {
  if (props.oneTry && guessed.value) {
    // do nothing
    return;
  }
  const index = +(event.target as HTMLElement).id;
  console.log("Inside answerClicked for " + index);
  if (props.oneTry) {
    guessed.value = true;
    // turn the correct answer green
    const correctIndex = props.question.answers.findIndex((answer) => answer.correct);
    answerColors.value[correctIndex] = "text-green-400";
  }
  // turn the clicked answer either red or green
  answerColors.value[index] = props.question.answers[index].correct
    ? "text-green-400"
    : "text-red-400";
}

const explanation = ref("");
const showExplanation = ref(false);

async function explain() {
  if (!props.question.doneStreaming || explanation.value.length > 0) {
    return;
  }
  const stream = await fetch("/api/explain_answer", {
    method: "POST",
    body: JSON.stringify({
      question: props.question.text,
      thoughts: props.question.thoughts,
    }),
  });
  function answerHandler(value: string) {
    //runs for every new token in the stream
    explanation.value += value;
  }
  await parseStream(stream, answerHandler);
  console.log(explanation.value);
  props.editQuestion(
    props.question,
    (question: Question) => (question.explanation = explanation.value)
  );
}

const props = defineProps<{
  question: Question;
  oneTry: boolean;
  editQuestion: (question: Question, callback: CallableFunction) => void;
}>();
</script>

<style scoped></style>
