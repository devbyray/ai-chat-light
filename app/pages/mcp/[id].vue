<template>
  <div class="max-w-2xl mx-auto py-8">
    <MCPServerForm v-if="server" :server="server" @saved="onSaved" />
    <div v-else class="text-center text-gray-500 dark:text-gray-400 py-12">Loading...</div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import MCPServerForm from '~/components/MCPServerForm.vue';

const route = useRoute();
const router = useRouter();
const server = ref<any>(null);

const fetchServer = async () => {
  const id = route.params.id;
  if (!id) return;
  try {
    server.value = await $fetch(`/api/mcp/${id}`);
  } catch (e) {
    server.value = null;
  }
};

const onSaved = () => {
  router.push('/');
};

onMounted(fetchServer);
</script>
