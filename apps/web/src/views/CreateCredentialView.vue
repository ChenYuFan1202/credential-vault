<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getApiErrorMessage, getUnknownErrorMessage } from "../api/errors";
import CredentialCreateForm from "../components/CredentialCreateForm.vue";

type CreateCredentialForm = {
  platform: string;
  username: string;
  password: string;
  notes: string;
};

const router = useRouter();

const isCreatingCredential = ref(false);
const createCredentialErrorMessage = ref("");

async function createCredential(
  input: CreateCredentialForm,
  onSuccess: () => void,
): Promise<void> {
  isCreatingCredential.value = true;
  createCredentialErrorMessage.value = "";

  try {
    const response = await fetch("http://localhost:3000/credentials", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platform: input.platform,
        username: input.username,
        password: input.password,
        notes: input.notes || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Could not create credential.", {
          400: "Platform, username, and password are required.",
        }),
      );
    }

    onSuccess();
    await router.push("/credentials");
  } catch (error: unknown) {
    createCredentialErrorMessage.value = getUnknownErrorMessage(error);
  } finally {
    isCreatingCredential.value = false;
  }
}
</script>

<template>
  <CredentialCreateForm
    :is-creating="isCreatingCredential"
    :error-message="createCredentialErrorMessage"
    @create="createCredential"
  />
</template>
