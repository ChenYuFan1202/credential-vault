<script setup lang="ts">
import { ref } from "vue";
import { getApiErrorMessage, getUnknownErrorMessage } from "../api/errors";
import PasswordChangeForm from "../components/PasswordChangeForm.vue";

type CurrentUser = {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

type PasswordChangeFormInput = {
  currentPassword: string;
  newPassword: string;
};

defineProps<{
  currentUser: CurrentUser;
}>();

const emit = defineEmits<{
  passwordChanged: [];
}>();

const isChangingPassword = ref(false);
const changePasswordErrorMessage = ref("");

async function changePassword(
  input: PasswordChangeFormInput,
  onSuccess: () => void,
): Promise<void> {
  isChangingPassword.value = true;
  changePasswordErrorMessage.value = "";

  try {
    const response = await fetch("http://localhost:3000/auth/password", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Could not change password.", {
          400: "Current password is incorrect, or new password is invalid.",
          401: "Please log in again.",
        }),
      );
    }

    onSuccess();
    emit("passwordChanged");
  } catch (error: unknown) {
    changePasswordErrorMessage.value = getUnknownErrorMessage(error);
  } finally {
    isChangingPassword.value = false;
  }
}
</script>

<template>
  <section class="credential-panel">
    <div>
      <p class="eyebrow">Signed In</p>
      <h2>{{ currentUser.username }}</h2>
    </div>
  </section>

  <PasswordChangeForm
    :is-changing="isChangingPassword"
    :error-message="changePasswordErrorMessage"
    @change-password="changePassword"
  />
</template>
