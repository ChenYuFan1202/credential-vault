<script setup lang="ts">
import { computed, ref, watch } from "vue";

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
  <section class="credential-panel">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Account</p>
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
            @click="isPasswordVisible = !isPasswordVisible"
          >
            {{ isPasswordVisible ? "Hide" : "Show" }}
          </button>
        </div>
        <small v-if="mode === 'register'">
          At least 8 characters.
        </small>
      </label>

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>

      <p v-if="noticeMessage" class="success-message">
        {{ noticeMessage }}
      </p>

      <button type="submit" :disabled="!canSubmit || isSubmitting">
        {{ isSubmitting ? "Submitting..." : mode === "login" ? "Login" : "Register" }}
      </button>
    </form>
  </section>
</template>
