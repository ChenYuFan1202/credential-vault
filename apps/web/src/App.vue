<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AuthForm from "./components/AuthForm.vue";
import CredentialCreateForm from "./components/CredentialCreateForm.vue";
import CredentialList from "./components/CredentialList.vue";

type HealthResponse = {
  status: string;
  service: string;
};

type CurrentUser = {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

type AuthResponse = {
  data: CurrentUser;
};

type AuthFormInput = {
  username: string;
  password: string;
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
const currentUser = ref<CurrentUser | null>(null);
const isAuthLoading = ref(true);
const authErrorMessage = ref("");
const isSubmittingAuth = ref(false);
const isLoggingOut = ref(false);
const logoutErrorMessage = ref("");
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
const isCreatingCredential = ref(false);
const createCredentialErrorMessage = ref("");

const canUpdateCredential = computed(() => {
  return (
    editCredential.value.platform.trim() !== "" &&
    editCredential.value.username.trim() !== "" &&
    editCredential.value.password.length >= 8
  );
});

function getApiErrorMessage(
  response: Response,
  fallbackMessage: string,
  statusMessages: Record<number, string> = {},
): string {
  return statusMessages[response.status] ?? fallbackMessage;
}

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

async function loadCurrentUser(): Promise<void> {
  isAuthLoading.value = true;
  authErrorMessage.value = "";

  try {
    const response = await fetch("http://localhost:3000/auth/me", {
      credentials: "include",
    });

    if (response.status === 401) {
      currentUser.value = null;
      credentials.value = [];
      return;
    }

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Could not check current user."),
      );
    }

    const body = (await response.json()) as AuthResponse;

    currentUser.value = body.data;
    await loadCredentials();
  } catch (error: unknown) {
    currentUser.value = null;

    if (error instanceof Error) {
      authErrorMessage.value = error.message;
    } else {
      authErrorMessage.value = "An unknown error occurred.";
    }
  } finally {
    isAuthLoading.value = false;
  }
}

async function loadCredentials(): Promise<void> {
  isCredentialLoading.value = true;
  credentialErrorMessage.value = "";

  try {
    const response = await fetch("http://localhost:3000/credentials", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Could not load credentials."),
      );
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

async function login(input: AuthFormInput): Promise<void> {
  isSubmittingAuth.value = true;
  authErrorMessage.value = "";

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Login failed.", {
          401: "Invalid username or password.",
        }),
      );
    }

    const body = (await response.json()) as AuthResponse;

    currentUser.value = body.data;
    await loadCredentials();
  } catch (error: unknown) {
    if (error instanceof Error) {
      authErrorMessage.value = error.message;
    } else {
      authErrorMessage.value = "An unknown error occurred.";
    }
  } finally {
    isSubmittingAuth.value = false;
  }
}

async function register(input: AuthFormInput): Promise<void> {
  isSubmittingAuth.value = true;
  authErrorMessage.value = "";

  try {
    const response = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Registration failed.", {
          400: "Username must be at least 3 characters and password must be at least 8 characters.",
          409: "Username is already taken.",
        }),
      );
    }

    await login(input);
  } catch (error: unknown) {
    if (error instanceof Error) {
      authErrorMessage.value = error.message;
    } else {
      authErrorMessage.value = "An unknown error occurred.";
    }
  } finally {
    isSubmittingAuth.value = false;
  }
}

async function logout(): Promise<void> {
  isLoggingOut.value = true;
  logoutErrorMessage.value = "";

  try {
    const response = await fetch("http://localhost:3000/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(getApiErrorMessage(response, "Could not log out."));
    }

    currentUser.value = null;
    credentials.value = [];
    closeCredentialDetail();
  } catch (error: unknown) {
    if (error instanceof Error) {
      logoutErrorMessage.value = error.message;
    } else {
      logoutErrorMessage.value = "An unknown error occurred.";
    }
  } finally {
    isLoggingOut.value = false;
  }
}

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
          400: "Platform and username are required. Password must be at least 8 characters.",
        }),
      );
    }

    onSuccess();
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
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Could not delete credential.", {
          404: "Credential could not be found.",
        }),
      );
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
    const response = await fetch(`http://localhost:3000/credentials/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Could not load credential detail.", {
          404: "Credential could not be found.",
        }),
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

function updateEditCredentialField(
  field: keyof EditCredentialForm,
  value: string,
): void {
  editCredential.value = {
    ...editCredential.value,
    [field]: value,
  };
}

function clearAuthError(): void {
  authErrorMessage.value = "";
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
          400: "Platform and username are required. Password must be at least 8 characters.",
          404: "Credential could not be found.",
        }),
      );
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
  void loadCurrentUser();
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

    <p v-if="isAuthLoading">Checking account...</p>

    <AuthForm
      v-else-if="currentUser === null"
      :is-submitting="isSubmittingAuth"
      :error-message="authErrorMessage"
      @login="login"
      @register="register"
      @clear-error="clearAuthError"
    />

    <template v-else>
      <section class="credential-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Signed In</p>
            <h2>{{ currentUser.username }}</h2>
          </div>

          <button type="button" :disabled="isLoggingOut" @click="logout">
            {{ isLoggingOut ? "Logging out..." : "Logout" }}
          </button>
        </div>

        <p v-if="logoutErrorMessage" class="error">
          {{ logoutErrorMessage }}
        </p>
      </section>

      <CredentialCreateForm
        :is-creating="isCreatingCredential"
        :error-message="createCredentialErrorMessage"
        @create="createCredential"
      />

      <CredentialList
        :credentials="credentials"
        :is-loading="isCredentialLoading"
        :error-message="credentialErrorMessage"
        :deleting-credential-id="deletingCredentialId"
        :delete-error-message="deleteCredentialErrorMessage"
        :selected-credential-id="selectedCredentialId"
        :selected-credential="selectedCredential"
        :is-loading-selected-credential="isLoadingSelectedCredential"
        :selected-credential-error-message="selectedCredentialErrorMessage"
        :is-editing-credential="isEditingCredential"
        :edit-credential="editCredential"
        :can-update-credential="canUpdateCredential"
        :is-updating-credential="isUpdatingCredential"
        :update-credential-error-message="updateCredentialErrorMessage"
        @refresh="loadCredentials"
        @view="loadCredentialDetail"
        @delete="deleteCredential"
        @start-edit="startEditingCredential"
        @cancel-edit="cancelEditingCredential"
        @update="updateCredential"
        @close-detail="closeCredentialDetail"
        @update-edit-field="updateEditCredentialField"
      />
    </template>
  </main>
</template>
