<template>
  <section
    class="w-full p-0 shadow-xl bg-white/90 dark:bg-gray-900/90  dark:border-gray-700 min-h-[calc(100dvh-2rem)] grid grid-rows-[auto_1fr_auto] relative"
    aria-label="Chat window"
    tabindex="0"
  >
    <AppHeader
      :selectedModel="selectedModel"
      :models="models"
      :modelsLoading="modelsLoading"
      :onModelChange="(model) => { selectedModel = model; }"
    />
    <main class="flex-1 px-6 py-4  min-h-[80dvh] h-full overflow-y-auto">
      <div ref="msgListContainer" role="log" aria-live="polite" class="pb-16">
        <MessageList :loading="loading" :messages="messages" :streamingThinks="streamingThinks" :fullAssistantMessages="fullAssistantMessages" />
      </div>
      <div v-if="errorMsg" class="mt-2 text-red-600 dark:text-red-400 " role="alert" aria-live="assertive">{{ errorMsg }}</div>
    </main>
    <footer class="p-4 border-t border-gray-500 dark:border-gray-700 bg-gray-100/90 dark:bg-gray-900/90 fixed bottom-0 left-0 w-full">
      <div class="mx-auto max-w-3xl">
      <MessageInput @send="handleSend" :loading="loading" />
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { nextTick, watch, ref as vueRef } from 'vue';
import AppHeader from './AppHeader.vue';
// ...existing code...

const msgListContainer = vueRef<HTMLElement | null>(null);

// ...existing code...

import { ref, onMounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
// ...existing code...
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
  parentId?: string; // Only for assistant messages
};

const messages = ref<Message[]>([]);
const loading = ref(false);
const models = ref<string[]>([]);
const selectedModel = ref<string>('');
const modelsLoading = ref(true);
const errorMsg = ref<string | undefined>(undefined);
const streamingThinks = ref<string[]>([]);
const fullAssistantMessages = ref<Record<string, string>>({});

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

// ...existing code...

const fetchModels = async () => {
  modelsLoading.value = true;
  try {
    const result = await $fetch('/api/ollama/models') as { models: { name: string }[] };
    models.value = result.models.map((m) => m.name);
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
    const chatResponse = await $fetch('/api/ollama/chat', {
      method: 'POST',
      body: {
        model: selectedModel.value,
        messages: messages.value.map((msg: Message) => ({
          role: msg.role,
          content: msg.parts.map(p => p.content).join(''),
        })),
        stream: false,
      },
    }) as { response: { message: { content: string } } };
    // Simulate streaming by pushing the full response as a single chunk
    const content = chatResponse.response.message.content;
    let i = 0;
    // ...existing code for parsing content and updating UI...

    // Show waiting message if nothing received after 3s
    timeoutId = setTimeout(() => {
      if (!received) {
        errorMsg.value = 'Waiting for model response...';
      }
    }, 3000);

    let prevText = '';
    let inThink = false;
    let thinkBuffer = '';
    let textBuffer = '';
    // Remove old chatStream loop, use only the new content parsing logic
    // Parse the content as a single response (no streaming)
    while (i < content.length) {
      if (!inThink) {
        const thinkStart = content.indexOf('<think>', i);
        if (thinkStart === -1) {
          textBuffer += content.slice(i);
          if (textBuffer && textBuffer !== prevText) {
            assistantParts.push({ type: 'text', content: textBuffer });
            prevText = textBuffer;
            textBuffer = '';
            if (!tempAssistantId) {
              tempAssistantId = uuidv4();
              messages.value.push({
                id: tempAssistantId ?? '',
                role: 'assistant',
                parts: [...assistantParts],
                timestamp: new Date().toISOString(),
                parentId: userMsg.id,
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
          if (thinkStart > i) {
            textBuffer += content.slice(i, thinkStart);
            if (textBuffer && textBuffer !== prevText) {
              assistantParts.push({ type: 'text', content: textBuffer });
              prevText = textBuffer;
              textBuffer = '';
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
          i = thinkStart + 7;
          inThink = true;
          thinkBuffer = '';
          streamingThinks.value.push('');
        }
      } else {
        const thinkEnd = content.indexOf('</think>', i);
        if (thinkEnd === -1) {
          thinkBuffer += content.slice(i);
          if (streamingThinks.value.length > 0) {
            streamingThinks.value[streamingThinks.value.length - 1] = thinkBuffer;
          }
          break;
        } else {
          thinkBuffer += content.slice(i, thinkEnd);
          if (streamingThinks.value.length > 0) {
            streamingThinks.value[streamingThinks.value.length - 1] = thinkBuffer;
          }
          streamingThinks.value.pop();
          inThink = false;
          thinkBuffer = '';
          i = thinkEnd + 8;
        }
      }
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

// Place watch after messages and streamingThinks are declared
watch([messages, streamingThinks], async () => {
  await nextTick();
  if (msgListContainer.value) {
    msgListContainer.value.scrollTop = msgListContainer.value.scrollHeight;
  }
});
</script>

<style scoped>
section {
  outline: none;
  transition: background 0.2s, color 0.2s;
}
</style>
