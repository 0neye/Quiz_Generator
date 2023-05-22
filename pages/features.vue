<template>
    <main class="mx-24 mt-5 text-xl text-center">
        <h3 class="text-4xl p-5 h-20 border-b-2 w-fit mx-auto mb-5">{{ title }}</h3>
        <p>
            Generate quizzes on any topic with ease, no text source required. All saved locally
            in your browser.
        </p>
    </main>
    <section class="grid grid-cols-2 gap-4 mt-10 mx-10">
        <div class="card flex">
            <span class="material-symbols-outlined mr-4 text-6xl my-auto">unknown_document</span>
            <div>
                <h4 class="text-xl w-fit my-2">No Source Text?</h4>
                <p>
                    Can't find a document to base a quiz off of? No problem! You can create quizzes
                    on any topic with Anyquiz. Providing context is still ideal, but optional.
                </p>
            </div>
        </div>
        <div class="card flex">
            <span class="material-symbols-outlined mr-4 text-6xl my-auto">question_mark</span>
            <div>
                <h4 class="text-xl w-fit my-2">Multiple Question Types</h4>
                <p>
                    Can't find a document to base a quiz off of? No problem! You can create quizzes
                    on any topic with Anyquiz. Providing context is still ideal, but optional.
                </p>
            </div>
        </div>
        <div class="card flex">
            <span class="material-symbols-outlined mr-4 text-6xl my-auto">topic</span>
            <div>
                <h4 class="text-xl w-fit my-2">Organized</h4>
                <p>
                    Organize your quizzes by topic, and manage them all in one place. Retake them at
                    any time, and get explanations.
                </p>
            </div>
        </div>
        <div class="card"></div>
    </section>

    <section class="mt-28">
        <h4 class="text-3xl p-5 h-20 w-fit">What's different?</h4>
        <div class="mx-24 mt-5">
            <p>
                Other quiz generators basically do one thing: you give them some text and they
                give you some questions about that text.
            </p>
            <p>Anyquiz aims to do better.</p>
        </div>
    </section>
</template>

<script setup lang="ts">
const title = ref("WHAT MAKES Anyquiz GREAT?");
onMounted(() => {
    textGenerationEffect(title, 25);
});

definePageMeta({
    layout: "default",
});
</script>

<style scoped></style>
