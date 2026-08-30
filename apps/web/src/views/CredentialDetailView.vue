<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiUrl } from "../api/client";
import { getApiErrorMessage, getUnknownErrorMessage } from "../api/errors";
import CredentialDetail from "../components/CredentialDetail.vue";

type Credential = {
  id: string;
  platform: string;
  username: string;
  password: string;
  notes: string | null;
  customFields: CredentialCustomField[];
  createdAt: string;
  updatedAt: string;
};

type CredentialCustomField = {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type CredentialResponse = {
  data: Credential;
};

type EditCredentialForm = {
  platform: string;
  username: string;
  password: string;
  notes: string;
  customFields: EditCredentialCustomFieldForm[];
};

type EditCredentialCustomFieldForm = {
  label: string;
  value: string;
};

const route = useRoute();
const router = useRouter();

const credential = ref<Credential | null>(null);
const isLoadingCredential = ref(false);
const credentialErrorMessage = ref("");
const isEditingCredential = ref(false);
const editCredential = ref<EditCredentialForm>({
  platform: "",
  username: "",
  password: "",
  notes: "",
  customFields: [],
});
const isUpdatingCredential = ref(false);
const updateCredentialErrorMessage = ref("");

const credentialId = computed(() => {
  return typeof route.params.id === "string" ? route.params.id : "";
});

function isCompleteCustomField(field: EditCredentialCustomFieldForm): boolean {
  return field.label.trim() !== "" && field.value !== "";
}

const canUpdateCredential = computed(() => {
  return (
    editCredential.value.platform.trim() !== "" &&
    editCredential.value.username.trim() !== "" &&
    editCredential.value.password !== "" &&
    editCredential.value.customFields.every(isCompleteCustomField)
  );
});

async function loadCredentialDetail(): Promise<void> {
  isLoadingCredential.value = true;
  credential.value = null;
  credentialErrorMessage.value = "";
  isEditingCredential.value = false;
  updateCredentialErrorMessage.value = "";

  try {
    const response = await fetch(apiUrl(`/credentials/${credentialId.value}`), {
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

    credential.value = body.data;
  } catch (error: unknown) {
    credentialErrorMessage.value = getUnknownErrorMessage(error);
  } finally {
    isLoadingCredential.value = false;
  }
}

function startEditingCredential(): void {
  if (credential.value === null) {
    return;
  }

  editCredential.value = {
    platform: credential.value.platform,
    username: credential.value.username,
    password: credential.value.password,
    notes: credential.value.notes ?? "",
    customFields: credential.value.customFields.map((field) => ({
      label: field.label,
      value: field.value,
    })),
  };

  updateCredentialErrorMessage.value = "";
  isEditingCredential.value = true;
}

function cancelEditingCredential(): void {
  isEditingCredential.value = false;
  updateCredentialErrorMessage.value = "";
}

function updateEditCredentialField(
  field: Exclude<keyof EditCredentialForm, "customFields">,
  value: string,
): void {
  editCredential.value = {
    ...editCredential.value,
    [field]: value,
  };
}

function addEditCustomField(): void {
  editCredential.value.customFields.push({
    label: "",
    value: "",
  });
}

function removeEditCustomField(index: number): void {
  editCredential.value.customFields.splice(index, 1);
}

function updateEditCustomField(
  index: number,
  field: keyof EditCredentialCustomFieldForm,
  value: string,
): void {
  const customField = editCredential.value.customFields[index];

  if (customField === undefined) {
    return;
  }

  editCredential.value.customFields[index] = {
    ...customField,
    [field]: value,
  };
}

function getSubmittedCustomFields(): EditCredentialCustomFieldForm[] {
  return editCredential.value.customFields
    .map((field) => ({
      label: field.label.trim(),
      value: field.value,
    }))
    .filter((field) => field.label !== "" && field.value !== "");
}

async function updateCredential(): Promise<void> {
  isUpdatingCredential.value = true;
  updateCredentialErrorMessage.value = "";

  try {
    const response = await fetch(apiUrl(`/credentials/${credentialId.value}`), {
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
        customFields: getSubmittedCustomFields(),
      }),
    });

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Could not update credential.", {
          400: "Platform, username, and password are required.",
          404: "Credential could not be found.",
        }),
      );
    }

    await loadCredentialDetail();
    isEditingCredential.value = false;
  } catch (error: unknown) {
    updateCredentialErrorMessage.value = getUnknownErrorMessage(error);
  } finally {
    isUpdatingCredential.value = false;
  }
}

onMounted(() => {
  void loadCredentialDetail();
});
</script>

<template>
  <section class="credential-panel">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Credential Detail</p>
        <h2>{{ credential?.platform ?? "Credential" }}</h2>
        <p v-if="credential?.notes" class="empty-message">
          {{ credential.notes }}
        </p>
      </div>
    </div>

    <CredentialDetail
      :credential="credential"
      :is-loading="isLoadingCredential"
      :error-message="credentialErrorMessage"
      :is-editing="isEditingCredential"
      :edit-credential="editCredential"
      :can-update="canUpdateCredential"
      :is-updating="isUpdatingCredential"
      :update-error-message="updateCredentialErrorMessage"
      @start-edit="startEditingCredential"
      @cancel-edit="cancelEditingCredential"
      @update="updateCredential"
      @close="router.push('/credentials')"
      @add-custom-field="addEditCustomField"
      @remove-custom-field="removeEditCustomField"
      @update-edit-field="updateEditCredentialField"
      @update-edit-custom-field="updateEditCustomField"
    />
  </section>
</template>
