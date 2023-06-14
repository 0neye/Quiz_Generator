<template>
  <!-- <div class="card flex flex-col justify-center m-auto gap-4">
        <div>
            <h3 class="font-semibold text-xl">Create a new quiz</h3>
        </div>
        <div>
            <v-text-field v-model="title" label="Title" />
        </div>
        <div>
            <v-select theme="dark" label="Question Number" :items="['3', '5', '7', '10']" />
        </div>
        <div>
            <v-textarea v-model="description" label="Context" />
            <span>Context can be lecture notes, learning objectives, and/or info on what you want
                to study.</span>
        </div>
        <div class="flex btn max-w-min" @click="addQuiz">
            <span class="material-symbols-outlined mr-1">add</span>
            <button>Add</button>
        </div>
    </div> -->
  <v-dialog v-model="dialog" width="auto" height="auto" theme="dark">
    <template v-slot:activator="{ props }">
      <div v-bind="props" class="card flex flex-col justify-center m-auto gap-4 btn">
        <button>New Quiz</button>
      </div>
    </template>
    <div class="card flex flex-col justify-center gap-4">
      <h3 class="font-semibold text-xl text-center">Create a new quiz</h3>
      <div class="flex justify-evenly gap-4">
        <!-- this appears really thin and using stuff like 'w-max' doesn't work -->
        <div class="flex flex-col w-full">
          <v-text-field v-model="title" label="Title" />
          <v-select theme="dark" label="Question Number" v-model="numberOfQuestions" :items="['3', '5', '7', '10']" />
          <v-select theme="dark" label="Question Types" v-model="questionTypes" multiple chips :items="typeOptions" />
          <v-menu :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <div v-bind="props" class="flex mb-8 text-gray-400">
                <span class="material-symbols-outlined mr-1">tune</span>
                <button>Advanced Options</button>
              </div>
            </template>
            <v-list>
              <v-list-item>
                <v-switch label="Fast (less accurate)" color="blue" v-model="fast" />
              </v-list-item>
              <v-list-item>
                <v-switch label="One try per question" color="blue" v-model="oneTry" />
              </v-list-item>
            </v-list>
          </v-menu>
          <div class="flex btn" @click="addQuiz">
            <span class="material-symbols-outlined mr-1">add</span>
            <button>Add</button>
          </div>
        </div>
        <div class="flex flex-col w-full">
          <v-textarea v-model="description" label="Context" prepend-inner-icon="mdi-segment"
            messages="Context can be lecture notes, learning objectives, and/or info on what you want to study." />
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
const topicStore = useTopicStore();
const dialog = ref(false);

const props = defineProps<{
  topic: Topic;
  callback: CallableFunction;
}>();

const typeOptions = ["Multiple Choice", "Fill-in-the-blank", "True or False"];

const title = ref("");
const description = ref("");
const numberOfQuestions = ref("3");
const questionTypes = ref(typeOptions);
const fast = ref(false);
const oneTry = ref(true);

async function addQuiz() {
  console.log("Topic: ", props.topic);
  if (title.value) {
    console.log("adding quiz");
    // const { data } = await useFetch(`/api/model`, {
    //     method: "POST",
    //     body: {
    //         topic: `Title: ${props.topic?.title}\nDescription: ${props.topic?.description}`,
    //         quiz: `${title.value}`,
    //         context: `${description.value}`
    //     }
    // })
    topicStore.addQuiz(props.topic.id, title.value, description.value, [], false, {
      questionNumber: +numberOfQuestions.value,
      questionTypes: questionTypes.value,
      fast: fast.value,
      oneTry: oneTry.value,
    });
    navigateTo(
      `/app/topic-${props.topic.id}/quiz-${topicStore.getQuizzes(props.topic.id).length - 1
      }`
    );
  } else {
    alert("Title is required");
  }
}
</script>

<style scoped></style>
