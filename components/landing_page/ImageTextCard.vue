<template>
    <div v-if="flip" class="max-w-4xl h-full flex-shrink-0 flex items-start space-x-4 item">
        <img :src="imageUrl" class="image-card h-40 w-fit object-cover" />
        <div class="flex flex-col">
            <h3 class="text-3xl font-bold">
                <slot name="title"></slot>
            </h3>
            <p class="mt-2 text-lg">
                <slot name="text"></slot>
            </p>
        </div>
    </div>
    <div v-else class="max-w-4xl h-full flex-shrink-0 flex items-start space-x-4 item">
        <div class="flex flex-col">
            <h3 class="text-3xl font-bold">
                <slot name="title"></slot>
            </h3>
            <p class="mt-2 text-lg">
                <slot name="text"></slot>
            </p>
        </div>
        <img :src="imageUrl" class="image-card h-40 w-fit object-cover" />
    </div>
</template>

<script setup lang="ts">
// TODO: Switch to just using DaisyUI https://daisyui.com/docs/install/ for this
import gsap from "gsap";
const props = defineProps<{
    image: string;
    flip: boolean;
}>();

const imageUrl = new URL(props.image, import.meta.url).href;

// onMounted(() => {
//     gsap.from(".item", {
//         x: props.flip ? -100 : 100,
//         //opacity: 0,
//         duration: 1,
//         scrollTrigger: {
//             trigger: ".item",
//             start: "20% bottom",
//             toggleActions: "restart none none none",
//         },
//     });
// });
</script>

<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;

.image-card {
    @apply w-80 h-full flex-shrink-0 flex items-start space-x-4 rounded-lg;
}

.item {
    opacity: 1;
}
</style>
