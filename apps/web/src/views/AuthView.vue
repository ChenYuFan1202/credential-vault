<script setup lang="ts">
import AuthForm from "../components/AuthForm.vue";

type AuthMode = "login" | "register";

type AuthFormInput = {
  username: string;
  password: string;
};

defineProps<{
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
</script>

<template>
  <AuthForm
    :mode="mode"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    :notice-message="noticeMessage"
    @login="(input) => emit('login', input)"
    @register="(input) => emit('register', input)"
    @clear-error="emit('clearError')"
    @switch-mode="emit('switchMode')"
  />
</template>
