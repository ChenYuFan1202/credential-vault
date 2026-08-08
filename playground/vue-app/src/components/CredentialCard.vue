<script setup lang="ts">
type Credential = {
  id: string;
  platform: string;
  username: string;
  password: string;
  notes?: string;
};

const props = defineProps<{
  credential: Credential;
}>();

const emit = defineEmits<{
  delete: [id: string];
}>();

function requestDelete(): void {
  emit("delete", props.credential.id);
}
</script>

<template>
  <li>
    <strong>{{ credential.platform }}</strong>
    <span> - {{ credential.username }}</span>
    <button type="button" @click="requestDelete">Delete</button>
  </li>
</template>