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
import Nav from './components/Nav.vue';
import AlertModal from './components/AlertModal.vue';
import { useAuthStore } from './store/auth';
import { useAlertStore } from './store/alert';

const alertStore = useAlertStore();
const authStore = useAuthStore();
authStore.loadToken();
</script>

<style scoped>
/* Tambahkan gaya tambahan jika diperlukan */
nav {
  margin-bottom: 20px; /* Beri jarak di bawah navigasi */
}
</style>