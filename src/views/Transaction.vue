<template>
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">
        <span class="icon"><i class="mdi mdi-file-check"></i></span>
        Transaction List
      </p>
      <b-button class="card-header-icon" @click="fetchDetail" variant="primary">
        <span class="icon"><i class="mdi mdi-reload"></i></span>
      </b-button>
    </header>
    <div class="card-content">
      <b-table :items="groupedDetailData" :fields="fields" bordered hover striped responsive class="is-fullwidth">
        <template #cell(items)="data">
          <ul>
            <li v-for="item in data.item.items" :key="item.item_name">
              {{ item.item_name }} (Quantity: {{ item.quantity }})
            </li>
          </ul>
        </template>
        <template #cell(out)="data">
          {{ formatDate(data.item.out) }}
        </template>
        <template #cell(entry)="data">
          {{ formatDate(data.item.entry) }}
        </template>
        <template #cell(actions)="data">
          <div class="actions-cell">
            <b-button size="sm" variant="primary" @click="openLoanModal(data.item.detail_id)">
              <i class="mdi mdi-pencil"></i>
            </b-button>
            <b-button size="sm" variant="danger" @click="deleteItem(data.item.detail_id)">
              <i class="mdi mdi-trash-can"></i>
            </b-button>
          </div>
        </template>
      </b-table>
    </div>
    <TransactionModal :items="detailData" :show="loanModalVisible" :selectedItem="selectedItem" :mode="'update'" :selectedCode="selectedItem.code" @update:show="loanModalVisible = $event" 
            @update-data="fetchDetail"/>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { getDetail, deleteDetail } from '../api';
import { useAlertStore } from '../store/alert';
import TransactionModal from '../components/TransactionModal.vue';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default {
  name: 'Transaction',
  components: {
    TransactionModal,
  },
  setup() {
  const alertStore = useAlertStore();
  const detailData = ref([]);
  const loanModalVisible = ref(false);
  const selectedItem = ref({}); // This must be returned to the template

  const fields = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'items', label: 'Items' },
    { key: 'out', label: 'Out Date', sortable: true },
    { key: 'entry', label: 'Entry Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions' },
  ];

  const fetchDetail = async () => {
    try {
      const data = await getDetail();
      detailData.value = [...data];
    } catch (error) {
      console.error('Error fetching chart:', error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return format(date, "dd MMMM yyyy", { locale: id });
  };

  const deleteItem = async (detailId) => {
    console.log('Delete button clicked for transaction ID:', detailId); // Debugging
    alertStore.showConfirmation('Are you sure you want to delete this item?', async () => {
      console.log('Confirmation received for transaction ID:', detailId); // Debugging
      try {
        const response = await deleteDetail(detailId);
        console.log('Delete response:', response); // Log response structure for debugging

        if (response && response.message) {
          alertStore.showAlert(response.message || 'Transaction deleted successfully', false);
          await fetchDetail();

        } else {
          alertStore.showAlert(response?.message || 'An unexpected error occurred', true);
        }
      } catch (error) {
        console.error('Error deleting item:', error); // Debugging error
        alertStore.showAlert(error.response?.data?.error || 'An error occurred', true);
      }
    });
  };

  const openLoanModal = (detailId) => {
    const transaction = detailData.value.find(item => item.detail_id === detailId);
    if (transaction) {
      loanModalVisible.value = true;
      selectedItem.value = { ...transaction };
    } else {
      console.error(`Transaction with ID ${detailId} not found.`);
    }
  };

  const groupedDetailData = computed(() => {
    const grouped = {};
    detailData.value.forEach((item) => {
      if (!grouped[item.detail_id]) {
        grouped[item.detail_id] = {
          detail_id: item.detail_id,
          code: item.code,
          out: item.out,
          entry: item.entry,
          status: item.status,
          items: [],
        };
      }
      grouped[item.detail_id].items.push({
        item_name: item.item_name,
        quantity: item.quantity,
      });
    });
    return Object.values(grouped);
  });

  onMounted(() => {
    fetchDetail();
  });

  return {
    detailData,
    fields,
    formatDate,
    groupedDetailData,
    fetchDetail,
    loanModalVisible,
    openLoanModal,
    selectedItem,
    deleteItem,
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

.actions-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
