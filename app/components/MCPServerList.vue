<template>
  <section class="mcp-server-list">
    <header>
      <h2>MCP Servers</h2>
      <button @click="showAdd = true" aria-label="Add MCP server" class="add-btn">Add</button>
    </header>
    <ul v-if="servers.length">
      <li v-for="server in servers" :key="server.id" :class="{ active: server.id === activeId }">
        <div class="server-info">
          <span class="server-name">{{ server.name }}</span>
          <span class="server-url">{{ server.url }}</span>
          <span v-if="server.description" class="server-desc">{{ server.description }}</span>
        </div>
        <div class="actions">
          <button @click="edit(server)" aria-label="Edit server">Edit</button>
          <button @click="remove(server.id)" aria-label="Remove server">Remove</button>
          <button v-if="server.id !== activeId" @click="select(server.id)" aria-label="Set active">Set Active</button>
          <span v-else class="active-label" aria-current="true">Active</span>
        </div>
      </li>
    </ul>
    <p v-else>No MCP servers found.</p>
    <div v-if="showAdd || editing" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal-content">
        <MCPServerForm :server="editing" @close="closeForm" @saved="onSaved" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MCPServerForm from './MCPServerForm.vue';


interface MCPServer {
  id: number;
  name: string;
  url: string;
  description?: string;
  lastUsed?: string;
  enabled: boolean;
}

const servers = ref<MCPServer[]>([]);
const activeId = ref<number>();
const showAdd = ref(false);
const editing = ref<MCPServer | undefined>(undefined);

const fetchServers = async () => {
  servers.value = await $fetch('/api/mcp');
};

const select = async (id: number) => {
  activeId.value = id;
  // TODO: Persist active server selection (e.g., localStorage or backend)
};

const edit = (server: any) => {
  editing.value = server;
  showAdd.value = false;
};

const remove = async (id: number) => {
  await $fetch(`/api/mcp/${id}/delete`, { method: 'DELETE' });
  fetchServers();
};

const closeForm = () => {
  showAdd.value = false;
  editing.value = undefined;
};

const onSaved = () => {
  closeForm();
  fetchServers();
};

onMounted(fetchServers);
</script>

<style scoped>
.mcp-server-list {
  max-width: 600px;
  margin: 2rem auto;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.add-btn {
  font-size: 1rem;
  padding: 0.5em 1em;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em 0;
  border-bottom: 1px solid #eee;
}
.active-label {
  color: #007bff;
  font-weight: bold;
}
.server-info {
  flex: 1;
}
.actions button {
  margin-left: 0.5em;
}
/* Modal overlay for form UX */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
  padding: 2rem;
  min-width: 320px;
  max-width: 95vw;
}
</style>
