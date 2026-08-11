<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

type HealthResponse = {
  status: string;
  service: string;
};

type Credential = {
  id: string;
  platform: string;
  username: string;
  password: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type CredentialListResponse = {
  data: Credential[];
};

type CredentialResponse = {
  data: Credential;
};

type CreateCredentialForm = {
  platform: string;
  username: string;
  password: string;
  notes: string;
};

type EditCredentialForm = {
  platform: string;
  username: string;
  password: string;
  notes: string;
};

const apiStatus = ref<HealthResponse | null>(null);
const isLoading = ref(true);
const errorMessage = ref("");
const credentials = ref<Credential[]>([]);
const isCredentialLoading = ref(true);
const credentialErrorMessage = ref("");
const deletingCredentialId = ref<string | null>(null);
const deleteCredentialErrorMessage = ref("");
const selectedCredentialId = ref<string | null>(null);
const selectedCredential = ref<Credential | null>(null);
const isLoadingSelectedCredential = ref(false);
const selectedCredentialErrorMessage = ref("");
const isEditingCredential = ref(false);
const editCredential = ref<EditCredentialForm>({
  platform: "",
  username: "",
  password: "",
  notes: "",
});
const isUpdatingCredential = ref(false);
const updateCredentialErrorMessage = ref("");
const newCredential = ref<CreateCredentialForm>({
  platform: "",
  username: "",
  password: "",
  notes: "",
});
const isCreatingCredential = ref(false);
const createCredentialErrorMessage = ref("");

const canCreateCredential = computed(() => {
  return (
    newCredential.value.platform.trim() !== "" &&
    newCredential.value.username.trim() !== "" &&
    newCredential.value.password.length >= 8
  );
});

const canUpdateCredential = computed(() => {
  return (
    editCredential.value.platform.trim() !== "" &&
    editCredential.value.username.trim() !== "" &&
    editCredential.value.password.length >= 8
  );
});

async function loadHealthStatus(): Promise<void> {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetch("http://localhost:3000/health");

    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }

    apiStatus.value = (await response.json()) as HealthResponse;
  } catch (error: unknown) {
    if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = "An unknown error occurred.";
    }
  } finally {
    isLoading.value = false;
  }
}

async function loadCredentials(): Promise<void> {
  isCredentialLoading.value = true;
  credentialErrorMessage.value = "";

  try {
    const response = await fetch("http://localhost:3000/credentials");

    if (!response.ok) {
      throw new Error(`Credential request failed with status ${response.status}`);
    }

    const body = (await response.json()) as CredentialListResponse;

    credentials.value = body.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      credentialErrorMessage.value = error.message;
    } else {
      credentialErrorMessage.value = "An unknown error occurred.";
    }
  } finally {
    isCredentialLoading.value = false;
  }
}

async function createCredential(): Promise<void> {
  isCreatingCredential.value = true;
  createCredentialErrorMessage.value = "";

  try {
    const response = await fetch("http://localhost:3000/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platform: newCredential.value.platform,
        username: newCredential.value.username,
        password: newCredential.value.password,
        notes: newCredential.value.notes || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`Create credential failed with status ${response.status}`);
    }

    newCredential.value = {
      platform: "",
      username: "",
      password: "",
      notes: "",
    };

    await loadCredentials();
  } catch (error: unknown) {
    if (error instanceof Error) {
      createCredentialErrorMessage.value = error.message;
    } else {
      createCredentialErrorMessage.value = "An unknown error occurred.";
    }
  } finally {
    isCreatingCredential.value = false;
  }
}

async function deleteCredential(id: string): Promise<void> {
  deletingCredentialId.value = id;
  deleteCredentialErrorMessage.value = "";

  try {
    const response = await fetch(`http://localhost:3000/credentials/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Delete credential failed with status ${response.status}`);
    }

    await loadCredentials();
  } catch (error: unknown) {
    if (error instanceof Error) {
      deleteCredentialErrorMessage.value = error.message;
    } else {
      deleteCredentialErrorMessage.value = "An unknown error occurred.";
    }
  } finally {
    deletingCredentialId.value = null;
  }
}

async function loadCredentialDetail(id: string): Promise<void> {
  selectedCredentialId.value = id;
  selectedCredential.value = null;
  selectedCredentialErrorMessage.value = "";
  isEditingCredential.value = false;
  updateCredentialErrorMessage.value = "";
  isLoadingSelectedCredential.value = true;

  try {
    const response = await fetch(`http://localhost:3000/credentials/${id}`);

    if (!response.ok) {
      throw new Error(
        `Credential detail request failed with status ${response.status}`,
      );
    }

    const body = (await response.json()) as CredentialResponse;

    selectedCredential.value = body.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      selectedCredentialErrorMessage.value = error.message;
    } else {
      selectedCredentialErrorMessage.value = "An unknown error occurred.";
    }
  } finally {
    isLoadingSelectedCredential.value = false;
  }
}

function closeCredentialDetail(): void {
  selectedCredentialId.value = null;
  selectedCredential.value = null;
  selectedCredentialErrorMessage.value = "";
  isEditingCredential.value = false;
  updateCredentialErrorMessage.value = "";
}

function startEditingCredential(): void {
  if (selectedCredential.value === null) {
    return;
  }

  editCredential.value = {
    platform: selectedCredential.value.platform,
    username: selectedCredential.value.username,
    password: selectedCredential.value.password,
    notes: selectedCredential.value.notes ?? "",
  };

  updateCredentialErrorMessage.value = "";
  isEditingCredential.value = true;
}

function cancelEditingCredential(): void {
  isEditingCredential.value = false;
  updateCredentialErrorMessage.value = "";
}

