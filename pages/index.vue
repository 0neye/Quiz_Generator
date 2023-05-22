<template>
  <canvas class="h-max w-max fixed top-0" id="canvas" />
  <div
    class="min-h-screen bg-gradient-to-b from-transparent to-blue-200 dark:from-gray-950 dark:to-blue-900 pos-rel"
  >
    <section>
      <main class="flex flex-col px-8 py-16 lg:mx-24">
        <h1 class="text-5xl lg:text-8xl font-bold max-w-fit slogan h-44 lg:h-72 mt-14">
          {{ slogan }}
        </h1>

        <p class="text-2xl lg:text-3xl mt-4 max-w-xl mx-auto text-center">
          With anyquiz you can generate quizzes on any topic in seconds. Just describe
          what you want to study and click create.
        </p>

        <NuxtLink
          to="/start"
          class="btn mt-8 text-xl mx-auto start-btn"
          @mouseenter="grow"
          @mouseleave="shrink"
        >
          Get Started
        </NuxtLink>
      </main>

      <h2 class="text-4xl font-bold text-center my-14 mt-20">Why anyquiz?</h2>
    </section>
    <section>
      <section class="py-40 my-20">
        <ImageTextCard
          :flip="false"
          :image="`../assets/images/fast.png`"
          class="mx-auto item"
        >
          <template #title>Fast</template>
          <template #text
            >anyquiz uses state-of-the-art natural language processing to generate quizzes
            in seconds. No need to spend hours crafting questions and answers.
          </template>
        </ImageTextCard>
      </section>

      <section class="diagonal py-40 my-20">
        <ImageTextCard
          :flip="true"
          :image="`../assets/images/accurate.png`"
          class="mt-10 mx-auto item"
        >
          <template #title>Accurate</template>
          <template #text
            >anyquiz ensures that the quizzes are relevant, factual, and diverse. You can
            also customize the difficulty level, number of questions, and answer format.
          </template>
        </ImageTextCard>
      </section>

      <section class="py-40 my-20">
        <ImageTextCard
          :flip="false"
          :image="`../assets/images/private.png`"
          class="mt-10 mx-auto item"
        >
          <template #title>Private</template>
          <template #text
            >anyquiz respects your privacy and does not store or share your data. You can
            create quizzes anonymously or sign up for a free account to save and manage
            your quizzes.
          </template>
        </ImageTextCard>
      </section>

      <section class="diagonal2 py-40 my-20">
        <ImageTextCard
          :flip="true"
          :image="`../assets/images/cheap.png`"
          class="mt-10 mx-auto item"
        >
          <template #title>Cheap</template>
          <template #text
            >anyquiz is free to use for up to 10 quizzes per month. If you need more, you
            can upgrade to a premium plan for a low monthly fee.
          </template>
        </ImageTextCard>
      </section>

      <!-- add a call to action at the end of the section -->
      <div class="mt-8 flex items-center justify-center">
        <NuxtLink
          to="/start"
          class="btn mt-8 text-xl mx-auto start-btn"
          @mouseenter="grow"
          @mouseleave="shrink"
          >Get Started</NuxtLink
        >
      </div>
    </section>

    <footer
      class="bg-gray-100 dark:bg-gray-900 py-8 px-8 flex items-center justify-center mt-14"
    >
      <p>&copy; 2023 anyquiz. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import gsap from "gsap";

const slogan = ref("Create AI-powered practice quizzes in seconds");

onMounted(() => {
  textGenerationEffect(slogan, 25);
  animateCanvas();
  gsap.from(".slogan", {
    x: -150,
    duration: 1,
  });
  const items = document.getElementsByClassName("item");
  for (const item of items) {
    gsap.from(item, {
      x: -150,
      duration: 1,
      scrollTrigger: {
        trigger: item,
        start: "20% bottom",
        toggleActions: "restart none none none",
      },
    });
  }
});
definePageMeta({
  colorMode: "light",
});
</script>

<style scoped>
.start-btn {
  border: 2px solid #37d4ff;
}

.start-btn:hover {
  animation: glow 0.2s linear forwards;
  border: 2px solid #37d4ff;
}

@keyframes glow {
  from {
    box-shadow: 0 0 0px #37d4ff;
  }

  to {
    box-shadow: 0 0 10px #37d4ff;
  }
}

.slogan {
  font-family: "Roboto", sans-serif;
  background: linear-gradient(#57aeff, #2b59ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 15px rgba(0, 140, 255, 0.259);
}

.image-card {
  /* add a box shadow for the glow effect */
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.1);
}

.image-card:hover {
  /* increase the box shadow on hover */
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.2);
}

.diagonal {
  --skew-angle: -5deg;
  --background: linear-gradient(45deg, #4dc1ff, #377aff);

  position: relative;
  isolation: isolate;
}

.diagonal::after {
  content: "";
  background: var(--background);
  position: absolute;
  z-index: -1;
  inset: 0;
  transform: skewY(var(--skew-angle));
}

.diagonal2 {
  --skew-angle: 5deg;
  --background: linear-gradient(135deg, #4dc1ff, #377aff);

  position: relative;
  isolation: isolate;
}

.diagonal2::after {
  content: "";
  background: var(--background);
  position: absolute;
  z-index: -1;
  inset: 0;
  transform: skewY(var(--skew-angle));
}
</style>
