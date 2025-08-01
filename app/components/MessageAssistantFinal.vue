<template>
  <div class="part-done-html" v-html="content" data-section="assistant-final"></div>
</template>

<script setup lang="ts">
defineProps<{ content: string }>();
</script>
