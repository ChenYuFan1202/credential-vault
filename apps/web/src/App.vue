<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import { getApiErrorMessage, getUnknownErrorMessage } from "./api/errors";

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

const router = useRouter();
const route = useRoute();

const currentUser = ref<CurrentUser | null>(null);
const isAuthLoading = ref(true);
const authErrorMessage = ref("");
const authNoticeMessage = ref("");
const isSubmittingAuth = ref(false);
const isLoggingOut = ref(false);
const logoutErrorMessage = ref("");

const authMode = computed(() => {
  return route.path === "/register" ? "register" : "login";
});

const isAuthRoute = computed(() => {
  return route.path === "/login" || route.path === "/register";
});

const isAccountRoute = computed(() => {
  return route.path === "/account";
});

const shouldRenderRoute = computed(() => {
  if (isAuthLoading.value) {
    return false;
  }

  if (currentUser.value === null) {
    return isAuthRoute.value;
  }

  return !isAuthRoute.value;
});

function syncRouteWithAuthState(): void {
  if (isAuthLoading.value) {
    return;
  }

  if (currentUser.value === null && !isAuthRoute.value) {
    void router.replace("/login");
    return;
  }

  if (currentUser.value !== null && isAuthRoute.value) {
    void router.replace("/credentials");
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
      return;
    }

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, "Could not check current user."),
      );
    }

    const body = (await response.json()) as AuthResponse;

    currentUser.value = body.data;
  } catch (error: unknown) {
    currentUser.value = null;
    authErrorMessage.value = getUnknownErrorMessage(error);
  } finally {
    isAuthLoading.value = false;
  }
}

async function login(input: AuthFormInput): Promise<void> {
  isSubmittingAuth.value = true;
  authErrorMessage.value = "";
  authNoticeMessage.value = "";

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
    await router.replace("/credentials");
  } catch (error: unknown) {
    authErrorMessage.value = getUnknownErrorMessage(error);
  } finally {
    isSubmittingAuth.value = false;
  }
}

async function register(input: AuthFormInput): Promise<void> {
  isSubmittingAuth.value = true;
  authErrorMessage.value = "";
  authNoticeMessage.value = "";

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
    authErrorMessage.value = getUnknownErrorMessage(error);
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
    await router.replace("/login");
  } catch (error: unknown) {
    logoutErrorMessage.value = getUnknownErrorMessage(error);
  } finally {
    isLoggingOut.value = false;
  }
}

function clearAuthError(): void {
  authErrorMessage.value = "";
  authNoticeMessage.value = "";
}

async function switchAuthMode(): Promise<void> {
  clearAuthError();
  await router.push(authMode.value === "login" ? "/register" : "/login");
}

async function handlePasswordChanged(): Promise<void> {
  currentUser.value = null;
  authNoticeMessage.value = "Password changed. Please log in again.";
  await router.replace("/login");
}

onMounted(() => {
  void loadCurrentUser();
});

watch(
  [currentUser, isAuthLoading, () => route.path],
  () => {
    syncRouteWithAuthState();
  },
  { immediate: true },
);
</script>

<template>
  <main>
    <header class="app-header">
      <h1>Credential Vault</h1>

      <nav v-if="currentUser" class="app-nav" aria-label="Primary navigation">
        <RouterLink
          to="/credentials"
          :class="{ 'router-link-active': route.path.startsWith('/credentials') }"
        >
          Credentials
        </RouterLink>
        <RouterLink
          to="/account"
          :class="{ 'router-link-active': route.path === '/account' }"
        >
          Account
        </RouterLink>
        <button type="button" :disabled="isLoggingOut" @click="logout">
          {{ isLoggingOut ? "Logging out..." : "Logout" }}
        </button>
      </nav>
    </header>

    <p v-if="isAuthLoading || !shouldRenderRoute">Checking account...</p>

    <template v-else>
      <p v-if="logoutErrorMessage" class="error">
        {{ logoutErrorMessage }}
      </p>

      <RouterView v-slot="{ Component }">
        <component
          v-if="isAuthRoute"
          :is="Component"
          :mode="authMode"
          :is-submitting="isSubmittingAuth"
          :error-message="authErrorMessage"
          :notice-message="authNoticeMessage"
          @login="login"
          @register="register"
          @clear-error="clearAuthError"
          @switch-mode="switchAuthMode"
        />

        <component
          v-else-if="isAccountRoute"
          :is="Component"
          :current-user="currentUser"
          @password-changed="handlePasswordChanged"
        />

        <component v-else :is="Component" />
      </RouterView>
    </template>
  </main>
</template>
