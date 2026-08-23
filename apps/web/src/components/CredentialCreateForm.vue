<script setup lang="ts">
import { computed, ref } from "vue";

type CreateCredentialForm = {
  platform: string;
  username: string;
  password: string;
  notes: string;
  customFields: CredentialCustomFieldForm[];
};

type CredentialCustomFieldForm = {
  label: string;
  value: string;
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
  customFields: [],
});
const isPasswordVisible = ref(false);

const canCreateCredential = computed(() => {
  return (
    newCredential.value.platform.trim() !== "" &&
    newCredential.value.username.trim() !== "" &&
    newCredential.value.password !== ""
  );
});

function resetForm(): void {
  newCredential.value = {
    platform: "",
    username: "",
    password: "",
    notes: "",
    customFields: [],
  };
}

function addCustomField(): void {
  newCredential.value.customFields.push({
    label: "",
    value: "",
  });
}

function removeCustomField(index: number): void {
  newCredential.value.customFields.splice(index, 1);
}

function getSubmittedCustomFields(): CredentialCustomFieldForm[] {
  return newCredential.value.customFields
    .map((field) => ({
      label: field.label.trim(),
      value: field.value,
    }))
    .filter((field) => field.label !== "" && field.value !== "");
}

function submitForm(): void {
  if (!canCreateCredential.value) {
    return;
  }

  emit(
    "create",
    {
      ...newCredential.value,
      customFields: getSubmittedCustomFields(),
    },
    resetForm,
  );
}
</script>

<template>
  <section class="credential-panel">
    <div class="section-heading">
      <div>
        <p class="eyebrow">New Credential</p>
        <h2>Add Credential</h2>
      </div>

      <RouterLink class="button-link" to="/credentials">
        Back to Credentials
      </RouterLink>
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
        <div class="password-input-row">
          <input
            v-model="newCredential.password"
            :type="isPasswordVisible ? 'text' : 'password'"
            autocomplete="new-password"
          />

          <button
            type="button"
            @click="isPasswordVisible = !isPasswordVisible"
          >
            {{ isPasswordVisible ? "Hide" : "Show" }}
          </button>
        </div>
      </label>

      <label>
        <span>Notes</span>
        <textarea v-model="newCredential.notes" rows="3" />
      </label>

      <div class="custom-field-section">
        <div class="section-heading">
          <div>
            <span>Custom Fields</span>
          </div>

          <button type="button" @click="addCustomField">
            Add Field
          </button>
        </div>

        <div
          v-for="(field, index) in newCredential.customFields"
          :key="index"
          class="custom-field-row"
        >
          <label>
            <span>Label</span>
            <input v-model="field.label" type="text" autocomplete="off" />
          </label>

          <label>
            <span>Value</span>
            <input v-model="field.value" type="text" autocomplete="off" />
          </label>

          <button type="button" @click="removeCustomField(index)">
            Remove
          </button>
        </div>
      </div>

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
