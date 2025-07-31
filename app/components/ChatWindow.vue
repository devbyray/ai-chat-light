
<template>
  <section class="max-w-xl mx-auto mt-8 p-4 bg-white rounded shadow" aria-label="Chat window">
    <h2 class="text-xl font-bold mb-4">AI Chat</h2>
    <div class="mb-4">
      <label for="model-select" class="font-medium mr-2">Model:</label>
      <select
        id="model-select"
        v-model="selectedModel"
        class="border rounded px-2 py-1"
        :aria-busy="modelsLoading"
        :disabled="modelsLoading"
      >
        <option v-for="model in models" :key="model" :value="model">
          {{ model }}
        </option>
      </select>
      <span v-if="modelsLoading" class="ml-2 text-gray-500">Loading models…</span>
    </div>
    <MessageList :messages="messages" />
    <MessageInput @send="handleSend" :loading="loading" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { Ollama } from 'ollama';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';



type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};


const messages = ref<Message[]>([]);
const loading = ref(false);
const models = ref<string[]>([]);
const selectedModel = ref<string>('');
const modelsLoading = ref(true);

const ollama = new Ollama({ host: 'http://localhost:11434' });

const fetchModels = async () => {
  modelsLoading.value = true;
  try {
    // The official ollama npm package exposes a .list() method
    const result = await ollama.list();
    // result.models is an array of { name: string, ... }
    models.value = result.models.map((m: { name: string }) => m.name);
    selectedModel.value = models.value[0] || '';
  } catch (err) {
    models.value = [];
    selectedModel.value = '';
  } finally {
    modelsLoading.value = false;
  }
};

fetchModels();

const handleSend = async (content: string) => {
  if (!selectedModel.value) {
    messages.value.push({
      id: uuidv4(),
      role: 'assistant',
      content: 'No model selected.',
      timestamp: new Date().toISOString(),
    });
    return;
  }
  const userMsg: Message = {
    id: uuidv4(),
    role: 'user',
    content,
    timestamp: new Date().toISOString(),
  };
  messages.value.push(userMsg);
  loading.value = true;
  try {
    const response = await ollama.chat({
      model: selectedModel.value,
      messages: messages.value.map((msg: Message) => ({ role: msg.role, content: msg.content })),
    });
    messages.value.push({
      id: uuidv4(),
      role: 'assistant',
      content: response.message.content,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    messages.value.push({
      id: uuidv4(),
      role: 'assistant',
      content: 'Error: ' + (err?.message || 'Failed to get response.'),
      timestamp: new Date().toISOString(),
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
section {
  min-height: 400px;
}
</style>
