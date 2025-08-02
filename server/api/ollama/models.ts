import { Ollama } from 'ollama';

export default defineEventHandler(async (event) => {
  const ollamaHost = process.env.OLLAMA_HOST || 'http://host.docker.internal:11434';
  const ollama = new Ollama({ host: ollamaHost });
  const models = await ollama.list();
  return { models: models.models };
});
