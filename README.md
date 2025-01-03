<p align="center">
  <img src="https://github.com/user-attachments/assets/fc61ed29-e843-4341-be65-52b1f7928201" alt="Supavec Logo" width="200">
</p>

# [Supavec](https://www.supavec.com) - The open-source alternative to Carbon.ai. Build powerful RAG applications with any data source, at any scale.

## Cloud version

https://www.supavec.com

## Built with

* [Next.js](https://nextjs.org/)
* [Supabase](https://supabase.com/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Bun](https://bun.sh/)
* [Upstash](https://upstash.com/)

## API docs

https://github.com/taishikato/supavec/blob/main/packages/api/README.md


## Getting Started

### Install dependencies

```bash
bun i
```

### Run the development server

```bash
bun dev
```

#### Run the web server

```bash
cd apps/web && bun run dev
```

#### Run the API server

```bash
cd packages/api && bun run dev
```

## Our simple API endpoints ✨

We're working on:
- a more comprehensive API documentation, but for now, here's a simple guide to our API endpoints
- building more endpoints to support more data sources and manipulations

Please generate your API Key on [the dashboard page](https://www.supavec.com/login).

Please check our backlog to see what we're working on: https://github.com/users/taishikato/projects/2/views/1

## Endpoints

### `https://api.supavec.com/upload_file`

Upload a PDF or text file to generate embeddings.

```typescript
const formData = new FormData();
formData.append("file", files[0]); // Accepts PDF (.pdf) or text (.txt) files

const response = await fetch("https://api.supavec.com/upload_file", {
  method: "POST",
  headers: {
    authorization: apiKey,
  },
  body: formData,
});
```

### `https://api.supavec.com/upload_text`

Upload a text content to generate embeddings.

```typescript
const res = await fetch("https://api.supavec.com/upload_text", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    authorization: apiKey,
  },
  body: JSON.stringify({ name, contents }),
});
```

### `https://api.supavec.com/embeddings`

Search for embeddings relevant to a query in a list of uploaded files.

```typescript
const res = await fetch("https://api.supavec.com/embeddings", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    authorization: apiKey,
  },
  body: JSON.stringify({ query, file_ids: [selectedFileId] }),
});
```

### `https://api.supavec.com/user_files`

Get a list of files uploaded by the user.

```typescript
const res = await fetch("https://api.supavec.com/user_files", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    authorization: apiKey,
  },
  body: JSON.stringify({ pagination, order_dir }),
});
```
