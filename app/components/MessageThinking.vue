<template>
  <span class="think-block" aria-label="Reasoning" data-section="thinking">
    🧠 <span v-if="done" v-html="content"></span>
    <span v-else>{{ content }}</span>
  </span>
</template>

<script setup lang="ts">
defineProps<{ content: string; done?: boolean }>();
</script>
