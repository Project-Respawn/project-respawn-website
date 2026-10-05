// Shared package entrypoint. Domain selection is mandatory; no Legacy default.
import { runSelected } from "./deployment/select.mjs";
await runSelected(process.argv.slice(2));
