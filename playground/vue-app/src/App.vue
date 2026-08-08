<script setup lang="ts">
const appName = "Credential Vault";
</script>

<template>
  <main>
    <h1>{{ appName }}</h1>
    <nav>
      <RouterLink to="/">Credentials</RouterLink>
      <RouterLink to="/new">New Credential</RouterLink>
    </nav>
    <RouterView />
  </main>
</template>
