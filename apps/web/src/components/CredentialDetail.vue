<script setup lang="ts">
import { computed, ref } from "vue";
import { Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-vue-next";

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

type EditCredentialField = keyof EditCredentialForm;
type EditCredentialTextField = Exclude<EditCredentialField, "customFields">;

const props = defineProps<{
  credential: Credential | null;
  isLoading: boolean;
  errorMessage: string;
  isEditing: boolean;
  editCredential: EditCredentialForm;
  canUpdate: boolean;
  isUpdating: boolean;
  updateErrorMessage: string;
}>();

const emit = defineEmits<{
  startEdit: [];
  cancelEdit: [];
  update: [];
  close: [];
  addCustomField: [];
  removeCustomField: [index: number];
  updateEditField: [field: EditCredentialTextField, value: string];
  updateEditCustomField: [
    index: number,
    field: keyof EditCredentialCustomFieldForm,
    value: string,
  ];
}>();

const isPasswordVisible = ref(false);
const isEditPasswordVisible = ref(false);
const visibleCustomFieldIds = ref<string[]>([]);
const visibleEditCustomFieldIndexes = ref<number[]>([]);
const copiedTarget = ref<string | null>(null);

const displayedPassword = computed(() => {
  return isPasswordVisible.value ? props.credential?.password ?? "" : "••••••••";
});

function getFormValue(event: Event): string {
  return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
}

async function copyText(value: string, target: string): Promise<void> {
  await navigator.clipboard.writeText(value);
  copiedTarget.value = target;

  window.setTimeout(() => {
    if (copiedTarget.value === target) {
      copiedTarget.value = null;
    }
  }, 1600);
}

function getCopyLabel(target: string, label: string): string {
  return copiedTarget.value === target ? "Copied" : label;
}

function isCustomFieldVisible(id: string): boolean {
  return visibleCustomFieldIds.value.includes(id);
}

function toggleCustomFieldVisibility(id: string): void {
  if (isCustomFieldVisible(id)) {
    visibleCustomFieldIds.value = visibleCustomFieldIds.value.filter(
      (visibleId) => visibleId !== id,
    );
    return;
  }

  visibleCustomFieldIds.value = [...visibleCustomFieldIds.value, id];
}

function getDisplayedCustomFieldValue(field: CredentialCustomField): string {
  return isCustomFieldVisible(field.id) ? field.value : "••••••••";
}

function isEditCustomFieldVisible(index: number): boolean {
  return visibleEditCustomFieldIndexes.value.includes(index);
}

function toggleEditCustomFieldVisibility(index: number): void {
  if (isEditCustomFieldVisible(index)) {
    visibleEditCustomFieldIndexes.value =
      visibleEditCustomFieldIndexes.value.filter(
        (visibleIndex) => visibleIndex !== index,
      );
    return;
  }

  visibleEditCustomFieldIndexes.value = [
    ...visibleEditCustomFieldIndexes.value,
    index,
  ];
}
</script>

<template>
  <div class="credential-detail">
    <p v-if="isLoading">Loading detail...</p>

    <p v-else-if="errorMessage" class="error">
      {{ errorMessage }}
    </p>

    <template v-else-if="credential">
      <form
        v-if="isEditing"
        class="credential-form"
        @submit.prevent="emit('update')"
      >
        <label>
          <span>Platform</span>
          <input
            :value="editCredential.platform"
            type="text"
            autocomplete="off"
            @input="emit('updateEditField', 'platform', getFormValue($event))"
          />
        </label>

        <label>
          <span>Username</span>
          <input
            :value="editCredential.username"
            type="text"
            autocomplete="off"
            @input="emit('updateEditField', 'username', getFormValue($event))"
          />
        </label>

        <label>
          <span>Password</span>
          <div class="password-input-row">
            <input
              :value="editCredential.password"
              :type="isEditPasswordVisible ? 'text' : 'password'"
              autocomplete="new-password"
              @input="emit('updateEditField', 'password', getFormValue($event))"
            />

            <button
              type="button"
              class="icon-button"
              :aria-label="isEditPasswordVisible ? 'Hide password' : 'Show password'"
              :title="isEditPasswordVisible ? 'Hide password' : 'Show password'"
              @click="isEditPasswordVisible = !isEditPasswordVisible"
            >
              <EyeOff v-if="isEditPasswordVisible" :size="18" aria-hidden="true" />
              <Eye v-else :size="18" aria-hidden="true" />
            </button>
          </div>
        </label>

        <label>
          <span>Notes</span>
          <textarea
            :value="editCredential.notes"
            rows="3"
            @input="emit('updateEditField', 'notes', getFormValue($event))"
          />
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
              @click="emit('addCustomField')"
            >
              <Plus :size="18" aria-hidden="true" />
            </button>
          </div>

          <div
            v-for="(field, index) in editCredential.customFields"
            :key="index"
            class="custom-field-row"
          >
            <label>
              <span>Label</span>
              <input
                :value="field.label"
                type="text"
                autocomplete="off"
                @input="
                  emit('updateEditCustomField', index, 'label', getFormValue($event))
                "
              />
            </label>

            <label>
              <span>Value</span>
              <div class="password-input-row custom-field-input-row">
                <input
                  :value="field.value"
                  :type="isEditCustomFieldVisible(index) ? 'text' : 'password'"
                  autocomplete="off"
                  @input="
                    emit('updateEditCustomField', index, 'value', getFormValue($event))
                  "
                />

                <button
                  type="button"
                  class="icon-button"
                  :aria-label="
                    isEditCustomFieldVisible(index)
                      ? `Hide ${field.label || 'custom field'}`
                      : `Show ${field.label || 'custom field'}`
                  "
                  :title="
                    isEditCustomFieldVisible(index)
                      ? `Hide ${field.label || 'custom field'}`
                      : `Show ${field.label || 'custom field'}`
                  "
                  @click="toggleEditCustomFieldVisibility(index)"
                >
                  <EyeOff
                    v-if="isEditCustomFieldVisible(index)"
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
                  @click="emit('removeCustomField', index)"
                >
                  <Trash2 :size="18" aria-hidden="true" />
                </button>
              </div>
            </label>
          </div>
        </div>

        <p v-if="updateErrorMessage" class="error">
          {{ updateErrorMessage }}
        </p>

        <div class="credential-actions detail-form-actions">
          <button
            type="submit"
            class="form-action-button"
            :disabled="!canUpdate || isUpdating"
          >
            {{ isUpdating ? "Saving..." : "Save" }}
          </button>

          <button
            type="button"
            class="form-action-button"
            @click="emit('cancelEdit')"
          >
            Cancel
          </button>
        </div>
      </form>

      <template v-else>
        <dl>
          <div>
            <dt>Username</dt>
            <dd>
              <div class="secret-row">
                <span class="secret-value">{{ credential.username }}</span>

                <button
                  type="button"
                  class="icon-button"
                  :class="{ 'is-copied': copiedTarget === 'username' }"
                  :aria-label="getCopyLabel('username', 'Copy username')"
                  :data-tooltip="getCopyLabel('username', 'Copy username')"
                  @click="copyText(credential.username, 'username')"
                >
                  <Copy :size="18" aria-hidden="true" />
                </button>
              </div>
            </dd>
          </div>

          <div>
            <dt>Password</dt>
            <dd>
              <div class="secret-row">
                <span class="secret-value">{{ displayedPassword }}</span>

                <div class="credential-actions">
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

                  <button
                    type="button"
                    class="icon-button"
                    :class="{ 'is-copied': copiedTarget === 'password' }"
                    :aria-label="getCopyLabel('password', 'Copy password')"
                    :data-tooltip="getCopyLabel('password', 'Copy password')"
                    @click="copyText(credential.password, 'password')"
                  >
                    <Copy :size="18" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </dd>
          </div>
        </dl>

        <dl v-if="credential.customFields.length > 0">
          <div
            v-for="field in credential.customFields"
            :key="field.id"
          >
            <dt>{{ field.label }}</dt>
            <dd>
              <div class="secret-row">
                <span class="secret-value">
                  {{ getDisplayedCustomFieldValue(field) }}
                </span>

                <div class="credential-actions">
                  <button
                    type="button"
                    class="icon-button"
                    :aria-label="
                      isCustomFieldVisible(field.id)
                        ? `Hide ${field.label}`
                        : `Show ${field.label}`
                    "
                    :title="
                      isCustomFieldVisible(field.id)
                        ? `Hide ${field.label}`
                        : `Show ${field.label}`
                    "
                    @click="toggleCustomFieldVisibility(field.id)"
                  >
                    <EyeOff
                      v-if="isCustomFieldVisible(field.id)"
                      :size="18"
                      aria-hidden="true"
                    />
                    <Eye v-else :size="18" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    class="icon-button"
                    :class="{ 'is-copied': copiedTarget === field.id }"
                    :aria-label="getCopyLabel(field.id, `Copy ${field.label}`)"
                    :data-tooltip="getCopyLabel(field.id, `Copy ${field.label}`)"
                    @click="copyText(field.value, field.id)"
                  >
                    <Copy :size="18" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </dd>
          </div>
        </dl>

        <div class="credential-actions detail-footer-actions">
          <button type="button" class="form-action-button" @click="emit('startEdit')">
            Edit
          </button>

          <button type="button" class="form-action-button" @click="emit('close')">
            Close
          </button>
        </div>
      </template>
    </template>
  </div>
</template>
