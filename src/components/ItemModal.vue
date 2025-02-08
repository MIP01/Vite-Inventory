<!-- Modal untuk Add/Edit Item -->
<template>
  <b-modal 
    v-model="showModal" 
    :title="modalMode === 'add' ? 'Add New Item' : 'Edit Item'"
    @hidden="closeModal"
    @ok="handleSubmit"
    @cancel="closeModal"
  >
    <div>
      <b-form-group label="Name">
        <b-form-input v-model="formData.name" required></b-form-input>
      </b-form-group>
      <b-form-group label="Stock">
        <b-form-input v-model="formData.stock" type="number" required></b-form-input>
      </b-form-group>
    </div>
    <template #modal-footer>
      <b-button variant="secondary" @click="closeModal">
        Cancel
      </b-button>
      <b-button 
        variant="primary"
        @click="handleSubmit"
        :disabled="loading || !formData.name || !formData.stock"
      >
        {{ modalMode === 'add' ? 'Add' : 'Update' }} Item
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { ref, watch } from 'vue';
import { addItem, updateItemById } from '../api';
import { useAlertStore } from '../store/alert';

export default {
  name: 'ItemModal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    item: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: 'add'
    }
  },
  emits: ['update:show', 'update-items'],
  setup(props, { emit }) {
    const alertStore = useAlertStore();
    const showModal = ref(props.show);
    const loading = ref(false);
    const formData = ref({
      name: '',
      stock: 0
    });
    const modalMode = ref(props.mode);

    // Watch untuk props
    watch(() => props.show, (newVal) => {
      console.log('Show prop changed:', newVal);
      showModal.value = newVal;
    });

    watch(() => props.item, (newItem) => {
      console.log('Item prop changed:', newItem);
      if (newItem && Object.keys(newItem).length > 0) {
        formData.value = {
          name: newItem.name || '',
          stock: newItem.stock || 0
        };
      } else {
        formData.value = { name: '', stock: 0 };
      }
    }, { deep: true });

    watch(() => props.mode, (newMode) => {
      console.log('Mode prop changed:', newMode);
      modalMode.value = newMode;
    });

    watch(showModal, (newVal) => {
      console.log('Modal visibility changed:', newVal);
      if (!newVal) {
        emit('update:show', false);
      }
    });

    const closeModal = () => {
      console.log('Closing modal');
      showModal.value = false;
      formData.value = { name: '', stock: 0 };
      emit('update:show', false);
    };

    const handleSubmit = async () => {
      console.log('Submit button clicked');
      console.log('Current mode:', modalMode.value);
      console.log('Form data:', formData.value);

      if (!formData.value.name || !formData.value.stock) {
        alertStore.showAlert('Please fill all required fields', true);
        return;
      }

      // Format data sesuai yang dibutuhkan API
      const payload = {
        name: formData.value.name,
        stock: parseInt(formData.value.stock) // Pastikan stock berupa integer
      };

      console.log('Formatted payload:', payload);

      loading.value = true;
      try {
        if (modalMode.value === 'add') {
          console.log('Adding new item...');
          const result = await addItem(payload);
          console.log('Add result:', result);
          if (result) {  // Periksa hasil
            alertStore.showAlert('Item added successfully', false);
            emit('update-items');
            closeModal();
          }
        } else {
          console.log('Updating item:', props.item.item_id);
          const result = await updateItemById(props.item.item_id, payload);
          console.log('Update result:', result);
          alertStore.showAlert('Item updated successfully', false);
          emit('update-items');
          closeModal();
        }
      } catch (error) {
        console.error('Error in handleSubmit:', error);
        // Tampilkan pesan error yang lebih spesifik dari server jika ada
        const errorMessage = error.response?.data?.error || error.message || 'Failed to process item';
        alertStore.showAlert(errorMessage, true);
      } finally {
        loading.value = false;
      }
    };

    return {
      showModal,
      formData,
      modalMode,
      loading,
      handleSubmit,
      closeModal
    };
  }
};
</script>