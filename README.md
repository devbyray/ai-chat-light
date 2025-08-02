
# AI Chat Light

AI Chat Light is a lightweight, privacy-friendly AI chat application designed for local AI LLMs. It supports Ollama and MCP servers, and is built with Nuxt.js 3 and Tailwind CSS for a fast, accessible, and modern user experience.

## Features

- Chat with local LLMs (Ollama, MCP)
- Fast, minimal UI with accessibility in mind
- No cloud dependencies by default
- Easy to run locally or in Docker

---

## Usage

You can use AI Chat Light to interact with your own local AI models. Simply run the app, connect it to your Ollama or MCP server, and start chatting.

---


## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```


## Running Locally

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```


---

## Running with Docker

You can run the app in a containerized environment using Docker:

```bash
docker build -t ai-chat-light .
docker run -p 3000:3000 ai-chat-light
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```


Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```


---

## More Information

- [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction)
- [Ollama](https://ollama.com/)
- [Model Context Protocol (MCP)](https://github.com/modelcontext/protocol)

---
