<script setup lang="ts">
import { computed, ref } from "vue";

type PasswordChangeFormInput = {
  currentPassword: string;
  newPassword: string;
};

withDefaults(defineProps<{
  isChanging: boolean;
  errorMessage: string;
  successMessage?: string;
}>(), {
  successMessage: "",
});

const emit = defineEmits<{
  changePassword: [input: PasswordChangeFormInput, onSuccess: () => void];
}>();

const currentPassword = ref("");
const newPassword = ref("");
const isCurrentPasswordVisible = ref(false);
const isNewPasswordVisible = ref(false);

const canChangePassword = computed(() => {
  return currentPassword.value !== "" && newPassword.value.length >= 8;
});

function resetForm(): void {
  currentPassword.value = "";
  newPassword.value = "";
  isCurrentPasswordVisible.value = false;
  isNewPasswordVisible.value = false;
}

function submitForm(): void {
  if (!canChangePassword.value) {
    return;
  }

  emit(
    "changePassword",
    {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    },
    resetForm,
  );
}
</script>

<template>
  <section class="credential-panel">
    <div>
      <p class="eyebrow">Account Security</p>
      <h2>Change Password</h2>
    </div>

    <form class="credential-form" @submit.prevent="submitForm">
      <label>
        <span>Current Password</span>
        <div class="password-input-row">
          <input
            v-model="currentPassword"
            :type="isCurrentPasswordVisible ? 'text' : 'password'"
            autocomplete="current-password"
          />

          <button
            type="button"
            @click="isCurrentPasswordVisible = !isCurrentPasswordVisible"
          >
            {{ isCurrentPasswordVisible ? "Hide" : "Show" }}
          </button>
        </div>
      </label>

      <label>
        <span>New Password</span>
        <div class="password-input-row">
          <input
            v-model="newPassword"
            :type="isNewPasswordVisible ? 'text' : 'password'"
            autocomplete="new-password"
          />

          <button
            type="button"
            @click="isNewPasswordVisible = !isNewPasswordVisible"
          >
            {{ isNewPasswordVisible ? "Hide" : "Show" }}
          </button>
        </div>
        <small>At least 8 characters.</small>
      </label>

      <p v-if="successMessage" class="success-message">
        {{ successMessage }}
      </p>

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>

      <button type="submit" :disabled="!canChangePassword || isChanging">
        {{ isChanging ? "Changing..." : "Change Password" }}
      </button>
    </form>
  </section>
</template>
