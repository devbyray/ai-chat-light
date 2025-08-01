<template>
  <span class="part-done-html" v-html="content" data-section="assistant-final"></span>
</template>

<script setup lang="ts">
defineProps<{ content: string }>();
</script>
