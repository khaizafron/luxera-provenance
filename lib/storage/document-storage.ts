import fs from 'fs';
import os from 'os';
import path from 'path';

export type DocumentStorageRuntime = 'development' | 'production';

export interface DocumentStorageTarget {
  filePath: string;
  isEphemeral: boolean;
  cleanup: () => void;
}

export interface DocumentStorageOptions {
  runtime?: DocumentStorageRuntime;
  tempRoot?: string;
  workspaceRoot?: string;
}

function isProductionRuntime(runtime?: DocumentStorageRuntime): boolean {
  if (runtime) return runtime === 'production';
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL === '1' ||
    Boolean(process.env.VERCEL_ENV) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.FUNCTIONS_WORKER_RUNTIME) ||
    Boolean(process.env.NETLIFY)
  );
}

function sanitizeFilename(filename: string): string {
  const baseName = path.basename(filename || 'document.bin');
  return baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function buildDevelopmentDir(workspaceRoot = process.cwd()): string {
  return path.join(workspaceRoot, 'private_uploads');
}

function buildProductionDir(tempRoot = os.tmpdir()): string {
  return path.join(tempRoot, 'luxera-provenance', 'document-processing');
}

export function getDocumentStorageDirectory(options: DocumentStorageOptions = {}): string {
  return isProductionRuntime(options.runtime)
    ? buildProductionDir(options.tempRoot)
    : buildDevelopmentDir(options.workspaceRoot);
}

export function isEphemeralDocumentStorage(options: DocumentStorageOptions = {}): boolean {
  return isProductionRuntime(options.runtime);
}

export function createDocumentStorageTarget(
  originalFilename: string,
  options: DocumentStorageOptions = {}
): DocumentStorageTarget {
  const storageDir = getDocumentStorageDirectory(options);
  const fileName = `${Date.now()}_${sanitizeFilename(originalFilename)}`;
  const filePath = path.join(storageDir, fileName);
  const isEphemeral = isEphemeralDocumentStorage(options);

  return {
    filePath,
    isEphemeral,
    cleanup: () => {
      if (!isEphemeral) return;
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn('[DocumentStorage] Failed to clean up temporary upload artifact:', err);
      }
    },
  };
}

export function ensureDocumentStorageDirectory(targetPath: string): void {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
}
