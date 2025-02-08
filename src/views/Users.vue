<template>
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">
        <span class="icon"><i class="mdi mdi-account-multiple"></i></span>
        User List
      </p>
      <div class="buttons" style="display: flex;">
        <b-button class="card-header-icon" @click="fetchUsers" variant="primary">
          <span class="icon"><i class="mdi mdi-reload"></i></span>
        </b-button>
        <b-button @click="handleSaveUser" variant="success" class="ml-3">
          <i class="mdi mdi-plus"></i> Add User
        </b-button>
      </div>
    </header>
    <div class="card-content">

      <b-table :items="users" :fields="fields" bordered hover striped responsive class="is-fullwidth" show-empty>
        <template #cell(actions)="data">
          <div class="actions-cell">
            <b-button size="sm" variant="primary" @click="() => openEditModal(data.item.user_id)">
              <i class="mdi mdi-pencil"></i>
            </b-button>
            <b-button size="sm" variant="danger" @click="deleteUser(data.item.user_id)">
              <i class="mdi mdi-trash-can"></i>
            </b-button>
          </div>
        </template>
      </b-table>
    </div>
    <!-- Menampilkan modal dengan data item -->
    <UserModal 
      :show="showModal" 
      :mode="modalMode"
      :selectedUser="selectedUser"
      @update:show="showModal = $event"
      @update-users="fetchUsers"
    />


  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getUser, deleteUser } from '../api';
import { useAlertStore } from '../store/alert';
import UserModal from '../components/UserModal.vue';

export default {
  name: 'Users',
  components: {
    UserModal
  },
  setup() {
    const alertStore = useAlertStore();
    const users = ref([]);
    const showModal = ref(false);
    const modalMode = ref('add'); // 'add' or 'edit'
    const selectedUser = ref({});

    const fields = [
      { key: 'user_id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'created_at', label: 'Created At', sortable: true },
      { key: 'actions', label: 'Actions' }
    ];

    const fetchUsers = async () => {
      try {
        console.log('Fetching users...');
        const response = await getUser();
        console.log('API Response:', response);
        users.value = response.user || [];
        console.log('Users fetched successfully:', users.value);
      } catch (error) {
        console.error('Error fetching users:', error);
        alertStore.showAlert('Failed to fetch users', true);
        users.value = [];
      }
    };

    const handleDeleteUser = (userId) => {
      console.log('Deleting user with ID:', userId);
      alertStore.showConfirmation('Are you sure you want to delete this user?', async () => {
        try {
          await deleteUser(userId);
          await fetchUsers();
          alertStore.showAlert('User deleted successfully', false);
        } catch (error) {
          console.error('Error deleting user:', error);
          alertStore.showAlert(error.response?.data?.error || 'An error occurred', true);
        }
      });
    };

    const openEditModal = (userId) => {
      console.log('Opening edit modal for user ID:', userId);
      const user = users.value.find(u => u.user_id === userId);
      if (user) {
        console.log('Found user:', user);
        selectedUser.value = { ...user };
        modalMode.value = 'edit';
        showModal.value = true;
      }

    };

    const handleSaveUser = async () => {
      console.log('Saving user...');
      selectedUser.value = {};
      modalMode.value = 'add';
      showModal.value = true;
    };


    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      fields,
      showModal,
      modalMode,
      selectedUser,
      fetchUsers,
      handleDeleteUser,
      openEditModal,
      handleSaveUser
    };
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-header-title {
  display: flex;
  align-items: center;
  font-size: 27px;
  font-weight: bold;
  gap: 8px;
}

.card-header-icon {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    box-sizing: border-box;
}

.card-header-icon,
.ml-3 {
    margin-left: 8px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.actions-cell {
    display: flex;
    gap: 8px;
    align-items: center;
}
</style>
