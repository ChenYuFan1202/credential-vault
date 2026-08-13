<script setup lang="ts">
import { computed, ref } from "vue";

type CreateCredentialForm = {
  platform: string;
  username: string;
  password: string;
  notes: string;
};

defineProps<{
  isCreating: boolean;
  errorMessage: string;
}>();

const emit = defineEmits<{
  create: [input: CreateCredentialForm, onSuccess: () => void];
}>();

const newCredential = ref<CreateCredentialForm>({
  platform: "",
  username: "",
  password: "",
  notes: "",
});

const canCreateCredential = computed(() => {
  return (
    newCredential.value.platform.trim() !== "" &&
    newCredential.value.username.trim() !== "" &&
    newCredential.value.password.length >= 8
  );
});

function resetForm(): void {
  newCredential.value = {
    platform: "",
    username: "",
    password: "",
    notes: "",
  };
}

function submitForm(): void {
  if (!canCreateCredential.value) {
    return;
  }

  emit("create", { ...newCredential.value }, resetForm);
}
</script>

<template>
  <section class="credential-panel">
    <div>
      <p class="eyebrow">New Credential</p>
      <h2>Add Credential</h2>
    </div>

    <form class="credential-form" @submit.prevent="submitForm">
      <label>
        <span>Platform</span>
        <input v-model="newCredential.platform" type="text" autocomplete="off" />
      </label>

      <label>
        <span>Username</span>
        <input v-model="newCredential.username" type="text" autocomplete="off" />
      </label>

      <label>
        <span>Password</span>
        <input
          v-model="newCredential.password"
          type="password"
          autocomplete="new-password"
        />
      </label>

      <label>
        <span>Notes</span>
        <textarea v-model="newCredential.notes" rows="3" />
      </label>

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>

      <button
        type="submit"
        :disabled="!canCreateCredential || isCreating"
      >
        {{ isCreating ? "Adding..." : "Add Credential" }}
      </button>
    </form>
  </section>
</template>
