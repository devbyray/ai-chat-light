<template>
  <header class="p-4 border-b flex items-center gap-2 border-gray-500 dark:border-gray-700 dark:bg-gray-900/90 bg-white/90 w-full z-10 fixed top-0 left-0 shadow-lg w-full">
    <h2 class="text-2xl font-bold flex-1">AI Chat</h2>
    <div class="flex items-center gap-2">
      <label for="model-select" class="font-medium ">Model:</label>
      <select
        id="model-select"
        v-model="selectedModel"
        class="border border-gray-500 dark:border-gray-700 rounded px-2 py-2 bg-white dark:bg-gray-800  focus:ring-2 focus:ring-blue-500"
        :aria-busy="modelsLoading"
        :disabled="modelsLoading"
        aria-label="Select LLM model"
      >
        <option v-for="model in models" :key="model" :value="model">
          {{ model }}
        </option>
      </select>
      <span v-if="modelsLoading" class="ml-2 text-gray-500">Loading…</span>
    </div>
    <div class="flex items-center gap-2 ml-4">
      <button
        @click="decreaseFontSize"
        class="px-2 py-1 rounded border border-gray-400 bg-white dark:bg-gray-800  focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label="Decrease font size"
      >
        A-
      </button>
      <button
        @click="increaseFontSize"
        class="px-2 py-1 rounded border border-gray-400 bg-white dark:bg-gray-800  focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label="Increase font size"
      >
        A+
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
  selectedModel: string;
  models: string[];
  modelsLoading: boolean;
  onModelChange: (model: string) => void;
}>();

const selectedModel = ref(props.selectedModel);
const models = ref(props.models);
const modelsLoading = ref(props.modelsLoading);

watch(() => props.selectedModel, val => { selectedModel.value = val; });
watch(() => props.models, val => { models.value = val; });
watch(() => props.modelsLoading, val => { modelsLoading.value = val; });

watch(selectedModel, val => {
  props.onModelChange(val);
});

const minFontSize = 16;
const maxFontSize = 24;
const step = 4;
const fontSize = ref(minFontSize);

const applyFontSize = () => {
  document.body.style.setProperty('--app-font-size', fontSize.value + 'px');
};

const increaseFontSize = () => {
  if (fontSize.value + step <= maxFontSize) {
    fontSize.value += step;
    applyFontSize();
  }
};

const decreaseFontSize = () => {
  if (fontSize.value - step >= minFontSize) {
    fontSize.value -= step;
    applyFontSize();
  }
};

onMounted(() => {
  applyFontSize();
});
</script>

<style scoped>
header {
  position: sticky;
  top: 0;
}
</style>
