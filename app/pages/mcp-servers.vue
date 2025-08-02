<template>
  <main class="mcp-servers-page">
    <h1>MCP Server Management</h1>
    <MCPServerList />
  </main>
</template>

<script setup lang="ts">
import MCPServerList from '@/components/MCPServerList.vue';
</script>

<style scoped>
.mcp-servers-page {
  max-width: 700px;
  margin: 2rem auto;
  padding: 1rem;
}
h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}
</style>
