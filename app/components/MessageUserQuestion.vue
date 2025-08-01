<template>
  <div class="part-else-content" data-section="user-question" v-html="marked.parse(content)">
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked';
defineProps<{ content: string }>();
</script>
