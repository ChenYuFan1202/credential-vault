<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Eye, EyeOff } from "lucide-vue-next";

type AuthMode = "login" | "register";

type AuthFormInput = {
  username: string;
  password: string;
};

const props = defineProps<{
  mode: AuthMode;
  isSubmitting: boolean;
  errorMessage: string;
  noticeMessage: string;
}>();

const emit = defineEmits<{
  login: [input: AuthFormInput];
  register: [input: AuthFormInput];
  clearError: [];
  switchMode: [];
}>();

const username = ref("");
const password = ref("");
const isPasswordVisible = ref(false);

const canSubmit = computed(() => {
  if (props.mode === "register") {
    return username.value.trim().length >= 3 && password.value.length >= 8;
  }

  return username.value.trim() !== "" && password.value !== "";
});

function submitForm(): void {
  if (!canSubmit.value) {
    return;
  }

  const input = {
    username: username.value,
    password: password.value,
  };

  if (props.mode === "login") {
    emit("login", input);
  } else {
    emit("register", input);
  }
}

function switchMode(): void {
  username.value = "";
  password.value = "";
  isPasswordVisible.value = false;
  emit("clearError");
  emit("switchMode");
}

watch(
  () => props.mode,
  () => {
    username.value = "";
    password.value = "";
    isPasswordVisible.value = false;
    emit("clearError");
  },
);
</script>

<template>
  <section class="credential-panel auth-panel">
    <div class="section-heading">
      <div>
        <h2>{{ mode === "login" ? "Login" : "Register" }}</h2>
      </div>

      <button
        type="button"
        @click="switchMode"
      >
        {{ mode === "login" ? "Create Account" : "Use Login" }}
      </button>
    </div>

    <form class="credential-form" @submit.prevent="submitForm">
      <label>
        <span>Username</span>
        <input v-model="username" type="text" autocomplete="username" />
        <small v-if="mode === 'register'">
          At least 3 characters.
        </small>
        <small v-else class="invisible-helper-text">
          Username
        </small>
      </label>

      <label>
        <span>Password</span>
        <div class="password-input-row">
          <input
            v-model="password"
            :type="isPasswordVisible ? 'text' : 'password'"
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
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
        <small v-if="mode === 'register'">
          At least 8 characters.
        </small>
        <small v-else class="invisible-helper-text">
          Password
        </small>
      </label>

      <div class="form-message-area" aria-live="polite">
        <p v-if="errorMessage" class="error">
          {{ errorMessage }}
        </p>

        <p v-else-if="noticeMessage" class="success-message">
          {{ noticeMessage }}
        </p>
      </div>

      <button
        type="submit"
        class="auth-submit-button"
        :disabled="!canSubmit || isSubmitting"
      >
        {{ isSubmitting ? "Submitting..." : mode === "login" ? "Login" : "Register" }}
      </button>
    </form>
  </section>
</template>
