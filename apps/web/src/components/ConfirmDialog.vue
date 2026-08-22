<script setup lang="ts">
defineProps<{
  title: string;
  message: string;
  confirmLabel: string;
  isConfirming: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <div class="dialog-backdrop" role="presentation">
    <section
      class="dialog-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <h2 id="confirm-dialog-title">{{ title }}</h2>

      <p>{{ message }}</p>

      <div class="credential-actions">
        <button
          type="button"
          class="danger-button"
          :disabled="isConfirming"
          @click="emit('confirm')"
        >
          {{ isConfirming ? "Deleting..." : confirmLabel }}
        </button>

        <button
          type="button"
          :disabled="isConfirming"
          @click="emit('cancel')"
        >
          Cancel
        </button>
      </div>
    </section>
  </div>
</template>
