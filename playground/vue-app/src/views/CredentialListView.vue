<script setup lang="ts">
import { computed, ref } from 'vue'
import CredentialCard from '../components/CredentialCard.vue'

type Credential = {
  id: string;
  platform: string;
  username: string;
  password: string;
  notes?: string;
};

const credentials = ref<Credential[]>([
  {
    id: "credential-001",
    platform: "GitHub",
    username: "demo-user",
    password: "fake-password-123",
  },
  {
    id: "credential-002",
    platform: "Gmail",
    username: "demo-mail-user",
    password: "fake-password-456",
    notes: "Fake email account for practice.",
  },
]);

const searchKeyword = ref("");

const filteredCredentials = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  if (keyword === "") {
    return credentials.value;
  }

  return credentials.value.filter((credential) =>
    credential.platform.toLowerCase().includes(keyword),
  );
});

const newCredential = ref({
  platform: "",
  username: "",
  password: "",
  notes: "",
});

const formError = computed(() => {
  if (newCredential.value.platform.trim() === "") {
    return "Platform is required.";
  }

  if (newCredential.value.username.trim() === "") {
    return "Username is required.";
  }

  if (newCredential.value.password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  return "";
});

const isFormValid = computed(() => formError.value === "");

function addCredential(): void {
  if (!isFormValid.value) {
    return;
  }

  credentials.value.push({
    id: crypto.randomUUID(),
    platform: newCredential.value.platform,
    username: newCredential.value.username,
    password: newCredential.value.password,
    notes: newCredential.value.notes || undefined,
  });

  newCredential.value.platform = "";
  newCredential.value.username = "";
  newCredential.value.password = "";
  newCredential.value.notes = "";
}

function deleteCredential(id: string): void {
  credentials.value = credentials.value.filter(
    (credential) => credential.id !== id,
  );
}
</script>

<template>
  <section>
    <h2>Credentials</h2>
    <p>Total: {{ credentials.length }}</p>
    <input
      v-model="searchKeyword"
      type="search"
      placeholder="Search by platform"
    />

    <p>Showing: {{ filteredCredentials.length }}</p>
    <ul>
      <CredentialCard
        v-for="credential in filteredCredentials"
        :key="credential.id"
        :credential="credential"
        @delete="deleteCredential"
      />
    </ul>

    <form @submit.prevent="addCredential">
      <label>
        Platform
        <input v-model="newCredential.platform" type="text" />
      </label>

      <label>
        Username
        <input v-model="newCredential.username" type="text" />
      </label>

      <label>
        Password
        <input v-model="newCredential.password" type="password" />
      </label>

      <label>
        Notes
        <textarea v-model="newCredential.notes"></textarea>
      </label>
        
      <p v-if="formError">{{ formError }}</p>

      <button type="submit" :disabled="!isFormValid">Add Credential</button>
    </form>
  </section>
</template>

<style scoped>
p {
  margin: 0;
}
</style>
