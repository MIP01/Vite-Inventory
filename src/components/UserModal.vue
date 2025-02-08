<template>
  <b-modal 
    :model-value="showModal" 
    :title="modalMode === 'add' ? 'Add User' : 'Edit User'"
    @hidden="closeModal"
    @ok="handleSubmit"
    @cancel="closeModal"


  >
    <b-form @submit.prevent="handleSubmit">
      <b-form-group label="Name">
        <b-form-input v-model="formData.name" required></b-form-input>
      </b-form-group>

      <b-form-group label="Email">
        <b-form-input v-model="formData.email" type="email" required></b-form-input>
      </b-form-group>

      <b-form-group label="Password" v-if="modalMode === 'add'">
        <b-form-input v-model="formData.password" type="password" required></b-form-input>
      </b-form-group>
    </b-form>

    <template #modal-footer>
      <b-button variant="secondary" @click="closeModal">
        Cancel
      </b-button>
      <b-button 
        variant="primary"
        @click="handleSubmit"
        :disabled="loading || !formData.name || !formData.email || (modalMode === 'add' && !formData.password)"
      >
        {{ modalMode === 'add' ? 'Add' : 'Update' }} User
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { ref, watch } from 'vue';
import { createUser, updateUser } from '../api';
import { useAlertStore } from '../store/alert';

export default {
  name: 'UserModal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    selectedUser: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: 'add'
    }
  },
  emits: ['update:show', 'save-user'],
  setup(props, { emit }) {
    const alertStore = useAlertStore();
    const showModal = ref(props.show);
    const loading = ref(false);
    const formData = ref({
      name: '',

      email: '',
      password: ''
    });
    const modalMode = ref(props.mode);

    watch(() => props.show, (newVal) => {
      console.log('Show prop changed:', newVal);
      showModal.value = newVal;
    });

    watch(() => props.selectedUser, (newUser) => {
      console.log('Selected user changed:', newUser);
      if (newUser && Object.keys(newUser).length > 0) {
        formData.value = {
          name: newUser.name,
          email: newUser.email,
          password: ''
        };
      } else {
        formData.value = { name: '', email: '', password: '' };
      }
    }, { immediate: true });

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
      formData.value = { name: '', email: '', password: '' };
      emit('update:show', false);
    };



    const handleSubmit = async () => {
      console.log('Submit button clicked');
      console.log('Current mode:', modalMode.value);
      console.log('Form data:', formData.value);

      if (!formData.value.name || !formData.value.email) {   
        alertStore.showAlert('Please fill all required fields', true);
        return;
      }

      const payload = {
        name: formData.value.name,
        email: formData.value.email,
        password: formData.value.password
      };

      console.log('Formatted payload:', payload);

      loading.value = true;
      try {
        if (modalMode.value === 'add') {
          console.log('Adding new user...');
          const result = await createUser(payload);
          console.log('Add result:', result);
          if (result) {
            alertStore.showAlert('User added successfully', false); 
            emit('save-user', payload);
            closeModal();
          }
        } else {
          console.log('Updating user:', props.selectedUser.user_id);
          const result = await updateUser(props.selectedUser.user_id, payload); 
          console.log('Update result:', result);
          alertStore.showAlert('User updated successfully', false);
        }
      } catch (error) {
        console.error('Error in handleSubmit:', error);
        const errorMessage = error.response?.data?.error || 'Failed to save user';      
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
