<script setup lang="ts">
import { computed, ref } from "vue";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-vue-next";

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
const visibleCustomFieldIndexes = ref<number[]>([]);

function isCompleteCustomField(field: CredentialCustomFieldForm): boolean {
  return field.label.trim() !== "" && field.value !== "";
}

const canCreateCredential = computed(() => {
  return (
    newCredential.value.platform.trim() !== "" &&
    newCredential.value.username.trim() !== "" &&
    newCredential.value.password !== "" &&
    newCredential.value.customFields.every(isCompleteCustomField)
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
  visibleCustomFieldIndexes.value = [];
}

function addCustomField(): void {
  newCredential.value.customFields.push({
    label: "",
    value: "",
  });
}

function removeCustomField(index: number): void {
  newCredential.value.customFields.splice(index, 1);
  visibleCustomFieldIndexes.value = visibleCustomFieldIndexes.value
    .filter((visibleIndex) => visibleIndex !== index)
    .map((visibleIndex) =>
      visibleIndex > index ? visibleIndex - 1 : visibleIndex,
    );
}

function isCustomFieldVisible(index: number): boolean {
  return visibleCustomFieldIndexes.value.includes(index);
}

function toggleCustomFieldVisibility(index: number): void {
  if (isCustomFieldVisible(index)) {
    visibleCustomFieldIndexes.value = visibleCustomFieldIndexes.value.filter(
      (visibleIndex) => visibleIndex !== index,
    );
    return;
  }

  visibleCustomFieldIndexes.value = [
    ...visibleCustomFieldIndexes.value,
    index,
  ];
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
            class="icon-button"
            :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
            :title="isPasswordVisible ? 'Hide password' : 'Show password'"
            @click="isPasswordVisible = !isPasswordVisible"
          >
            <EyeOff v-if="isPasswordVisible" :size="18" aria-hidden="true" />
            <Eye v-else :size="18" aria-hidden="true" />
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

          <button
            type="button"
            class="icon-button"
            aria-label="Add custom field"
            title="Add custom field"
            @click="addCustomField"
          >
            <Plus :size="18" aria-hidden="true" />
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
            <div class="password-input-row custom-field-input-row">
              <input
                v-model="field.value"
                :type="isCustomFieldVisible(index) ? 'text' : 'password'"
                autocomplete="off"
              />

              <button
                type="button"
                class="icon-button"
                :aria-label="
                  isCustomFieldVisible(index)
                    ? `Hide ${field.label || 'custom field'}`
                    : `Show ${field.label || 'custom field'}`
                "
                :title="
                  isCustomFieldVisible(index)
                    ? `Hide ${field.label || 'custom field'}`
                    : `Show ${field.label || 'custom field'}`
                "
                @click="toggleCustomFieldVisibility(index)"
              >
                <EyeOff
                  v-if="isCustomFieldVisible(index)"
                  :size="18"
                  aria-hidden="true"
                />
                <Eye v-else :size="18" aria-hidden="true" />
              </button>

              <button
                type="button"
                class="icon-button danger-button"
                :aria-label="`Remove ${field.label || 'custom field'}`"
                :title="`Remove ${field.label || 'custom field'}`"
                @click="removeCustomField(index)"
              >
                <Trash2 :size="18" aria-hidden="true" />
              </button>
            </div>
          </label>
        </div>
      </div>

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>

      <button
        type="submit"
        class="form-action-button auth-submit-button"
        :disabled="!canCreateCredential || isCreating"
      >
        {{ isCreating ? "Adding..." : "Add Credential" }}
      </button>
    </form>
  </section>
</template>
