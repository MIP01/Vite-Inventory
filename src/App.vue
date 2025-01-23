<template>
  <div id="app">
    <Nav>
      <router-view />
    </Nav>

    <!-- Alert Modal -->
    <AlertModal
      v-model:show="alertStore.state.show"
      :message="alertStore.state.message"
      :isError="alertStore.state.isError"
      :isConfirmation="alertStore.state.isConfirmation"
      @update:show="alertStore.state.show = $event"
      @confirm="alertStore.confirmAction"
    />
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import Nav from './components/Nav.vue';
import AlertModal from './components/AlertModal.vue';
import { useAuthStore } from './store/auth';
import { useAlertStore } from './store/alert';

const router = useRouter();
const alertStore = useAlertStore();
const authStore = useAuthStore();

// Load token saat aplikasi dimulai
authStore.loadToken();

// Watch perubahan status autentikasi
watch(() => authStore.isAuthenticated, (newValue) => {
  if (!newValue && router.currentRoute.value.meta.requiresAuth) {
    // Simpan path terakhir sebelum redirect ke login
    const currentPath = router.currentRoute.value.path;
    if (currentPath !== '/login') {
      localStorage.setItem('lastActivePath', currentPath);
    }
    router.push('/login');
  }
}, { immediate: true });
</script>

<style scoped>
/* Tambahkan gaya tambahan jika diperlukan */
nav {
  margin-bottom: 20px; /* Beri jarak di bawah navigasi */
}
</style>