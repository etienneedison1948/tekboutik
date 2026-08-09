export interface StorageProvider {
  /** Sauvegarde un fichier et renvoie son URL publique (ex: "/uploads/produits/xxx.jpg"). */
  save(file: File, folder: string): Promise<string>;
  /** Supprime un fichier à partir de son URL publique. */
  delete(url: string): Promise<void>;
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Format d'image non supporté (utilisez JPG, PNG, WEBP ou GIF).";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "L'image dépasse la taille maximale de 5 Mo.";
  }
  return null;
}
