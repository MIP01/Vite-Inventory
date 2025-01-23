import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Chart from '../views/Chart.vue';
import Login from '../views/Login.vue';
import Profile from '../views/Profile.vue';
import Transaction from '../views/Transaction.vue';
import Signup from '../views/Signup.vue';
import { useAuthStore } from '../store/auth';

const routes = [
  { path: '/', name: 'Home', component: Home, meta: { requiresAuth: false } },
  { path: '/chart', name: 'Chart', component: Chart, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: Login, meta: { requiresAuth: false } },
  { path: '/signup', name: 'Signup', component: Signup, meta: { requiresAuth: false } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/transaction', name: 'Transaction', component: Transaction, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Tambahkan navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Cek apakah rute memerlukan autentikasi
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Simpan rute terakhir jika bukan /login
    const lastPath = localStorage.getItem('lastActivePath');
    if (lastPath && lastPath !== '/login') {
      localStorage.setItem('redirectRoute', lastPath);
    }
    return next('/login');
  }
  
  next();
});

// Mengarahkan kembali setelah login berhasil (akan dilakukan di komponen Vue)
export default router;
