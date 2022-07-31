import {createApp} from 'vue'
import App from './App.vue'
import router from "./router";

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@fortawesome/fontawesome-free/css/fontawesome.min.css'
import '@fortawesome/fontawesome-free/css/solid.min.css'

import {Chart, registerables} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import {i18n} from "@/languages";

Chart.register(...registerables)
Chart.register(annotationPlugin)

createApp(App).use(router).use(i18n).use(ElementPlus).mount('#app')
