<template>
  <form @submit.prevent="onSend" class="flex gap-2" autocomplete="off">
    <label for="chat-input" class="sr-only">Message</label>
      <input
        id="chat-input"
        v-model="input"
        type="text"
        class="flex-1 border rounded px-3 py-2"
        :aria-invalid="!!error"
        :aria-describedby="error ? 'input-error' : undefined"
        placeholder="Type your message..."
        autocomplete="off"
        required
        @keydown.enter.exact.prevent="onSend"
      />
      <button
        v-if="!props.loading"
        type="submit"
        class="bg-blue-600 text-white px-4 py-2 rounded"
        :disabled="props.loading || !input.trim()"
      >
        Send
      </button>
      <Icon
        v-else-if="props.loading"
        name="mdi:loading"
        class="animate-spin text-blue-500 ml-2"
        style="font-size:1.8em;"
        aria-label="Loading"
      />
  </form>
  <p v-if="error" id="input-error" class="text-red-600 mt-1" role="alert">{{ error }}</p>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';

const input = ref('');
const error = ref<string | undefined>(undefined);

const emit = defineEmits(['send']);
const props = defineProps<{
  loading?: boolean;
}>();

const onSend = () => {
  if (!input.value.trim()) {
    error.value = 'Message cannot be empty.';
    return;
  }
  error.value = undefined;
  emit('send', input.value);
  input.value = '';
};
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
