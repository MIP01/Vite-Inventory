import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Chart from '../views/Chart.vue';
import Login from '../views/Login.vue'; // Halaman login
import Profile from '../views/Profile.vue';
import { useAuthStore } from '../store/auth';

const routes = [
  { path: '/', name: 'Home', component: Home, meta: { requiresAuth: false } },
  { path: '/chart', name: 'Chart', component: Chart, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: Login, meta: { requiresAuth: false } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } }, // Add Profile route
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Tambahkan navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Jika tidak autentikasi, simpan rute terakhir dan arahkan ke login
    localStorage.setItem('redirectRoute', to.fullPath);
    return next({ path: '/login' });
  }

  next(); // Lanjutkan ke rute tujuan
});

// Mengarahkan kembali setelah login berhasil (akan dilakukan di komponen Vue)
export default router;
