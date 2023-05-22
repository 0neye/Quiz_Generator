<template>
    <NuxtLink :to="`${to}`" class="flex btn max-w-min hover:cursor-pointer">
        <span class="material-symbols-outlined mr-1">{{ icon }}</span>
        {{ content }}
    </NuxtLink>
</template>

<script setup lang="ts">

defineProps<{
    icon: string,
    to: string,
    content: string
}>()

</script>

<style scoped></style>