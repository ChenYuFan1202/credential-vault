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
    @delete="deleteCredential"
  />
</template>
