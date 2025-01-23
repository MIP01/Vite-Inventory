<template>
  <b-modal v-model="isVisible">
    <!-- Slot untuk custom title -->
    <template #title>
            <i class="mdi mdi-information-outline"></i> Information
        </template>
    <div>
      <h5>Items to Loan</h5>
      <b-table :items="filteredItems" :fields="fields" small bordered responsive>
        <template #cell(quantity)="data">
          <span>{{ data.item.quantity }}</span>
        </template>
      </b-table>
    </div>

    <b-form>
      <b-row class="mt-3">
        <!-- Out Date -->
        <b-col md="6">
          <label for="out-date">Out Date</label>
          <BForm @submit.stop.prevent>
            <BFormInput id="out-date" v-model="outDate" :state="outDateValid" placeholder="Fill out date" required />
            <BFormInvalidFeedback :state="outDateValid">
              Out Date must be in the format YYYY-MM-DD and cannot be empty.
            </BFormInvalidFeedback>
            <BFormValidFeedback :state="outDateValid">Looks good!</BFormValidFeedback>
          </BForm>
        </b-col>

        <!-- Entry Date -->
        <b-col md="6">
          <label for="entry-date">Entry Date</label>
          <BForm @submit.stop.prevent>
            <BFormInput id="entry-date" v-model="entryDate" :state="entryDateValid" placeholder="Fill entry date"
              required />
            <BFormInvalidFeedback :state="entryDateValid">
              Entry Date must be in the format YYYY-MM-DD and cannot be empty.
            </BFormInvalidFeedback>
            <BFormValidFeedback :state="entryDateValid">Looks good!</BFormValidFeedback>
          </BForm>
        </b-col>
      </b-row>
    </b-form>
    <!-- Footer kustom -->
    <template #footer>
      <b-button variant="secondary" @click="closeModal">Cancel</b-button>
      <b-button variant="primary" @click="handleAction">{{ actionLabel }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import { ref, computed, watch } from "vue";
import { addDetail, updateDetail } from "../api";
import { useAlertStore } from '../store/alert';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default {
  name: "TransactionModal",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    selectedItem: {
      type: Object,
      required: false,  // This will be passed from the parent component
    },
    selectedCode: { // Tambahkan properti ini
      type: String,
      required: false,
      default: null,
    },
    mode: {
      type: String,
      default: 'add',
    },
  },
  emits: ["update:show", "update-chart"],
  setup(props, { emit }) {
    const alertStore = useAlertStore();
    const transactioModal = ref(props.show);
    const outDate = ref("");
    const entryDate = ref("");
    const loading = ref(false); // Tambahkan state loading untuk menghindari klik ganda


    const fields = [
      { key: "item_name", label: "Item Name" },
      { key: "quantity", label: "Quantity" },
    ];

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, "yyyy-MM-dd", { locale: id });
    };

    watch(
      () => props.selectedItem,
      (newItem) => {
        if (newItem) {
          outDate.value = formatDate(newItem.out) || '';  // Setting out date based on selected item
          entryDate.value = formatDate(newItem.entry) || '';  // Setting entry date based on selected item
        }
      },
      { immediate: true }
    );

    // Validation logic
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const outDateValid = computed(() => dateRegex.test(outDate.value));
    const entryDateValid = computed(() => dateRegex.test(entryDate.value));

    // Filter items with status 'draft'
    const draftItems = computed(() =>
      props.items.filter((item) => item.status === "draft")
    );

    // Filter items with same code
    const codeItems = computed(() =>
      props.items.filter((item) => item.code === props.selectedCode)
    );

    const filteredItems = computed(() => {
      return props.mode === "add" ? draftItems.value : codeItems.value;
    });

    // Update modal visibility
    const isVisible = computed({
      get: () => props.show,
      set: (value) => emit("update:show", value),
    });

    const closeModal = () => {
      emit("update:show", false);
    };

    const handleAction = async () => {
      loading.value = true;

      const data = { out: outDate.value, entry: entryDate.value };
      try {
        if (props.mode === 'add') {
          await addDetail(data);
          emit('add-transaction', data);
          alertStore.showAlert(data.message || 'Chart created successfully', false);
        } else {
          const response = await updateDetail(props.selectedItem.detail_id, data);
          emit('update-transaction', data);
          alertStore.showAlert(response.message || 'Chart updated successfully', false);
        }
        isVisible.value = false;
      } catch (error) {
        console.error('Error:', error);
        alertStore.showAlert(
          error.response?.data?.errors.join(", ") || 'An unexpected error occurred',
          true
        );
      } finally {
        loading.value = false;
      }
    };

    const actionLabel = computed(() => (props.mode === 'add' ? 'Add Transaction' : 'Update Transaction'));

    return {
      fields,
      filteredItems,
      isVisible,
      outDate,
      entryDate,
      outDateValid,
      entryDateValid,
      handleAction,
      closeModal,
      actionLabel,
      transactioModal,
      outDate,
      entryDate,
      formatDate,
      loading,
    };
  },
};
</script>

<style scoped>
.mt-3 {
  margin-top: 1rem;
}
</style>
