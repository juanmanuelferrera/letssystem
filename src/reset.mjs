// reset.mjs — borra la base de datos para empezar de cero.
import { rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.LETS_DB || join(__dir, '..', 'data', 'lets.db');

if (!process.argv.includes('--yes')) {
  console.error(`Esto BORRARÁ la base de datos: ${DB_PATH}`);
  console.error('Para confirmar:  node --no-warnings src/reset.mjs --yes');
  process.exit(1);
}

let n = 0;
for (const f of [DB_PATH, DB_PATH + '-wal', DB_PATH + '-shm']) {
  if (existsSync(f)) { rmSync(f); console.log('· borrado ' + f); n++; }
}
console.log(n ? 'Base de datos reiniciada.' : 'No había base de datos que borrar.');
console.log('Arranca el servidor (o la semilla) para recrearla.');
