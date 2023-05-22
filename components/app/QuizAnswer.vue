<template>
  <div class="flex max-w-full card-clickable" @click="props.clicked">
    <span class="my-1 mr-2 text-xl">{{ props.answer.letter }}. </span>
    <span class="my-1 text-lg"> {{ props.answer.text }}</span>
    <span :class="`material-symbols-outlined ml-2 my-auto text-3xl ${color}`">{{
      icon
    }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  answer: Answer;
  clicked: CallableFunction;
}>();

const icon = ref("");
const color = ref("");
function feedback() {
  //props.clicked();
  if (props.answer.correct) {
    icon.value = "check";
    color.value = "text-green-500";
  } else {
    icon.value = "close";
    color.value = "text-red-500";
  }
}
</script>

<style scoped></style>
