
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
//import * as labs from 'vuetify/labs/components'

export default defineNuxtPlugin(nuxtApp => {
    const vuetify = createVuetify({
        ssr: true,
        components,
        directives,
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: {
                mdi,
            }
        },
        //  ...labs
    })

    nuxtApp.vueApp.use(vuetify)
})
