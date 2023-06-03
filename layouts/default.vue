<template>
    <Head>
        <Title>anyquiz</Title>
        <Meta name="description" content="Quiz Generator" />
    </Head>
    <header class="bg-transparent">
        <div class="fixed top-0 w-full z-10">
            <nav class="flex justify-between px-8 py-4 bg-gradient-to-b from-white dark:from-gray-950 to-transparent">
                <NuxtLink class="flex items-center space-x-2" to="/">
                    <img src="/images/logo.png" alt="Logo" class="h-8 w-8" />
                    <span class="text-2xl font-bold">anyquiz</span>
                </NuxtLink>
                <div v-if="!phone">
                    <div class="flex items-center space-x-4">
                        <NuxtLink to="/features" class="hover:text-cyan-400">Features</NuxtLink>
                        <NuxtLink to="/pricing" class="hover:text-cyan-400">Pricing</NuxtLink>
                        <NuxtLink to="/contact" class="hover:text-cyan-400">Contact</NuxtLink>
                        <NuxtLink to="/start" class="btn">Get Started</NuxtLink>
                    </div>
                </div>
                <div v-else>
                    <v-menu>
                        <template v-slot:activator="{ props }">
                            <span v-bind="props" class="material-symbols-outlined mr-1"> menu </span>
                        </template>
                        <v-list>
                            <v-list-item>
                                <NuxtLink to="/features" class="hover:text-cyan-400">Features</NuxtLink>
                            </v-list-item>
                            <v-list-item>
                                <NuxtLink to="/pricing" class="hover:text-cyan-400">Pricing</NuxtLink>
                            </v-list-item>
                            <v-list-item>
                                <NuxtLink to="/contact" class="hover:text-cyan-400">Contact</NuxtLink>
                            </v-list-item>
                            <v-list-item>
                                <NuxtLink to="/start" class="hover:text-cyan-400">Get Started</NuxtLink>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
            </nav>
        </div>

        <main>
            <!-- page content -->
            <div class="">
                <slot />
            </div>
        </main>
    </header>
</template>

<script setup lang="ts">
const phone = ref(false);
onBeforeMount(() => {
    if (process.client) {
        phone.value = window.innerWidth < 768;
    }
});
</script>

<style scoped>
/* .router-link-exact-active {
    border-color: rgb(52 211 153);
    box-shadow: 0 0 0.5em rgb(52 211 153);
} */
</style>
