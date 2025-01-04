import Vue from 'vue';
import Router from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
import LoginView from './components/LoginView.vue';
import AdminView from './components/AdminView.vue';
import UserView from "@/components/UserView.vue";
import store from './store'; // 确保路径正确
import axios from 'axios';

Vue.use(Router);

const routes = [
    {
        path: '/HelloWorld',
        name: 'HelloWorld',
        component: HelloWorld
    },
    {
        path: '/Login',
        name: 'Login',
        component: LoginView
    },
    {
        path: '/admin-dashboard',
        name: 'AdminView',
        component: AdminView
    },
    {
        path: '/user-dashboard',
        name: 'UserView',
        component: UserView
    },
];

const router = new Router({
    mode: 'history',  // 使用 HTML5 History API
    routes // （缩写）相当于 routes: routes
});


// 导航守卫
router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!store.getters.isLoggedIn) {
            next('/login');
        } else {
            // 如果已经登录，确保axios请求携带JWT
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            next();
        }
    } else {
        next(); // 确保一定要调用 next()
    }
});


export default router;