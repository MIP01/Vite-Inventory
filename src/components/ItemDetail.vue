<template>
    <b-modal v-model="showModal" :title="modalItem.name">
        <p><strong>Stock:</strong> {{ modalItem.stock }}</p>
        <p><strong>Created At:</strong> {{ formatDate(modalItem.created_at) }}</p>
        <p><strong>Updated At:</strong> {{ formatDate(modalItem.updated_at) }}</p>

        <!-- Footer kustom -->
        <template #footer>
            <b-button variant="secondary" @click="closeModal">Cancel</b-button>
            <b-button variant="primary" @click="addToChart">Add to Chart</b-button>
        </template>
    </b-modal>
</template>


<script>
import { ref, watch, onMounted } from 'vue';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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
    },
    setup(props, { emit }) {
        const modalItem = ref(props.item);
        const showModal = ref(props.show);

        // Watch for prop changes to update modalItem
        watch(() => props.item, (newItem) => {
            console.log('Item updated in modal:', newItem);
            modalItem.value = newItem;
            showModal.value = true; // Show modal when item is updated
        });

        // Watch for showModal changes and emit to parent
        watch(() => props.show, (newShowValue) => {
            console.log('Show Modal updated:', newShowValue);
            showModal.value = newShowValue;  // Ensure reactivity works on showModal
        });

        // Format date function
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                return 'Invalid date'; // Check if date is invalid
            }
            return format(date, "dd MMMM yyyy HH:mm", { locale: id });
        };

        // Tambahkan metode untuk menangani aksi tombol
        const addToChart = () => {
            console.log('Item added to chart:', modalItem.value);
            emit('add-to-chart', modalItem.value); // Emit event ke parent
            showModal.value = false;
        };

        const closeModal = () => {
            showModal.value = false;
        };

        return {
            modalItem,
            showModal,
            formatDate,
            addToChart,
            closeModal,
        };
    },
};
</script>