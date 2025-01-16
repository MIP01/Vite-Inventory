import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { createBootstrap } from 'bootstrap-vue-next';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import apiClient from '../src/api'

import { useAuthStore } from './store/auth'; // Import auth store

const app = createApp(App);

// Inisialisasi Pinia
const pinia = createPinia();
app.use(pinia);

// Sinkronisasi token dari localStorage ke Pinia
const authStore = useAuthStore();
authStore.loadToken(); // Pastikan state auth sinkron dengan token di localStorage

// Inisialisasi router dan BootstrapVue
app.use(router);
app.use(createBootstrap());

// Gunakan plugin
app.use(apiClient);

// Mount aplikasi
app.mount('#app');
