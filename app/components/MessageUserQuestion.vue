<template>
  <span class="part-else-content" data-section="user-question">
    {{ content }}
  </span>
</template>

<script setup lang="ts">
defineProps<{ content: string }>();
</script>
