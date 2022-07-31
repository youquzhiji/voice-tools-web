import Home from "@/views/Home.vue";
import About from "@/views/About.vue";
import Settings from "@/views/Settings.vue";
import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";
import Results from "@/views/Results.vue";

const routes: Array<RouteRecordRaw> = [
    {path: '/', name: 'Home', component: Home},
    {path: '/about', name: 'About', component: About},
    {path: '/settings', name: 'Settings', component: Settings},
    {path: '/result/:uuid', name: 'Results', component: Results, props: true},
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
