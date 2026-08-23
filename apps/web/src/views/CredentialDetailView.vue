<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getApiErrorMessage, getUnknownErrorMessage } from "../api/errors";
import CredentialDetail from "../components/CredentialDetail.vue";

type Credential = {
  id: string;
  platform: string;
  username: string;
  password: string;
  notes: string | null;
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
});
const isUpdatingCredential = ref(false);
const updateCredentialErrorMessage = ref("");

const credentialId = computed(() => {
  return typeof route.params.id === "string" ? route.params.id : "";
});

const canUpdateCredential = computed(() => {
  return (
    editCredential.value.platform.trim() !== "" &&
    editCredential.value.username.trim() !== "" &&
    editCredential.value.password !== ""
  );
});

async function loadCredentialDetail(): Promise<void> {
  isLoadingCredential.value = true;
  credential.value = null;
  credentialErrorMessage.value = "";
  isEditingCredential.value = false;
  updateCredentialErrorMessage.value = "";

  try {
    const response = await fetch(
      `http://localhost:3000/credentials/${credentialId.value}`,
      {
        credentials: "include",
      },
    );

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
  isUpdatingCredential.value = true;
  updateCredentialErrorMessage.value = "";

  try {
    const response = await fetch(
      `http://localhost:3000/credentials/${credentialId.value}`,
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
      @update-edit-field="updateEditCredentialField"
    />
  </section>
</template>
