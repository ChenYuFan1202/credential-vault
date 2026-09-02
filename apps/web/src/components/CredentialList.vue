<script setup lang="ts">
import { computed, ref } from "vue";
import { Download, Plus, Trash2 } from "lucide-vue-next";
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

function updateSearchQuery(event: Event): void {
  const input = event.target as HTMLInputElement;

  searchQuery.value = input.value.trim();
}
</script>

<template>
  <section class="credential-panel credential-list-panel" aria-live="polite">
    <div class="section-heading credential-list-heading">
      <div>
        <h2>Stored Credentials</h2>
      </div>

      <div class="credential-actions">
        <RouterLink
          class="button-link compact-action-button"
          to="/credentials/new"
          aria-label="Add credential"
          title="Add credential"
        >
          <Plus :size="18" aria-hidden="true" />
          <span class="compact-action-label">Add Credential</span>
        </RouterLink>

        <button
          type="button"
          class="compact-action-button"
          aria-label="Export TXT"
          title="Export TXT"
          :disabled="isExporting || credentials.length === 0"
          @click="requestExportCredentials"
        >
          <Download :size="18" aria-hidden="true" />
          <span class="compact-action-label">Export TXT</span>
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
          :value="searchQuery"
          type="text"
          inputmode="search"
          autocomplete="off"
          placeholder="GitHub"
          @input="updateSearchQuery"
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
          <RouterLink
            class="credential-card-link"
            :to="`/credentials/${credential.id}`"
          >
            <strong>{{ credential.platform }}</strong>

            <p v-if="credential.notes">
              {{ credential.notes }}
            </p>
          </RouterLink>

          <div class="credential-card-footer">
            <button
              type="button"
              class="icon-button danger-button"
              :aria-label="`Delete ${credential.platform}`"
              :title="`Delete ${credential.platform}`"
              @click="requestDeleteCredential(credential.id)"
            >
              <Trash2 :size="18" aria-hidden="true" />
            </button>
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
