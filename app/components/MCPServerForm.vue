<template>
  <div class="mcp-server-form">
    <form @submit.prevent="onSubmit" aria-label="MCP Server Form" class="bg-white dark:bg-gray-900 p-6 rounded shadow-md flex flex-col gap-3">
      <label for="name" class="font-medium dark:text-gray-200">Name</label>
      <input id="name" v-model="form.name" required type="text" class="input" />

      <label for="url" class="font-medium dark:text-gray-200">URL</label>
      <input id="url" v-model="form.url" required type="url" class="input" />

      <label for="description" class="font-medium dark:text-gray-200">Description</label>
      <input id="description" v-model="form.description" type="text" class="input" />

      <label class="flex items-center gap-2 font-medium dark:text-gray-200">
        <input type="checkbox" v-model="form.enabled" class="accent-blue-600 dark:accent-blue-400" /> Enabled
      </label>

      <div class="form-actions flex gap-3 mt-2">
        <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600">{{ form.id ? 'Update' : 'Add' }}</button>
        <button type="button" @click="$emit('close')" class="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">Cancel</button>
        <button type="button" @click="testConnection" :disabled="testing" class="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-green-500 dark:hover:bg-green-600">{{ testing ? 'Testing...' : 'Test Connection' }}</button>
      </div>
      <p v-if="testResult" :class="['mt-2', testResult.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400']" role="status">
        {{ testResult.ok ? 'Connection successful!' : `Connection failed: ${testResult.error}` }}
      </p>
      <div v-if="testResult && testResult.capabilities" class="mt-2 rounded bg-gray-50 dark:bg-gray-800 p-3" aria-live="polite">
        <div class="font-medium mb-1 text-gray-800 dark:text-gray-100">MCP Server Capabilities:</div>
        <ul class="list-disc ml-6">
          <li v-for="(cap, name) in testResult.capabilities" :key="name" class="text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span class="font-mono">{{ name }}</span>:
            <template v-if="cap.ok">
              <span class="text-green-700 dark:text-green-400 flex items-center gap-1">
                Supported
                <svg xmlns="http://www.w3.org/2000/svg" class="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </span>
            </template>
            <template v-else>
              <span class="text-red-700 dark:text-red-400 flex items-center gap-1">
                Not supported
                <svg xmlns="http://www.w3.org/2000/svg" class="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" /></svg>
              </span>
            </template>
          </li>
        </ul>
      </div>
      <p v-if="error" class="error text-red-600 dark:text-red-400 mt-2" role="alert">{{ error }}</p>
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
const testing = ref(false);
type MCPTestResult = {
  ok: boolean;
  error?: string;
  capabilities?: Record<string, { ok: boolean; error?: string }>;
};
const testResult = ref<MCPTestResult | null>(null);

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

const testConnection = async () => {
  testing.value = true;
  testResult.value = null;
  try {
    const res = await $fetch('/api/mcp/test-connection', {
      method: 'POST',
      body: { url: form.value.url },
    });
    testResult.value = res;
  } catch (e: any) {
    testResult.value = { ok: false, error: e?.data?.error || e?.message || 'Test failed.' };
  } finally {
    testing.value = false;
  }
};
</script>

<style scoped>
.mcp-server-form {
  margin: 1.5rem 0;
}
.input {
  padding: 0.5em;
  font-size: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #222;
  transition: border 0.2s, box-shadow 0.2s;
}
.input:focus {
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 2px #2563eb33;
}
.dark .input {
  background: #1a202c;
  color: #f3f4f6;
  border-color: #374151;
}
.dark .input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px #60a5fa33;
}
</style>
