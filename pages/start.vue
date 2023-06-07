<template>
    <main class="text-xl text-center py-8 mt-10">
        <h3 class="text-5xl file:h-20 border-b-2 w-fit mx-auto mb-5">{{ title }}</h3>
        <p class="text-lg">All you need is a free OpenAI account.</p>
    </main>
    <section class="flex flex-col mt-10 mx-10 gap-8">
        <div class="card flex mx-auto">
            <span class="mr-4 text-6xl my-auto">1.</span>
            <div>
                <h4 class="text-xl w-fit my-2">Get an OpenAI API key</h4>
                <p>
                    Go to
                    <a href="https://platform.openai.com/account/api-keys" target="_blank" class="underline">
                        platform.openai.com
                    </a>
                    and create one, then save it somewhere safe.
                </p>
                <p>You should get $18 of free credit, which will last you a while.</p>
            </div>
        </div>
        <div class="card flex mx-auto">
            <span class="mr-4 text-6xl my-auto">2.</span>
            <div>
                <h4 class="text-xl w-fit my-2">Paste your key below</h4>
                <p>And you're ready to go!</p>
            </div>
        </div>
        <div class="flex mx-auto">
            <div class="flex">
                <input type="text" class="input my-auto" placeholder="API Key" v-model="APIKey" />
            </div>
            <div class="btn w-min px-4 mx-5" :onclick="submitAPIKey">
                <button>Submit</button>
            </div>
        </div>
    </section>
    <!-- <div>
        <v-card class="mx-auto" width="400" prepend-icon="mdi-home">
            <template v-slot:title> Hello from Vuetify! </template>
            <v-card-text> When you see this inside a card, it worked! </v-card-text>
        </v-card>
    </div> -->
</template>

<script setup lang="ts">
import { useAPIKeyStore } from "~~/stores/apikey";
const keyStore = useAPIKeyStore();

const title = ref("Get Started");
const APIKey = ref("");

function submitAPIKey() {
    console.log("submitAPIKey: ", APIKey.value);
    keyStore.setAPIKey({ name: "openai", key: APIKey.value } as APIKey);
    navigateTo("/app/topics");
}

onMounted(() => {
    textGenerationEffect(title, 25);
});

definePageMeta({
    layout: "default",
    colorMode: "light",
});
</script>

<style scoped></style>
