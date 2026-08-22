<script setup lang="ts">
import { computed, ref } from "vue";

type AuthMode = "login" | "register";

type AuthFormInput = {
  username: string;
  password: string;
};

defineProps<{
  isSubmitting: boolean;
  errorMessage: string;
}>();

const emit = defineEmits<{
  login: [input: AuthFormInput];
  register: [input: AuthFormInput];
  clearError: [];
}>();

const mode = ref<AuthMode>("login");
const username = ref("");
const password = ref("");

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

  if (mode.value === "login") {
    emit("login", input);
  } else {
    emit("register", input);
  }
}

function switchMode(): void {
  mode.value = mode.value === "login" ? "register" : "login";
  username.value = "";
  password.value = "";
  emit("clearError");
}
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
        <input
          v-model="password"
          type="password"
          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
        />
        <small v-if="mode === 'register'">
          At least 8 characters.
        </small>
      </label>

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>

      <button type="submit" :disabled="!canSubmit || isSubmitting">
        {{ isSubmitting ? "Submitting..." : mode === "login" ? "Login" : "Register" }}
      </button>
    </form>
  </section>
</template>
