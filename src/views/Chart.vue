<template>
    <div class="card">
        <header class="card-header">
            <p class="card-header-title">
                <span class="icon"><i class="mdi mdi-account-multiple"></i></span>
                Item List
            </p>
            <b-button class="card-header-icon" @click="fetchChart" variant="primary">
                <span class="icon"><i class="mdi mdi-reload"></i></span>
            </b-button>
        </header>
        <div class="card-content">
            <b-table :items="chartData" :fields="fields" bordered hover striped responsive class="is-fullwidth">
                <template #cell(actions)="data">
                    <div class="actions-cell">
                        <b-button size="sm" variant="primary" @click="openModal(data.item.transaction_id)">
                            <i class="mdi mdi-pencil"></i>
                        </b-button>
                        <b-button size="sm" variant="danger" @click="deleteItem(data.item.transaction_id)">
                            <i class="mdi mdi-trash-can"></i>
                        </b-button>
                    </div>
                </template>
            </b-table>
        </div>
        <!-- Menampilkan modal ItemDetail dengan data item -->
        <ItemDetail :item="selectedItem" :show="modalVisible" @update:show="modalVisible = $event"
            @update-chart="fetchChart" :mode="'update'" />
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getChart, deleteChart } from '../api';
import ItemDetail from '../components/ItemDetail.vue';
import { useAlertStore } from '../store/alert';

export default {
    name: 'Chart',
    components: {
        ItemDetail,
    },
    setup() {
        const alertStore = useAlertStore();
        const chartData = ref([]);
        const modalVisible = ref(false);
        const selectedItem = ref({});
        const fields = [
            { key: 'user', label: 'User', sortable: true },
            { key: 'item_name', label: 'Item Name', sortable: true },
            { key: 'quantity', label: 'Quantity', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
            { key: 'actions', label: 'Actions' },
        ];

        const fetchChart = async () => {
            try {
                const data = await getChart();
                chartData.value = [...data];
                console.log('Chart data fetched:', data);
            } catch (error) {
                console.error('Error fetching chart:', error);
            }
        };

        const deleteItem = async (transactionId) => {
            console.log('Delete button clicked for transaction ID:', transactionId); // Debugging

            alertStore.showConfirmation('Are you sure you want to delete this item?', async () => {
                console.log('Confirmation received for transaction ID:', transactionId); // Debugging

                try {
                    const response = await deleteChart(transactionId);
                    console.log('Delete response:', response); // Log response structure for debugging

                    // Check if response is valid and contains success
                    if (response && response.message) {
                        alertStore.showAlert(response.message || 'Transaction deleted successfully', false);

                        await fetchChart();  // Fetch fresh data from the server
                        console.log('Chart data fetched after delete:', chartData.value); // Debugging

                    } else {
                        alertStore.showAlert(response?.message || 'An unexpected error occurred', true);
                    }
                } catch (error) {
                    console.error('Error deleting item:', error); // Debugging error
                    alertStore.showAlert(
                        error.response?.data?.error || 'An unexpected error occurred',
                        true
                    );
                }
            });
        };

        const openModal = (transactionId) => {
            const transaction = chartData.value.find(item => item.transaction_id === transactionId);

            if (transaction) {
                console.log('Selected transaction:', transaction);
                const adjustedItem = {
                    ...transaction,
                    name: transaction.item_name, // Ubah item_name menjadi name
                };
                selectedItem.value = adjustedItem;
                modalVisible.value = true;
            } else {
                console.error(`Transaction with ID ${transactionId} not found.`);
            }
        };

        onMounted(() => {
            fetchChart();
        });

        return {
            chartData,
            fields,
            fetchChart,
            deleteItem,
            openModal,
            selectedItem,
            modalVisible,
        };
    },
};
</script>

<style scoped>
.card-header {
    display: flex;
    /* Mengaktifkan Flexbox */
    align-items: center;
    /* Memastikan semua item sejajar secara vertikal */
    justify-content: space-between;
    /* Memberikan jarak antara title dan tombol */
}

.card-header-title {
    display: flex;
    /* Jika ada ikon di dalam title */
    align-items: center;
    /* Pastikan teks dan ikon sejajar */
    font-size: 27px;
    /* Besarkan ukuran font */
    font-weight: bold;
    gap: 8px;
}

.card-header-icon {
    cursor: pointer;
    display: flex;
    /* Memastikan ikon di tengah */
    align-items: center;
    justify-content: center;
    width: 36px;
    /* Lebar tetap */
    height: 36px;
    /* Tinggi sama dengan lebar */
    padding: 0;
    /* Pastikan padding tidak memengaruhi ukuran */
    box-sizing: border-box;
}

.actions-cell {
    display: flex;
    /* Menyusun elemen dalam satu baris */
    gap: 8px;
    /* Jarak antar elemen */
    align-items: center;
    /* Selaraskan tombol secara vertikal */
}
</style>