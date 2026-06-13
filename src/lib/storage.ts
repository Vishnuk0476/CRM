/**
 * Storage Service — Panya Global
 * ─────────────────────────────────────────────
 * Handles file uploads via PHP Backend (/api/upload.php)
 */

export type StorageBucket = 'lr-receipts' | 'customer-docs' | 'blog-images' | 'profile-pics';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

async function uploadToBackend(file: File | Blob): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload.php', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Upload failed with status ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Upload failed');

    return { success: true, url: data.data.url, path: data.data.filename };
  } catch (err: unknown) {
    console.error('[Storage] Upload failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Upload a file (generic)
 */
export async function uploadFile(
  bucket: StorageBucket,
  file: File | Blob,
  path: string,
  options?: { upsert?: boolean; contentType?: string }
): Promise<UploadResult> {
  // We ignore 'bucket' and 'path' because the backend handles paths automatically
  return uploadToBackend(file);
}

/**
 * Upload LR Receipt PDF to storage
 */
export async function uploadLRReceipt(
  lrNumber: string,
  pdfBlob: Blob
): Promise<UploadResult> {
  return uploadToBackend(pdfBlob);
}

/**
 * Upload blog post image
 */
export async function uploadBlogImage(
  file: File,
  blogSlug: string
): Promise<UploadResult> {
  return uploadToBackend(file);
}

/**
 * Upload a customer document
 */
export async function uploadCustomerDocument(
  customerId: string,
  file: File,
  docType: 'id_proof' | 'address_proof' | 'invoice' | 'other'
): Promise<UploadResult> {
  return uploadToBackend(file);
}

/**
 * Get a signed URL for private documents (PHP backend doesn't implement this yet, returning standard URL)
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  return `/uploads/${path}`;
}

/**
 * Delete a file from storage (Mock for now, needs backend endpoint)
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<boolean> {
  console.warn('[Storage] deleteFile not implemented in backend yet');
  return true;
}

/**
 * List all files in a folder (Mock for now)
 */
export async function listFiles(bucket: StorageBucket, folder?: string) {
  console.warn('[Storage] listFiles not implemented in backend yet');
  return [];
}

/**
 * Get public URL for a file in a public bucket
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/uploads/${path}`;
}
