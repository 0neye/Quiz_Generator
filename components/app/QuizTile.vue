<template>
    <div class="pos-rel">
        <span class="material-symbols-outlined pos-abs ml-auto btn-small hover:cursor-pointer close-button"
            @click="deleteThis">close</span>
        <NuxtLink :to="`/app/topic-${topicId}/quiz-${quizId}`">
            <div class="card-clickable">
                <div class="font-semibold text-xl">
                    <h3>
                        <slot name="title" class="truncate"></slot>
                    </h3>
                </div>
                <p class="description">
                    <slot></slot>
                </p>
            </div>
        </NuxtLink>
    </div>
</template>

<script setup lang="ts">
import { useTopicStore } from "~~/stores/topics";
const store = useTopicStore();

function deleteThis() {
    store.removeQuiz(props.topicId, props.quizId);
    props.callback();
}

const props = defineProps<{
    topicId: number;
    quizId: number;
    callback: CallableFunction;
}>();
</script>

<style scoped>
.close-button {
    top: 0;
    right: 0%;
    transform: translate(-10%, 10%);
}
</style>
