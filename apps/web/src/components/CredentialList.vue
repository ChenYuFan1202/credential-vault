<script setup lang="ts">
import { computed, ref } from "vue";
import ConfirmDialog from "./ConfirmDialog.vue";

type Credential = {
  id: string;
  platform: string;
  username: string;
  password: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

const props = defineProps<{
  credentials: Credential[];
  isLoading: boolean;
  errorMessage: string;
  deletingCredentialId: string | null;
  deleteErrorMessage: string;
  isExporting: boolean;
  exportErrorMessage: string;
}>();

const emit = defineEmits<{
  delete: [id: string];
  export: [];
}>();

const credentialPendingDeleteId = ref<string | null>(null);
const isExportConfirmOpen = ref(false);

const credentialPendingDelete = computed(() => {
  return (
    props.credentials.find(
      (credential) => credential.id === credentialPendingDeleteId.value,
    ) ?? null
  );
});
const searchQuery = ref("");

const filteredCredentials = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();

  if (keyword === "") {
    return props.credentials;
  }

  return props.credentials.filter((credential) =>
    credential.platform.toLowerCase().includes(keyword),
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

function requestExportCredentials(): void {
  isExportConfirmOpen.value = true;
}

function cancelExportCredentials(): void {
  isExportConfirmOpen.value = false;
}

function confirmExportCredentials(): void {
  isExportConfirmOpen.value = false;
  emit("export");
}
</script>

<template>
  <section class="credential-panel" aria-live="polite">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Credentials</p>
        <h2>Stored Credentials</h2>
      </div>

      <div class="credential-actions">
        <RouterLink class="button-link" to="/credentials/new">
          Add Credential
        </RouterLink>

        <button
          type="button"
          :disabled="isExporting || credentials.length === 0"
          @click="requestExportCredentials"
        >
          Export TXT
        </button>
      </div>
    </div>

    <p v-if="isLoading">Loading credentials...</p>

    <p v-else-if="errorMessage" class="error">
      {{ errorMessage }}
    </p>

    <p v-else-if="credentials.length === 0" class="empty-message">
      No credentials yet.
    </p>

    <template v-else>
      <label class="search-field">
        <span>Search Platform</span>
        <input
          v-model="searchQuery"
          type="search"
          autocomplete="off"
          placeholder="GitHub"
        />
      </label>

      <p v-if="deleteErrorMessage" class="error">
        {{ deleteErrorMessage }}
      </p>

      <p v-if="exportErrorMessage" class="error">
        {{ exportErrorMessage }}
      </p>

      <p v-if="filteredCredentials.length === 0" class="empty-message">
        No matching credentials.
      </p>

      <ul v-else class="credential-list">
        <li v-for="credential in filteredCredentials" :key="credential.id">
          <div class="credential-item-heading">
            <div class="credential-summary">
              <strong>{{ credential.platform }}</strong>

              <p v-if="credential.notes">
                {{ credential.notes }}
              </p>
            </div>

            <div class="credential-actions">
              <RouterLink class="button-link" :to="`/credentials/${credential.id}`">
                View
              </RouterLink>

              <button
                type="button"
                class="danger-button"
                @click="requestDeleteCredential(credential.id)"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      </ul>
    </template>

    <ConfirmDialog
      v-if="credentialPendingDelete"
      title="Delete Credential"
      :message="`Delete ${credentialPendingDelete.platform}? This cannot be undone.`"
      confirm-label="Delete"
      confirming-label="Deleting..."
      confirm-variant="danger"
      :is-confirming="deletingCredentialId === credentialPendingDelete.id"
      @confirm="confirmDeleteCredential"
      @cancel="cancelDeleteCredential"
    />

    <ConfirmDialog
      v-if="isExportConfirmOpen"
      title="Export Credentials"
      message="Export decrypted credentials as a TXT file. Anyone with this file can read the contents, so store it carefully."
      confirm-label="Export TXT"
      confirming-label="Exporting..."
      confirm-variant="primary"
      :is-confirming="isExporting"
      @confirm="confirmExportCredentials"
      @cancel="cancelExportCredentials"
    />
  </section>
</template>
