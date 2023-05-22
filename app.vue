<template>
  <!-- <header class="shadow-sm">
    <nav class="container mx-4 flex py-4">
      <div class="flex">
        <NuxtLink to="/"
          class="m-2 px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 border-2">
          Home
        </NuxtLink>
        <NuxtLink to="/about"
          class="m-2 px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 border-2">
          About
        </NuxtLink>
            </div>
          </nav>
        </header> -->
  <main>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </main>
</template>

<script setup lang="ts">
import gsap from "gsap";
</script>

<style scoped></style>
