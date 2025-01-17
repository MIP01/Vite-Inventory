<template>
    <div class="home-container">
        <h1 class="text-left mb-4">Inventory List</h1>
        <b-container>
            <b-row>
                <b-col v-for="item in items" :key="item.item_id" cols="12" md="4">
                    <b-card :title="item.name" img-src="https://picsum.photos/600/300/?image=25" img-alt="Item Image"
                        :footer="'Updated At: ' + formatDate(item.updated_at)" img-top tag="article"
                        style="max-width: 20rem; cursor: pointer;" @click="openModal(item.item_id)">
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
    padding: 30px;
    border-radius: 8px;
}

.error {
    color: red;
    margin-top: 10px;
}
</style>