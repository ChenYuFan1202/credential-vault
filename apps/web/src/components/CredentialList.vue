<script setup lang="ts">
import { computed, ref } from "vue";
import ConfirmDialog from "./ConfirmDialog.vue";
import CredentialDetail from "./CredentialDetail.vue";

type Credential = {
  id: string;
  platform: string;
  username: string;
  password: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type EditCredentialForm = {
  platform: string;
  username: string;
  password: string;
  notes: string;
};

type EditCredentialField = keyof EditCredentialForm;

const props = defineProps<{
  credentials: Credential[];
  isLoading: boolean;
  errorMessage: string;
  deletingCredentialId: string | null;
  deleteErrorMessage: string;
  selectedCredentialId: string | null;
  selectedCredential: Credential | null;
  isLoadingSelectedCredential: boolean;
  selectedCredentialErrorMessage: string;
  isEditingCredential: boolean;
  editCredential: EditCredentialForm;
  canUpdateCredential: boolean;
  isUpdatingCredential: boolean;
  updateCredentialErrorMessage: string;
}>();

const emit = defineEmits<{
  refresh: [];
  view: [id: string];
  delete: [id: string];
  startEdit: [];
  cancelEdit: [];
  update: [];
  closeDetail: [];
  updateEditField: [field: EditCredentialField, value: string];
}>();

const credentialPendingDeleteId = ref<string | null>(null);

const credentialPendingDelete = computed(() => {
  return (
    props.credentials.find(
      (credential) => credential.id === credentialPendingDeleteId.value,
    ) ?? null
  );
});

function requestDeleteCredential(id: string): void {
  credentialPendingDeleteId.value = id;
}

function cancelDeleteCredential(): void {
  credentialPendingDeleteId.value = null;
}

function confirmDeleteCredential(): void {
  if (credentialPendingDeleteId.value === null) {
    return;
  }

  emit("delete", credentialPendingDeleteId.value);
}
</script>

<template>
  <section class="credential-panel" aria-live="polite">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Credentials</p>
        <h2>Stored Credentials</h2>
      </div>

      <button type="button" @click="emit('refresh')">
        Refresh
      </button>
    </div>

    <p v-if="isLoading">Loading credentials...</p>

    <p v-else-if="errorMessage" class="error">
      {{ errorMessage }}
    </p>

    <p v-else-if="credentials.length === 0" class="empty-message">
      No credentials yet.
    </p>

    <template v-else>
      <p v-if="deleteErrorMessage" class="error">
        {{ deleteErrorMessage }}
      </p>

      <ul class="credential-list">
        <li v-for="credential in credentials" :key="credential.id">
          <div class="credential-item-heading">
            <div class="credential-summary">
              <strong>{{ credential.platform }}</strong>

              <p v-if="credential.notes">
                {{ credential.notes }}
              </p>
            </div>

            <div class="credential-actions">
              <button
                v-if="selectedCredentialId !== credential.id"
                type="button"
                @click="emit('view', credential.id)"
              >
                View
              </button>

              <button
                type="button"
                class="danger-button"
                @click="requestDeleteCredential(credential.id)"
              >
                Delete
              </button>
            </div>
          </div>

          <CredentialDetail
            v-if="selectedCredentialId === credential.id"
            :credential="selectedCredential"
            :is-loading="isLoadingSelectedCredential"
            :error-message="selectedCredentialErrorMessage"
            :is-editing="isEditingCredential"
            :edit-credential="editCredential"
            :can-update="canUpdateCredential"
            :is-updating="isUpdatingCredential"
            :update-error-message="updateCredentialErrorMessage"
            @start-edit="emit('startEdit')"
            @cancel-edit="emit('cancelEdit')"
            @update="emit('update')"
            @close="emit('closeDetail')"
            @update-edit-field="
              (field, value) => emit('updateEditField', field, value)
            "
          />
        </li>
      </ul>
    </template>

    <ConfirmDialog
      v-if="credentialPendingDelete"
      title="Delete Credential"
      :message="`Delete ${credentialPendingDelete.platform}? This cannot be undone.`"
      confirm-label="Delete"
      :is-confirming="deletingCredentialId === credentialPendingDelete.id"
      @confirm="confirmDeleteCredential"
      @cancel="cancelDeleteCredential"
    />
  </section>
</template>
