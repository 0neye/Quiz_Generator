<script setup lang="ts">
import { useTopicStore } from "~~/stores/topics";

const store = useTopicStore();
const { topic } = useRoute().params;
const quizzes = ref(store.getQuizzes(+topic));


function update() {
    store.loadState();
    quizzes.value = store.getQuizzes(+topic);
}

onMounted(() => {
    update();
});

definePageMeta({
    layout: "topics",
});
</script>

<template>
    <client-only placeholder="Loading...">

        <Head>
            <Title>Topic | {{ store.getTopic(+topic)?.title }}</Title>
            <Meta name="description" :content="store.getTopic(+topic)?.description" />
        </Head>

        <div>
            <transition-scale group tag="div" :duration="300" axis="both" class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div v-for="quiz in quizzes" :key="quiz?.id">
                    <QuizTile :topicId="+topic" :quizId="+quiz?.id" :callback="update">
                        <template #title>
                            {{ quiz?.title }}
                        </template>
                        {{ quiz?.description }}
                    </QuizTile>
                </div>
                <div>
                    <NewQuizCreator :topic="store.getTopic(+topic)" :callback="update" />
                </div>
            </transition-scale>
        </div>
    </client-only>
</template>

<style scoped></style>
