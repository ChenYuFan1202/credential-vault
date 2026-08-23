<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
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

type CredentialResponse = {
  data: Credential;
};

type EditCredentialForm = {
  platform: string;
  username: string;
  password: string;
  notes: string;
};

const credentials = ref<Credential[]>([]);
const isCredentialLoading = ref(true);
const credentialErrorMessage = ref("");
const deletingCredentialId = ref<string | null>(null);
const deleteCredentialErrorMessage = ref("");
const selectedCredentialId = ref<string | null>(null);
const selectedCredential = ref<Credential | null>(null);
const isLoadingSelectedCredential = ref(false);
const selectedCredentialErrorMessage = ref("");
const isEditingCredential = ref(false);
const editCredential = ref<EditCredentialForm>({
  platform: "",
  username: "",
  password: "",
  notes: "",
});
const isUpdatingCredential = ref(false);
const updateCredentialErrorMessage = ref("");

const canUpdateCredential = computed(() => {
  return (
    editCredential.value.platform.trim() !== "" &&
    editCredential.value.username.trim() !== "" &&
    editCredential.value.password !== ""
  );
});

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

async function loadCredentialDetail(id: string): Promise<void> {
  selectedCredentialId.value = id;
  selectedCredential.value = null;
  selectedCredentialErrorMessage.value = "";
  isEditingCredential.value = false;
  updateCredentialErrorMessage.value = "";
  isLoadingSelectedCredential.value = true;

  try {
    const response = await fetch(`http://localhost:3000/credentials/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Could not load credential detail.", {
          404: "Credential could not be found.",
        }),
      );
    }

    const body = (await response.json()) as CredentialResponse;

    selectedCredential.value = body.data;
  } catch (error: unknown) {
    selectedCredentialErrorMessage.value = getUnknownErrorMessage(error);
  } finally {
    isLoadingSelectedCredential.value = false;
  }
}

function closeCredentialDetail(): void {
  selectedCredentialId.value = null;
  selectedCredential.value = null;
  selectedCredentialErrorMessage.value = "";
  isEditingCredential.value = false;
  updateCredentialErrorMessage.value = "";
}

function startEditingCredential(): void {
  if (selectedCredential.value === null) {
    return;
  }

  editCredential.value = {
    platform: selectedCredential.value.platform,
    username: selectedCredential.value.username,
    password: selectedCredential.value.password,
    notes: selectedCredential.value.notes ?? "",
  };

  updateCredentialErrorMessage.value = "";
  isEditingCredential.value = true;
}

function cancelEditingCredential(): void {
  isEditingCredential.value = false;
  updateCredentialErrorMessage.value = "";
}

function updateEditCredentialField(
  field: keyof EditCredentialForm,
  value: string,
): void {
  editCredential.value = {
    ...editCredential.value,
    [field]: value,
  };
}

async function updateCredential(): Promise<void> {
  const credentialId = selectedCredentialId.value;

  if (credentialId === null) {
    return;
  }

  isUpdatingCredential.value = true;
  updateCredentialErrorMessage.value = "";

  try {
    const response = await fetch(
      `http://localhost:3000/credentials/${credentialId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: editCredential.value.platform,
          username: editCredential.value.username,
          password: editCredential.value.password,
          notes: editCredential.value.notes || null,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Could not update credential.", {
          400: "Platform, username, and password are required.",
          404: "Credential could not be found.",
        }),
      );
    }

    await loadCredentials();
    await loadCredentialDetail(credentialId);
    isEditingCredential.value = false;
  } catch (error: unknown) {
    updateCredentialErrorMessage.value = getUnknownErrorMessage(error);
  } finally {
    isUpdatingCredential.value = false;
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
    :selected-credential-id="selectedCredentialId"
    :selected-credential="selectedCredential"
    :is-loading-selected-credential="isLoadingSelectedCredential"
    :selected-credential-error-message="selectedCredentialErrorMessage"
    :is-editing-credential="isEditingCredential"
    :edit-credential="editCredential"
    :can-update-credential="canUpdateCredential"
    :is-updating-credential="isUpdatingCredential"
    :update-credential-error-message="updateCredentialErrorMessage"
    @view="loadCredentialDetail"
    @delete="deleteCredential"
    @start-edit="startEditingCredential"
    @cancel-edit="cancelEditingCredential"
    @update="updateCredential"
    @close-detail="closeCredentialDetail"
    @update-edit-field="updateEditCredentialField"
  />
</template>
