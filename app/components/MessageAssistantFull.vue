<template>
  <div class="flex flex-col p-3">
    <div v-if="props.loading" class="mb-4 text-gray-500">Parsing answer...</div>
    <div class=" dark:text-gray-200 text-gray-800 inline-block rounded text-base" data-section="assistant-full" v-html="parsed">
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked';
const props = defineProps<{ content: string; loading: boolean }>();
const parsed = computed(() => {
  return marked.parse(props?.content || '');
});
</script>
