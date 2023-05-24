// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxtjs/color-mode', '@morev/vue-transitions/nuxt'],
    css: ['vuetify/lib/styles/main.sass'],
    build: {
        transpile: ['vuetify', 'gsap'],
    },
    imports: {
        dirs: ['./stores'],
    },
    pinia: {
        autoImports: ['defineStore'],
    },
    app: {
        head: {
            link: [
                { rel: 'stylesheet', href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" },
                { rel: 'stylesheet', href: "https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" },
                { rel: 'stylesheet', href: "https://fonts.googleapis.com/css?family=Roboto" },
            ]
        }
    },
    components: [
        { path: '~/components/app', prefix: '' },
        { path: '~/components/general', prefix: '' },
        { path: '~/components/landing_page', prefix: '' },
        '~/components'
    ],
    runtimeConfig: {
        openaiApiKey: process.env.OPENAI_API_KEY,
        wolframID: process.env.WOLFRAM_ID
    },
    runtime: "edge",
    colorMode: {
        preference: 'system', // default value of $colorMode.preference
        fallback: 'light', // fallback value if not system preference found
        hid: 'nuxt-color-mode-script',
        globalName: '__NUXT_COLOR_MODE__',
        componentName: 'ColorScheme',
        classPrefix: '',
        classSuffix: '',
        storageKey: 'nuxt-color-mode'
    }
})
