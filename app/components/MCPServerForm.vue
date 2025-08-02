<template>
  <div class="mcp-server-form">
    <form @submit.prevent="onSubmit" aria-label="MCP Server Form">
      <label for="name">Name</label>
      <input id="name" v-model="form.name" required type="text" />

      <label for="url">URL</label>
      <input id="url" v-model="form.url" required type="url" />

      <label for="description">Description</label>
      <input id="description" v-model="form.description" type="text" />

      <label>
        <input type="checkbox" v-model="form.enabled" /> Enabled
      </label>

      <div class="form-actions">
        <button type="submit">{{ form.id ? 'Update' : 'Add' }}</button>
        <button type="button" @click="$emit('close')">Cancel</button>
      </div>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';

interface MCPServer {
  id?: number;
  name: string;
  url: string;
  description?: string;
  lastUsed?: string;
  enabled: boolean;
}

const props = defineProps<{ server?: MCPServer }>();
const emit = defineEmits(['close', 'saved']);

const form = ref<MCPServer>({
  name: '',
  url: '',
  description: '',
  enabled: true,
});
const error = ref('');

watch(
  () => props.server,
  (server) => {
    if (server) {
      form.value = { ...server };
    } else {
      form.value = { name: '', url: '', description: '', enabled: true };
    }
    error.value = '';
  },
  { immediate: true }
);

const onSubmit = async () => {
  error.value = '';
  try {
    if (form.value.id) {
      await $fetch(`/api/mcp/${form.value.id}/patch`, { method: 'PATCH', body: form.value });
    } else {
      await $fetch('/api/mcp', { method: 'POST', body: form.value });
    }
    emit('saved');
  } catch (e: any) {
    error.value = e?.data?.error || e?.message || 'Failed to save MCP server.';
  }
};
</script>

<style scoped>
.mcp-server-form {
  margin: 1.5rem 0;
}
form {
  display: flex;
  flex-direction: column;
  gap: 0.75em;
}
input[type="text"],
input[type="url"] {
  padding: 0.5em;
  font-size: 1rem;
}
.form-actions {
  display: flex;
  gap: 1em;
  margin-top: 1em;
}
.error {
  color: #c00;
  margin-top: 0.5em;
}
</style>
