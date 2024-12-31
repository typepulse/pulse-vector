# Welcome to the API documentation for the PDF Embeddings API :)

## Endpoints

### `https://api.supavec.com/upload_file`

Upload a PDF file to generate embeddings.

```typescript
const formData = new FormData();
formData.append("file", files[0]);

const response = await fetch("https://api.supavec.com/upload_file", {
  method: "POST",
  headers: {
    authorization: apiKey,
  },
  body: formData,
});
```

### `https://api.supavec.com/embeddings`

Search for embeddings relevant to a query in a list of uploaded PDF files.


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