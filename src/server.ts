import { createApp } from "./app";

const port = Number(process.env.PORT) || 3000;

createApp().listen(port, () => {
  console.log(`Tasks API listening on http://localhost:${port}`);
  console.log(`API docs available at http://localhost:${port}/docs`);
});
