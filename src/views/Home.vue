<template>
    <div class="home-container">
        <h1 class="text-left mb-4"><span class="icon me-2"><i class="mdi mdi-book-multiple"></i></span>Inventory List</h1>
        <b-container class="px-4">
            <b-row class="mx-n3">
                <b-col v-for="item in items" :key="item.item_id" cols="12" sm="6" md="4" lg="3" class="px-3 mb-4">
                    <b-card :title="item.name" img-src="https://picsum.photos/600/300/?image=25" img-alt="Item Image"
                        :footer="'Updated At: ' + formatDate(item.updated_at)" img-top tag="article"
                        class="h-100" @click="openModal(item.item_id)">
                        <b-card-text>
                            Stock: {{ item.stock }}<br />
                        </b-card-text>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>

        <!-- Menampilkan modal ItemDetail dengan data item -->
        <ItemDetail :item="selectedItem" :show="modalVisible" @update:show="modalVisible = $event" :mode="'add'" />
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getItems, getItemById } from '../api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ItemDetail from '../components/ItemDetail.vue';

export default {
    name: 'Home',
    components: {
        ItemDetail,
    },
    setup() {
        const items = ref([]);
        const modalVisible = ref(false);
        const selectedItem = ref({}); // Untuk menyimpan item yang dipilih

        const fetchItems = async () => {
            try {
                items.value = await getItems();
            } catch (error) {
                console.error('Failed to fetch items:', error);
            }
        };

        const openModal = async (itemId) => {
            try {
                const itemData = await getItemById(itemId); // Memanggil API untuk mendapatkan detail item
                console.log('Item Data:', itemData);
                selectedItem.value = itemData;  // Menyimpan data item ke selectedItem
                modalVisible.value = false; // Reset modal visibility before showing new item
                modalVisible.value = true; // Tampilkan modal
            } catch (error) {
                console.error('Error fetching item details:', error);
            }
        };

        onMounted(() => {
            fetchItems();
        });

        // Fungsi untuk memformat tanggal
        const formatDate = (dateStr) => {
            return format(new Date(dateStr), "dd MMMM yyyy HH:mm", { locale: id });
        };

        return {
            items,
            modalVisible,
            selectedItem,
            formatDate,
            openModal,
        };
    },
};
</script>

<style scoped>
.home-container {
    margin: 0 auto;
    padding: 15px;
    border-radius: 8px;
}

.container {
    max-width: 1400px !important;
    margin: 0 auto;
}

.error {
    color: red;
    margin-top: 10px;
}

.card {
    transition: transform 0.2s;
    cursor: pointer;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.card-img-top {
    height: 200px;
    object-fit: cover;
}
</style>