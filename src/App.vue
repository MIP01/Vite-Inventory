<script setup>
import Nav from './components/Nav.vue';
import { useAuthStore } from './store/auth';

// Sinkronisasi token saat aplikasi dimuat
const authStore = useAuthStore();
authStore.loadToken();
</script>

<template>
  <div id="app">
    <!-- Komponen Nav dengan slot berisi router-view -->
    <Nav>
      <router-view />
    </Nav>
  </div>
</template>

<style scoped>
/* Tambahkan gaya tambahan jika diperlukan */
nav {
  margin-bottom: 20px; /* Beri jarak di bawah navigasi */
}
</style>