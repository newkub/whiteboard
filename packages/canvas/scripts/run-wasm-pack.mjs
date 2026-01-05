import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);

const cargoTomlPath = resolve(process.cwd(), 'Cargo.toml');
const cargoToml = readFileSync(cargoTomlPath, 'utf8');

const wasmBindgenVersionMatch = cargoToml.match(/\bwasm-bindgen\s*=\s*"([^"]+)"/);
const inferredWasmBindgenVersion = wasmBindgenVersionMatch?.[1];

const result = spawnSync('wasm-pack', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    ...(process.env.WASM_BINDGEN_VERSION
      ? {}
      : inferredWasmBindgenVersion
        ? { WASM_BINDGEN_VERSION: inferredWasmBindgenVersion }
        : {}),
  },
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
