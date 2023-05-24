<script setup lang="ts">
import { useTopicStore } from "~~/stores/topics";
const topicStore = useTopicStore();

const topics = ref(topicStore.getTopics());

function update() {
    topicStore.loadState();
    topics.value = topicStore.getTopics();
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
            <Title>Quiz Generator | Topics</Title>
            <Meta name="description" content="Quiz Generator Topics" />
        </Head>

        <div>
            <transition-scale group tag="div" :duration="300" axis="both"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div v-for="topic in topics" :key="topic.id">
                    <TopicTile :topicId="topic?.id" :callback="update">
                        <template #title>
                            {{ topic?.title }}
                        </template>
                        {{ topic?.description }}
                    </TopicTile>
                </div>
                <div>
                    <NewTopicCreator :callback="update" />
                </div>
            </transition-scale>
        </div>
    </client-only>
</template>

<style scoped></style>
