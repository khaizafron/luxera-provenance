import fs from 'fs';
import path from 'path';
import {
  createDocumentStorageTarget,
  ensureDocumentStorageDirectory,
  getDocumentStorageDirectory,
} from '../lib/storage/document-storage';

function normalize(p: string): string {
  return p.replace(/\\/g, '/');
}

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  console.log('\n========================================');
  console.log('DOCUMENT STORAGE REGRESSION TESTS');
  console.log('========================================\n');

  const workspaceRoot = 'C:\\luxera-workspace';
  const tempRoot = '/tmp';

  const devDir = normalize(
    getDocumentStorageDirectory({ runtime: 'development', workspaceRoot })
  );
  assert(
    devDir === 'C:/luxera-workspace/private_uploads',
    `Development uploads should stay in the local private_uploads folder, got ${devDir}`
  );

  const prodDir = normalize(getDocumentStorageDirectory({ runtime: 'production', tempRoot }));
  assert(
    prodDir === '/tmp/luxera-provenance/document-processing',
    `Production uploads should use a writable temp directory, got ${prodDir}`
  );
  assert(
    !prodDir.includes('private_uploads'),
    `Production uploads must not reference private_uploads, got ${prodDir}`
  );

  const prodTarget = createDocumentStorageTarget('Payslip 2026.pdf', {
    runtime: 'production',
    tempRoot,
  });
  const normalizedTargetPath = normalize(prodTarget.filePath);
  assert(
    normalizedTargetPath.startsWith('/tmp/luxera-provenance/document-processing/'),
    `Production target should live under /tmp/luxera-provenance/document-processing, got ${normalizedTargetPath}`
  );
  assert(
    !normalizedTargetPath.includes('/var/task/private_uploads'),
    `Production target must never point at /var/task/private_uploads, got ${normalizedTargetPath}`
  );

  ensureDocumentStorageDirectory(prodTarget.filePath);
  fs.writeFileSync(prodTarget.filePath, Buffer.from('temporary evidence payload'));
  assert(fs.existsSync(prodTarget.filePath), 'Temporary file should exist before cleanup');
  prodTarget.cleanup();
  assert(!fs.existsSync(prodTarget.filePath), 'Temporary file should be removed after cleanup');

  const devTarget = createDocumentStorageTarget('Payslip 2026.pdf', {
    runtime: 'development',
    workspaceRoot,
  });
  assert(
    normalize(devTarget.filePath).includes('C:/luxera-workspace/private_uploads/'),
    `Development target should remain in private_uploads, got ${normalize(devTarget.filePath)}`
  );

  console.log('✓ PASS: storage helper resolves production temp paths and cleans up ephemeral files');
}

main().catch((error) => {
  console.error('✘ FAIL: document storage regression tests');
  console.error(error);
  process.exit(1);
});
