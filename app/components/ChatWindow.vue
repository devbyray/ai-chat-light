
<template>
  <section
    class="w-full max-w-lg mx-auto mt-8 p-0 rounded-2xl shadow-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 flex flex-col min-h-[500px]"
    aria-label="Chat window"
    tabindex="0"
  >
    <header class="px-6 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
      <h2 class="text-2xl font-bold flex-1">AI Chat</h2>
      <div class="flex items-center gap-2">
        <label for="model-select" class="font-medium text-sm">Model:</label>
        <select
          id="model-select"
          v-model="selectedModel"
          class="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500"
          :aria-busy="modelsLoading"
          :disabled="modelsLoading"
          aria-label="Select LLM model"
        >
          <option v-for="model in models" :key="model" :value="model">
            {{ model }}
          </option>
        </select>
        <span v-if="modelsLoading" class="ml-2 text-gray-500 text-xs">Loading…</span>
      </div>
    </header>
    <main class="flex-1 px-6 py-4 overflow-y-auto">
      <MessageList :messages="messages" :streamingThinks="streamingThinks" />
      <div v-if="errorMsg" class="mt-2 text-red-600 dark:text-red-400 text-sm" role="alert" aria-live="assertive">{{ errorMsg }}</div>
    </main>
    <footer class="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-800 bg-transparent">
      <MessageInput @send="handleSend" :loading="loading" />
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { Ollama } from 'ollama';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';

type MessagePart = {
  type: 'text' | 'think';
  content: string;
};
type Message = {
  id: string;
  role: 'user' | 'assistant';
  parts: MessagePart[];
  timestamp: string;
};

const messages = ref<Message[]>([]);
const loading = ref(false);
const models = ref<string[]>([]);
const selectedModel = ref<string>('');
const modelsLoading = ref(true);
const errorMsg = ref<string | undefined>(undefined);
const streamingThinks = ref<string[]>([]);

// Tailwind dark mode: toggle 'dark' class on <html> based on system preference
onMounted(() => {
  const setHtmlDark = () => {
    const html = document.documentElement;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };
  setHtmlDark();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setHtmlDark);
});

const ollama = new Ollama({ host: 'http://localhost:11434' });

const fetchModels = async () => {
  modelsLoading.value = true;
  try {
    const result = await ollama.list();
    models.value = result.models.map((m: { name: string }) => m.name);
    selectedModel.value = models.value[0] || '';
    errorMsg.value = undefined;
  } catch (err: any) {
    models.value = [];
    selectedModel.value = '';
    errorMsg.value = 'Failed to load models.';
  } finally {
    modelsLoading.value = false;
  }
};

fetchModels();

const handleSend = async (content: string) => {
  errorMsg.value = undefined;
  streamingThinks.value = [];
  if (!selectedModel.value) {
    errorMsg.value = 'No model selected.';
    return;
  }
  if (!content.trim()) {
    errorMsg.value = 'Message cannot be empty.';
    return;
  }
  const userMsg: Message = {
    id: uuidv4(),
    role: 'user',
    parts: [{ type: 'text', content }],
    timestamp: new Date().toISOString(),
  };
  messages.value.push(userMsg);
  loading.value = true;
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
  let received = false;
  try {
    let tempAssistantId: string | undefined = undefined;
    let assistantParts: MessagePart[] = [];
    const chatStream = await ollama.chat({
      model: selectedModel.value,
      messages: messages.value.map((msg: Message) => ({
        role: msg.role,
        content: msg.parts.map(p => p.content).join(''),
      })),
      stream: true,
    });

    // Show waiting message if nothing received after 3s
    timeoutId = setTimeout(() => {
      if (!received) {
        errorMsg.value = 'Waiting for model response...';
      }
    }, 3000);

    let prevText = '';
    // Streaming <think> block state
    let inThink = false;
    let thinkBuffer = '';
    let textBuffer = '';
    for await (const chunk of chatStream) {
      // eslint-disable-next-line no-console
      console.log('Ollama chunk:', chunk);
      received = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
        errorMsg.value = undefined;
      }
      let content = chunk.message.content;
      let i = 0;
      while (i < content.length) {
        if (!inThink) {
          const thinkStart = content.indexOf('<think>', i);
          if (thinkStart === -1) {
            // No <think> ahead, all is text
            textBuffer += content.slice(i);
            // Stream the final answer as it arrives
            if (textBuffer && textBuffer !== prevText) {
              // Only push new text
              assistantParts.push({ type: 'text', content: textBuffer });
              prevText = textBuffer;
              textBuffer = '';
              // Update the assistant message in the list
              if (!tempAssistantId) {
                tempAssistantId = uuidv4();
                messages.value.push({
                  id: tempAssistantId ?? '',
                  role: 'assistant',
                  parts: [...assistantParts],
                  timestamp: new Date().toISOString(),
                });
              } else {
                const idx = messages.value.findIndex(m => m.id === tempAssistantId);
                if (idx !== -1) {
                  messages.value[idx]!.parts = [...assistantParts];
                }
              }
            }
            break;
          } else {
            // Text before <think>
            if (thinkStart > i) {
              textBuffer += content.slice(i, thinkStart);
              if (textBuffer && textBuffer !== prevText) {
                assistantParts.push({ type: 'text', content: textBuffer });
                prevText = textBuffer;
                textBuffer = '';
                // Update the assistant message in the list
                if (!tempAssistantId) {
                  tempAssistantId = uuidv4();
                  messages.value.push({
                    id: tempAssistantId ?? '',
                    role: 'assistant',
                    parts: [...assistantParts],
                    timestamp: new Date().toISOString(),
                  });
                } else {
                  const idx = messages.value.findIndex(m => m.id === tempAssistantId);
                  if (idx !== -1) {
                    messages.value[idx]!.parts = [...assistantParts];
                  }
                }
              }
            }
            i = thinkStart + 7; // skip <think>
            inThink = true;
            thinkBuffer = '';
            // Start a new streaming think
            streamingThinks.value.push('');
          }
        } else {
          const thinkEnd = content.indexOf('</think>', i);
          if (thinkEnd === -1) {
            // All is part of <think>
            thinkBuffer += content.slice(i);
            // Update last streaming think
            if (streamingThinks.value.length > 0) {
              streamingThinks.value[streamingThinks.value.length - 1] = thinkBuffer;
            }
            break;
          } else {
            // End of <think> found
            thinkBuffer += content.slice(i, thinkEnd);
            // Update last streaming think
            if (streamingThinks.value.length > 0) {
              streamingThinks.value[streamingThinks.value.length - 1] = thinkBuffer;
            }
            // Remove from streamingThinks
            streamingThinks.value.pop();
            inThink = false;
            thinkBuffer = '';
            i = thinkEnd + 8; // skip </think>
          }
        }
      }
    }
    // After stream ends, flush any remaining text
    if (textBuffer && textBuffer !== prevText) {
      assistantParts.push({ type: 'text', content: textBuffer });
      prevText = textBuffer;
    }
    // After stream ends, update the assistant message one last time to show the final answer
    if (tempAssistantId) {
      const idx = messages.value.findIndex(m => m.id === tempAssistantId);
      if (idx !== -1) {
        messages.value[idx]!.parts = [...assistantParts];
      }
    }
    streamingThinks.value = [];
    if (!received) {
      errorMsg.value = 'No response received from model.';
    }
  } catch (err: any) {
    errorMsg.value = 'Error: ' + (err?.message || 'Failed to get response.');
  } finally {
    loading.value = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};
</script>

<style scoped>
section {
  outline: none;
  transition: background 0.2s, color 0.2s;
}
</style>
