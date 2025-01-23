<template>
  <b-modal v-model="showModal" :ok-disabled="isLoading">
    <!-- Slot untuk custom title -->
    <template #title>
      <i class="mdi mdi-alert-circle-outline"></i> Alert
    </template>
    <p v-if="isConfirmation">{{ message }}</p>
    <p v-else>{{ message }}</p>

    <!-- Tampilkan pesan error -->
    <p v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p>

    <!-- Footer kustom -->
    <template #footer>
      <b-button variant="secondary" @click="closeModal">Cancel</b-button>
      <b-button variant="primary" @click="handleConfirm" :disabled="isLoading">{{ actionLabel }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'AlertModal',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    isError: {
      type: Boolean,
      default: false,
    },
    isConfirmation: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:show', 'confirm'],
  setup(props, { emit }) {
    const isLoading = ref(false);
    const errorMessage = ref('');
    const actionLabel = props.isConfirmation ? 'Yes' : 'OK';
    const showModal = ref(props.show);

    watch(() => props.show, (newVal) => {
      showModal.value = newVal;
    });

    // Emit update:show when the modal is closed
    const closeModal = () => {
      emit('update:show', false);
    };

    const handleConfirm = async () => {
      isLoading.value = true;
      try {
        if (props.isConfirmation) {
          emit('confirm');
        }
        closeModal();
      } catch (error) {
        errorMessage.value = 'Something went wrong.';
        console.error(error);
      } finally {
        isLoading.value = false;
      }
    };

    return {
      isLoading,
      errorMessage,
      actionLabel,
      closeModal,
      handleConfirm,
      showModal, // Use this in your v-model instead of directly binding to the prop
    };
  },
};
</script>

<style scoped>
/* Styling untuk modal */
.modal-item-name {
  font-size: 27px;
  font-weight: bold;
  margin-bottom: 30px;
}

/* Section quantity jika diperlukan */
.quantity-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}

/* Tampilkan pesan error */
.text-danger {
  color: red;
}

/* Footer kustom */
.b-modal .modal-footer {
  justify-content: space-between;
}

.b-button {
  padding: 10px 20px;
}
</style>