<template>
    <div class="card flex flex-col justify-center m-auto gap-4">
        <div>
            <h3 class="font-semibold text-xl">Create a new topic</h3>
        </div>
        <div>
            <v-text-field v-model="title" label="Title" />
        </div>
        <div>
            <v-textarea v-model="description" label="Description" />
        </div>
        <div class="flex btn max-w-min" @click="addTopic">
            <span class="material-symbols-outlined mr-1">add</span>
            <button>Add</button>
        </div>
    </div>
</template>

<script setup lang="ts">
const topicStore = useTopicStore();
const title = ref("");
const description = ref("");

/**
 * Adds a new topic with a given title and description to the topic store and calls the callback function.
 *
 * @return {void} This function does not return anything.
 */
const addTopic = () => {
    if (title.value) {
        if (!description.value) {
            description.value = title.value;
        }
        topicStore.addTopic(title.value, description.value);
        props.callback();
    } else {
        alert("Title is required");
    }
};

const props = defineProps<{
    callback: CallableFunction;
}>();
</script>

<style scoped></style>
