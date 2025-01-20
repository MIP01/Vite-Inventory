<template>
  <b-modal id="transaction-modal" title="Loan Items" :visible="isVisible" @hide="closeModal" ok-title="Submit Loan"
    cancel-title="Cancel" size="lg" @ok="onSubmit">
    <div>
      <h5>Items to Loan</h5>
      <b-table :items="draftItems" :fields="fields" small bordered responsive>
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
  </b-modal>
</template>

<script>
import { ref, computed } from "vue";
import { addDetail } from "../api";
import { useAlertStore } from '../store/alert';

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
  },
  emits: ["update:show", "update-chart"],
  setup(props, { emit }) {
    const alertStore = useAlertStore();
    const outDate = ref("");
    const entryDate = ref("");

    const fields = [
      { key: "item_name", label: "Item Name" },
      { key: "quantity", label: "Quantity" },
    ];

    // Validation logic
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const outDateValid = computed(() => dateRegex.test(outDate.value));
    const entryDateValid = computed(() => dateRegex.test(entryDate.value));

    // Filter items with status 'draft'
    const draftItems = computed(() =>
      props.items.filter((item) => item.status === "draft")
    );
    
    // Update modal visibility
    const isVisible = computed({
      get: () => props.show,
      set: (value) => emit("update:show", value),
    });

    const closeModal = () => {
      emit("update:show", false);
    };

    const onSubmit = async () => {
      try {
        if (!outDateValid.value || !entryDateValid.value) {
          alertStore.showAlert("Both Out Date and Entry Date must be valid!");
          return;
        }

        const loanData = {
          out: outDate.value,
          entry: entryDate.value,
        };

        await addDetail(loanData);
        alertStore.showAlert(loanData.message || 'Loan transaction submitted successfully!', false);
        emit("update-chart");
        closeModal();
      } catch (error) {
        console.error('Error:', error);
        alertStore.showAlert(
          error.response?.data?.errors.join(", ") || "Failed to submit loan transaction. Please try again.",
          true
        );
      }
    };

    return {
      fields,
      draftItems,
      isVisible,
      outDate,
      entryDate,
      outDateValid,
      entryDateValid,
      onSubmit,
      closeModal,
    };
  },
};
</script>

<style scoped>
.mt-3 {
  margin-top: 1rem;
}
</style>
