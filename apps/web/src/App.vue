<script setup lang="ts">
import { onMounted, ref } from "vue";

type HealthResponse = {
  status: string;
  service: string;
};

const apiStatus = ref<HealthResponse | null>(null);
const isLoading = ref(true);
const errorMessage = ref("");

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

onMounted(() => {
  void loadHealthStatus();
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
  </main>
</template>
