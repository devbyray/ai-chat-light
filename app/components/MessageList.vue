<template>
  <div>
    <ul class="space-y-2" aria-live="polite">
      <li v-for="msg in messages" :key="msg.id" :class="msg.role === 'user' ? 'text-right' : 'text-left'" class="dark:text-gray-200 text-gray-800">
        <span :class="msg.role === 'user' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'" class="inline-block px-3 py-2 rounded text-base">
          <template v-for="(part, i) in msg.parts" :key="i">
            <template v-if="part.type === 'text'">
              {{ part.content }}
            </template>
            <template v-else-if="part.type === 'think'">
              <span class="think-block" aria-label="Reasoning">🧠 <span v-html="part.content.replace(/\n/g, '<br>')"></span></span>
            </template>
          </template>
        </span>
        <span class="sr-only">{{ msg.role }}</span>
      </li>
    </ul>
    <div v-if="streamingThinks && streamingThinks.length" class="mt-4" role="status" aria-live="polite">
      <span
        v-for="(think, i) in streamingThinks"
        :key="i"
        class="think-block"
        aria-label="Reasoning"
        style="display:inline-block; margin-right:0.5rem;"
      >🧠 <span v-html="think.replace(/\n/g, '<br>')"></span></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

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

const props = defineProps<{ messages: Message[]; streamingThinks?: string[] }>();
</script>


<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.think-block {
  /* background: linear-gradient(90deg, #fef9c3 0%, #fef08a 100%); */
  /* color: #92400e; */
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  font-style: italic;
  font-size: 0.97em;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.04);
}
.dark .think-block {
  /* background: linear-gradient(90deg, #27272a 0%, #52525b 100%);
  color: #facc15; */
}
</style>