async function updateCredential(): Promise<void> {
  const credentialId = selectedCredentialId.value;

  if (credentialId === null) {
    return;
  }

  isUpdatingCredential.value = true;
  updateCredentialErrorMessage.value = "";

  try {
    const response = await fetch(
      `http://localhost:3000/credentials/${credentialId}`,
      {
        method: "PATCH",
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
      throw new Error(`Update credential failed with status ${response.status}`);
    }

    await loadCredentials();
    await loadCredentialDetail(credentialId);
    isEditingCredential.value = false;
  } catch (error: unknown) {
    if (error instanceof Error) {
      updateCredentialErrorMessage.value = error.message;
    } else {
      updateCredentialErrorMessage.value = "An unknown error occurred.";
    }
  } finally {
    isUpdatingCredential.value = false;
  }
}

onMounted(() => {
  void loadHealthStatus();
  void loadCredentials();
});
</script>

<template>
  <main>
    <header>
      <p class="eyebrow">Credential Vault</p>
      <h1>Minimal App Skeleton</h1>
      <p>
        Vue frontend connected to a Bun backend health check.
      </p>
    </header>

    <section class="status-panel" aria-live="polite">
      <h2>API Health</h2>

      <p v-if="isLoading">Checking API status...</p>

      <p v-else-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>

      <dl v-else-if="apiStatus">
        <div>
          <dt>Status</dt>
          <dd>{{ apiStatus.status }}</dd>
        </div>
        <div>
          <dt>Service</dt>
          <dd>{{ apiStatus.service }}</dd>
        </div>
      </dl>

      <button type="button" @click="loadHealthStatus">
        Refresh
      </button>
    </section>

    <section class="credential-panel">
      <div>
        <p class="eyebrow">New Credential</p>
        <h2>Add Credential</h2>
      </div>

      <form class="credential-form" @submit.prevent="createCredential">
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

        <p v-if="createCredentialErrorMessage" class="error">
          {{ createCredentialErrorMessage }}
        </p>

        <button
          type="submit"
          :disabled="!canCreateCredential || isCreatingCredential"
        >
          {{ isCreatingCredential ? "Adding..." : "Add Credential" }}
        </button>
      </form>
    </section>

    <section class="credential-panel" aria-live="polite">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Credentials</p>
          <h2>Stored Credentials</h2>
        </div>

        <button type="button" @click="loadCredentials">
          Refresh
        </button>
      </div>

      <p v-if="isCredentialLoading">Loading credentials...</p>

      <p v-else-if="credentialErrorMessage" class="error">
        {{ credentialErrorMessage }}
      </p>

      <p v-else-if="credentials.length === 0" class="empty-message">
        No credentials yet.
      </p>

      <template v-else>
        <p v-if="deleteCredentialErrorMessage" class="error">
          {{ deleteCredentialErrorMessage }}
        </p>

        <ul class="credential-list">
          <li v-for="credential in credentials" :key="credential.id">
            <div class="credential-item-heading">
              <div class="credential-summary">
                <strong>{{ credential.platform }}</strong>

                <p v-if="credential.notes">
                  {{ credential.notes }}
                </p>
              </div>

              <div class="credential-actions">
                <button
                  v-if="selectedCredentialId !== credential.id"
                  type="button"
                  @click="loadCredentialDetail(credential.id)"
                >
                  View
                </button>

                <button
                  type="button"
                  class="danger-button"
                  :disabled="deletingCredentialId === credential.id"
                  @click="deleteCredential(credential.id)"
                >
                  {{ deletingCredentialId === credential.id ? "Deleting..." : "Delete" }}
                </button>
              </div>
            </div>

            <div
              v-if="selectedCredentialId === credential.id"
              class="credential-detail"
            >
              <p v-if="isLoadingSelectedCredential">Loading detail...</p>

              <p v-else-if="selectedCredentialErrorMessage" class="error">
                {{ selectedCredentialErrorMessage }}
              </p>

              <template v-else-if="selectedCredential">
                <form
                  v-if="isEditingCredential"
                  class="credential-form"
                  @submit.prevent="updateCredential"
                >
                  <label>
                    <span>Platform</span>
                    <input
                      v-model="editCredential.platform"
                      type="text"
                      autocomplete="off"
                    />
                  </label>

                  <label>
                    <span>Username</span>
                    <input
                      v-model="editCredential.username"
                      type="text"
                      autocomplete="off"
                    />
                  </label>

                  <label>
                    <span>Password</span>
                    <input
                      v-model="editCredential.password"
                      type="password"
                      autocomplete="new-password"
                    />
                  </label>

                  <label>
                    <span>Notes</span>
                    <textarea v-model="editCredential.notes" rows="3" />
                  </label>

                  <p v-if="updateCredentialErrorMessage" class="error">
                    {{ updateCredentialErrorMessage }}
                  </p>

                  <div class="credential-actions">
                    <button
                      type="submit"
                      :disabled="!canUpdateCredential || isUpdatingCredential"
                    >
                      {{ isUpdatingCredential ? "Saving..." : "Save" }}
                    </button>

                    <button type="button" @click="cancelEditingCredential">
                      Cancel
                    </button>
                  </div>
                </form>

                <template v-else>
                  <dl>
                    <div>
                      <dt>Username</dt>
                      <dd>{{ selectedCredential.username }}</dd>
                    </div>

                    <div>
                      <dt>Password</dt>
                      <dd>{{ selectedCredential.password }}</dd>
                    </div>
                  </dl>

                  <div class="credential-actions">
                    <button type="button" @click="startEditingCredential">
                      Edit
                    </button>

                    <button type="button" @click="closeCredentialDetail">
                      Close
                    </button>
                  </div>
                </template>
              </template>
            </div>
          </li>
        </ul>
      </template>
    </section>
  </main>
</template>
