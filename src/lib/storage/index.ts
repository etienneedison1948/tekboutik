import { LocalStorageProvider } from "./local";
import type { StorageProvider } from "./types";

export type { StorageProvider } from "./types";
export { validateImageFile } from "./types";

// Stockage local pour démarrer. Pour migrer vers un service S3-compatible
// (ex: Cloudflare R2) plus tard : créez une classe qui implémente
// StorageProvider (voir local.ts pour l'exemple) et remplacez la ligne
// ci-dessous — aucun autre fichier de l'application n'a besoin de changer.
export const storage: StorageProvider = new LocalStorageProvider();
