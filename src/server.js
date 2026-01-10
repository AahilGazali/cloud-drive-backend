import app from "./app.js";
import { env } from "./config/env.js";

// Prefer explicit PORT from env, but fall back to 4000 to avoid clashing
// with other common dev services that might already use 8080.
const PORT = env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
