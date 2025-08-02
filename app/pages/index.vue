<template>
  <div class="home-page dark:bg-gray-900 dark:text-gray-100 min-h-[100dvh]">
    <ChatWindow />
  </div>
</template>

<script setup lang="ts">
import ChatWindow from '@/components/ChatWindow.vue';
</script>

<style scoped>
.home-page {
  min-height: 100dvh;
}
</style>
