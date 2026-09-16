import { app } from "./index.js";

app.listen(3000);

console.log(
  `🦊 Elysia running at http://${app.server?.hostname}:${app.server?.port}`
);
