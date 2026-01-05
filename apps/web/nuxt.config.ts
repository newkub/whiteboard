import checker from 'vite-plugin-checker'
import wasm from 'vite-plugin-wasm'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-12-17", 
    devtools: { enabled: true },
    modules: [
        "@vue-macros/nuxt",
        "@nuxtjs/color-mode",
        "@vueuse/nuxt",
        "@unocss/nuxt",
        "@pinia/nuxt",
        "nuxt-mcp-dev",
        "@nuxt/icon"
    ], 

    icon: {
        serverBundle: {
        collections: ['mdi'] 
        }
    },

    nitro : {
        preset: "cloudflare_module",
        cloudflare: {
            deployConfig: true,
            nodeCompat: true,
        },
    },

    typescript: {
        typeCheck: true,
        strict: true
    },
    vite: {
        server: {
            hmr: {
                port: 24679,
                clientPort: 24679,
            },
        },
        plugins: [
            wasm(),
            checker({
                // typescript: true, // Optional: will be enabled by default if `typescript` is installed
                // vueTsc: true, // Optional: will be enabled by default if `vue-tsc` is installed
                // biome: { // Optional: will be enabled by default if `@biomejs/biome` is installed
                //   command: 'check', // You can also use `lint` or `format`
                // },
                // stylelint: { // Optional: will be enabled by default if `stylelint` is installed
                //   lintCommand: 'stylelint "**/*.{css,scss,vue}"', // You can also use `stylelint --fix ...`
                // },
            }),
        ],
    }
})