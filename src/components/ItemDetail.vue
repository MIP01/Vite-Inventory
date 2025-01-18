<template>
    <b-modal v-model="showModal" title="Information">
        <div class="item-image">
            <img :src="modalItem.imageUrl || 'https://picsum.photos/600/300/?image=25'"
                :alt="modalItem.name || 'Item Image'" class="img-fluid" />
        </div>
        <p class="modal-item-name">{{ modalItem.name }}</p>
        <p><strong>Stock:</strong> {{ modalItem.stock }}</p>
        <p><strong>Created At:</strong> {{ formatDate(modalItem.created_at) }}</p>
        <p><strong>Updated At:</strong> {{ formatDate(modalItem.updated_at) }}</p>

        <!-- Input jumlah item -->
        <div class="quantity-section">
            <p><strong>Quantity:</strong></p>
            <b-button variant="outline-secondary" @click="decrementQuantity" :disabled="quantity <= 0">-</b-button>
            <span class="mx-2">{{ quantity }}</span>
            <b-button variant="outline-secondary" @click="incrementQuantity"
                :disabled="quantity >= modalItem.stock">+</b-button>
        </div>

        <!-- Tampilkan pesan error -->
        <p v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p>

        <!-- Footer kustom -->
        <template #footer>
            <b-button variant="secondary" @click="closeModal">Cancel</b-button>
            <b-button variant="primary" @click="handleAction" :disabled="quantity === 0">{{ actionLabel }}</b-button>
        </template>
    </b-modal>
</template>

<script>
import { ref, watch } from 'vue';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { addChart, updateChartById } from '../api';
import { useAlertStore } from '../store/alert';


export default {
    name: 'ItemDetail',
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
        show: {
            type: Boolean,
            default: false,
        },
        mode: {
            type: String,
            default: 'add',
        },
    },
    setup(props, { emit }) {
        const alertStore = useAlertStore();
        const modalItem = ref(props.item);
        const showModal = ref(props.show);
        const quantity = ref(0);
        const loading = ref(false); // Tambahkan state loading untuk menghindari klik ganda
        const errorMessage = ref('');

        watch(() => props.item, (newItem) => {
            console.log('New item received in ItemDetail:', newItem); // Debug
            modalItem.value = { ...newItem }; // Spread untuk memastikan reaktivitas
            quantity.value = newItem.quantity || 0;
            showModal.value = true;
        }, { deep: true });

        watch(() => props.show, (newShowValue) => {
            showModal.value = newShowValue;
        });

        // Watch for modal visibility changes
        watch(showModal, (newValue) => {
            if (!newValue) {
                quantity.value = 0; // Reset quantity saat modal ditutup
                emit('update:show', false); // Emit event untuk menyinkronkan parent
            }
        });

        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }
            return format(date, "dd MMMM yyyy HH:mm", { locale: id });
        };

        const incrementQuantity = () => {
            if (quantity.value < modalItem.value.stock) {
                quantity.value += 1;
            }
        };

        const decrementQuantity = () => {
            if (quantity.value > 0) {
                quantity.value -= 1;
            }
        };

        const handleAction = async () => {
            loading.value = true;
            errorMessage.value = '';

            const data = { item_id: modalItem.value.item_id, quantity: quantity.value };
            try {
                if (props.mode === 'add') {
                    await addChart(data);
                    emit('add-to-chart', data);
                    alertStore.showAlert(data.message || 'Chart created successfully', false);
                } else {
                    const response = await updateChartById(modalItem.value.transaction_id, data);
                    emit('update-chart', data);
                    alertStore.showAlert(response.message || 'Chart updated successfully', false);
                }
                showModal.value = false;
            } catch (error) {
                console.error('Error:', error);
                errorMessage.value = 'Failed to add to chart or update chart.';
                alertStore.showAlert('Failed to process the action. Please try again.', true); // Tampilkan alert error
            } finally {
                loading.value = false;
            }
        };

        const closeModal = () => {
            showModal.value = false;
            quantity.value = 0;
        };

        const actionLabel = props.mode === 'add' ? 'Add to Chart' : 'Update Chart';

        return {
            modalItem,
            showModal,
            formatDate,
            quantity,
            incrementQuantity,
            decrementQuantity,
            closeModal,
            loading,
            errorMessage,
            actionLabel,
            handleAction,
        };
    },
};
</script>

<style>
.modal-item-name {
    font-size: 27px;
    /* Besarkan ukuran font */
    font-weight: bold;
    margin-bottom: 30px;
}

.quantity-section {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 50px;
}
</style>
