<template>
    <Head>
        <Title>Quiz Generator | Topics</Title>
        <Meta name="description" content="Quiz Generator" />
    </Head>
    <header class="shadow-sm">
        <div class="fixed top-0 w-full z-10">
            <nav class="flex items-center justify-between px-8 py-4 dark:bg-gray-950">
                <NuxtLink class="flex items-center space-x-2" to="/">
                    <img src="../assets/images/logo.png" alt="Logo" class="h-8 w-8" />
                    <span class="text-2xl font-bold">anyquiz</span>
                </NuxtLink>
                <div class="flex items-center space-x-4">
                    <NuxtLink to="/app/topics" class="flex btn">
                        <span class="material-symbols-outlined mr-1">topic</span>
                        <span>Topics</span>
                    </NuxtLink>
                </div>
            </nav>
        </div>
    </header>
    <main class="mt-16">
        <!-- page content -->
        <div class="mx-auto p-4">
            <slot />
        </div>
    </main>
</template>

<script setup lang="ts"></script>

<style scoped>
/* .router-link-exact-active {
    border-color: rgb(52 211 153);
    box-shadow: 0 0 0.5em rgb(52 211 153);
} */
</style>
