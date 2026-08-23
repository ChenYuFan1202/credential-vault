<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getApiErrorMessage, getUnknownErrorMessage } from "../api/errors";
import CredentialList from "../components/CredentialList.vue";

type Credential = {
  id: string;
  platform: string;
  username: string;
  password: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type CredentialListResponse = {
  data: Credential[];
};

const credentials = ref<Credential[]>([]);
const isCredentialLoading = ref(true);
const credentialErrorMessage = ref("");
const deletingCredentialId = ref<string | null>(null);
const deleteCredentialErrorMessage = ref("");
const isExportingCredentials = ref(false);
const exportCredentialErrorMessage = ref("");

function formatExportTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

function downloadTextFile(text: string): void {
  const blob = new Blob([text], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `credential-vault-export-${formatExportTimestamp(new Date())}.txt`;
  link.click();

  URL.revokeObjectURL(url);
}

async function loadCredentials(): Promise<void> {
  isCredentialLoading.value = true;
  credentialErrorMessage.value = "";

  try {
    const response = await fetch("http://localhost:3000/credentials", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Could not load credentials."),
      );
    }

    const body = (await response.json()) as CredentialListResponse;

    credentials.value = body.data;
  } catch (error: unknown) {
    credentialErrorMessage.value = getUnknownErrorMessage(error);
  } finally {
    isCredentialLoading.value = false;
  }
}

async function deleteCredential(id: string): Promise<void> {
  deletingCredentialId.value = id;
  deleteCredentialErrorMessage.value = "";

  try {
    const response = await fetch(`http://localhost:3000/credentials/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Could not delete credential.", {
          404: "Credential could not be found.",
        }),
      );
    }

    await loadCredentials();
  } catch (error: unknown) {
    deleteCredentialErrorMessage.value = getUnknownErrorMessage(error);
  } finally {
    deletingCredentialId.value = null;
  }
}

async function exportCredentials(): Promise<void> {
  isExportingCredentials.value = true;
  exportCredentialErrorMessage.value = "";

  try {
    const response = await fetch("http://localhost:3000/credentials/export.txt", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Could not export credentials."),
      );
    }

    downloadTextFile(await response.text());
  } catch (error: unknown) {
    exportCredentialErrorMessage.value = getUnknownErrorMessage(error);
  } finally {
    isExportingCredentials.value = false;
  }
}

onMounted(() => {
  void loadCredentials();
});
</script>

<template>
  <CredentialList
    :credentials="credentials"
    :is-loading="isCredentialLoading"
    :error-message="credentialErrorMessage"
    :deleting-credential-id="deletingCredentialId"
    :delete-error-message="deleteCredentialErrorMessage"
    :is-exporting="isExportingCredentials"
    :export-error-message="exportCredentialErrorMessage"
    @delete="deleteCredential"
    @export="exportCredentials"
  />
</template>
