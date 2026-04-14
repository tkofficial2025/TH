/**
 * node_modules/.vite を削除する（504 Outdated Optimize Dep のときに実行）。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'node_modules', '.vite');
fs.rmSync(dir, { recursive: true, force: true });
console.log('✅ Vite キャッシュを削除しました:', dir);
