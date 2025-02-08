<template>
  <div class="dashboard-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1><i class="mdi mdi-view-dashboard me-2"></i>Dashboard</h1>
      <b-button variant="primary" @click="showAddModal">
        <i class="mdi mdi-plus me-2"></i>Add Item
      </b-button>
    </div>
    <div class="card-content">
      <b-table :items="items" :fields="fields" bordered hover striped responsive class="is-fullwidth" show-empty>
        <template #cell(actions)="data">
          <div class="d-flex gap-2">
            <b-button size="sm" variant="warning" @click="showEditModal(data.item.item_id)">
              <i class="mdi mdi-pencil"></i>
            </b-button>
            <b-button size="sm" variant="danger" @click="confirmDelete(data.item.item_id)">
              <i class="mdi mdi-delete"></i>
            </b-button>
          </div>
        </template>
      </b-table>
    </div>

    <ItemModal 
      :show="modalVisible"
      :item="selectedItem"
      :mode="modalMode"
      @update:show="modalVisible = $event"
      @update-items="fetchItems"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getItems, deleteItem as apiDeleteItem } from '../api';
import { useAlertStore } from '../store/alert';
import ItemModal from '../components/ItemModal.vue';

export default {
  name: 'Dashboard',
  components: {
    ItemModal
  },
  setup() {
    const alertStore = useAlertStore();
    const items = ref([]);
    const modalVisible = ref(false);
    const selectedItem = ref({});
    const modalMode = ref('add');

    const fields = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'stock', label: 'Stock', sortable: true },
      { key: 'created_at', label: 'Created At', sortable: true },
      { key: 'updated_at', label: 'Updated At', sortable: true },
      { key: 'actions', label: 'Actions' }
    ];

    const fetchItems = async () => {
      try {
        const data = await getItems();
        items.value = data || [];
      } catch (error) {
        console.error('Failed to fetch items:', error);
        alertStore.showAlert('Failed to fetch items', true);
      }
    };

    const showAddModal = () => {
      console.log('Opening add modal');
      selectedItem.value = {};
      modalMode.value = 'add';
      modalVisible.value = true;
    };

    const showEditModal = (itemId) => {
      console.log('Opening edit modal for item:', itemId);
      const item = items.value.find(item => item.item_id === itemId);
      if (item) {
        console.log('Found item:', item);
        selectedItem.value = { ...item };
        modalMode.value = 'edit';
        modalVisible.value = true;
      }
    };

    const confirmDelete = (itemId) => {
      alertStore.showConfirmation('Are you sure you want to delete this item?', async () => {
        try {
          await apiDeleteItem(itemId);
          await fetchItems();
          alertStore.showAlert('Item deleted successfully', false);
        } catch (error) {
          console.error('Error deleting item:', error);
        }
      });
    };

    onMounted(() => {
      fetchItems();
    });

    return {
      items,
      fields,
      modalVisible,
      selectedItem,
      modalMode,
      showAddModal,
      showEditModal,
      confirmDelete,
      fetchItems
    };
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}
</style>
