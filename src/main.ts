import 'primeicons/primeicons.css'
import './assets/main.css'
import './assets/utils.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Material from '@primeuix/themes/material'
import { definePreset } from '@primeuix/themes'

import App from './App.vue'


const ThemePreset = definePreset(Material, {
    semantic: {
        primary: {
            50:  '{amber.50}',
            100: '{amber.100}',
            200: '{amber.200}',
            300: '{amber.300}',
            400: '{amber.400}',
            500: '{amber.500}',
            600: '{amber.600}',
            700: '{amber.700}',
            800: '{amber.800}',
            900: '{amber.900}',
            950: '{amber.950}'
        }
    }
});

createApp(App)
    .use(createPinia())
    .use(PrimeVue, { 
        theme: {
            preset: ThemePreset,
            options: {
                darkModeSelector: false || 'none',
                
            }
        }
    })
    .mount('#app')
