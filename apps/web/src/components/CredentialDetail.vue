<script setup lang="ts">
import { computed, ref } from "vue";

type Credential = {
  id: string;
  platform: string;
  username: string;
  password: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type EditCredentialForm = {
  platform: string;
  username: string;
  password: string;
  notes: string;
};

type EditCredentialField = keyof EditCredentialForm;

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
  updateEditField: [field: EditCredentialField, value: string];
}>();

const isPasswordVisible = ref(false);
const copyMessage = ref("");

const displayedPassword = computed(() => {
  return isPasswordVisible.value ? props.credential?.password ?? "" : "••••••••";
});

function getFormValue(event: Event): string {
  return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
}

async function copyText(value: string, message: string): Promise<void> {
  await navigator.clipboard.writeText(value);
  copyMessage.value = message;

  window.setTimeout(() => {
    copyMessage.value = "";
  }, 1600);
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
          <input
            :value="editCredential.password"
            type="password"
            autocomplete="new-password"
            @input="emit('updateEditField', 'password', getFormValue($event))"
          />
        </label>

        <label>
          <span>Notes</span>
          <textarea
            :value="editCredential.notes"
            rows="3"
            @input="emit('updateEditField', 'notes', getFormValue($event))"
          />
        </label>

        <p v-if="updateErrorMessage" class="error">
          {{ updateErrorMessage }}
        </p>

        <div class="credential-actions">
          <button
            type="submit"
            :disabled="!canUpdate || isUpdating"
          >
            {{ isUpdating ? "Saving..." : "Save" }}
          </button>

          <button type="button" @click="emit('cancelEdit')">
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
                  @click="copyText(credential.username, 'Username copied.')"
                >
                  Copy Username
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
                    @click="isPasswordVisible = !isPasswordVisible"
                  >
                    {{ isPasswordVisible ? "Hide" : "Show" }}
                  </button>

                  <button
                    type="button"
                    @click="copyText(credential.password, 'Password copied.')"
                  >
                    Copy Password
                  </button>
                </div>
              </div>
            </dd>
          </div>
        </dl>

        <p v-if="copyMessage" class="success-message">
          {{ copyMessage }}
        </p>

        <div class="credential-actions">
          <button type="button" @click="emit('startEdit')">
            Edit
          </button>

          <button type="button" @click="emit('close')">
            Close
          </button>
        </div>
      </template>
    </template>
  </div>
</template>
