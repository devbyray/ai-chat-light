<template>
  <ul class="space-y-2" aria-live="polite">
    <li v-for="msg in messages" :key="msg.id" :class="msg.role === 'user' ? 'text-right' : 'text-left'">
      <span :class="msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'" class="inline-block px-3 py-2 rounded text-base">
        {{ msg.content }}
      </span>
      <span class="sr-only">{{ msg.role }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

defineProps<{ messages: Message[] }>();
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
</style>
