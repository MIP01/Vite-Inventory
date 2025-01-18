import { defineStore } from 'pinia';
import { reactive } from 'vue';

export const useAlertStore = defineStore('alert', () => {
  const state = reactive({
    show: false,
    message: '',
    isError: false,
    isConfirmation: false,
    confirmCallback: null, // Fungsi callback untuk konfirmasi
  });

  const showAlert = (message, isError = false) => {
    state.message = message;
    state.isError = isError;
    state.isConfirmation = false;
    state.show = true;
  };

  const showConfirmation = (message, callback) => {
    console.log('showConfirmation called with message:', message);  // Debugging
    state.message = message;
    state.isError = false;
    state.isConfirmation = true;
    state.confirmCallback = callback;  // Make sure the callback is stored
    state.show = true;  // Trigger the modal to be shown
    console.log('Modal state updated to show:', state.show); // Debugging
  };

  const hideAlert = () => {
    state.show = false;
    state.isConfirmation = false;
    state.confirmCallback = null;
  };

  const confirmAction = () => {
    if (state.confirmCallback) {
      state.confirmCallback(); // Jalankan callback jika ada
    }
    hideAlert();
  };

  return {
    state,
    showAlert,
    showConfirmation,
    hideAlert,
    confirmAction,
  };
});