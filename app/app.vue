<template>
  <div class="dark:bg-gray-900 dark:text-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
    <NuxtRouteAnnouncer />
    <ChatWindow />
  </div>

</template>
<script setup lang="ts">
import ChatWindow from './components/ChatWindow.vue';
</script>
