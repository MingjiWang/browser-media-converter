import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomePage
        },
        {
            path: '/searchbox',
            name: 'searchbox',
            component: () => import('../pages/SearchPage.vue')
        },
        {
            path: '/slider',
            name: 'slider',
            component: () => import('../pages/SliderPage.vue')
        },
        {
            path: '/switch',
            name: 'switch',
            component: () => import('../pages/SwitchPage.vue')
        },
        {
            path: '/navbar',
            name: 'navbar',
            component: () => import('../pages/NavbarPage.vue')
        },
        {
            path: '/container',
            name: 'container',
            component: () => import('../pages/ContainerPage.vue')
        }
    ]
})

export default router
