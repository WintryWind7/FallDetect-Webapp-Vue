// src/main.js

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css'; // 引入Bootstrap的CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // 可选：引入Bootstrap的JS（包含Popper.js）

Vue.config.productionTip = false; // 禁用生产环境的提示

new Vue({
  router, // 将路由配置添加到 Vue 实例
  render: h => h(App) // 使用 render 函数将 App 组件渲染到 Vue 实例中
}).$mount('#app'); // 挂载 Vue 实例到 DOM
