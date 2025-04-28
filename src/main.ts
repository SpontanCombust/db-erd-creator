import 'primeicons/primeicons.css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Material from '@primeuix/themes/material'


createApp(App)
    .use(createPinia())
    .use(PrimeVue, { 
        theme: {
            preset: Material,
            options: {
                darkModeSelector: false || 'none',
                
            }
        }
    })
    .mount('#app')
