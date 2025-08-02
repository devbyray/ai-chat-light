import { Ollama } from 'ollama';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const ollamaHost = process.env.OLLAMA_HOST || 'http://host.docker.internal:11434';
  const ollama = new Ollama({ host: ollamaHost });
  const { model, messages, stream } = body;
  // For now, do not stream; just return the response
  const response = await ollama.chat({ model, messages, stream: true });
  return { response };
});
