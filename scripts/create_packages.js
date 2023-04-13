import { exec } from 'child_process'

exec(`echo '{"type": "module"}' > lib/esm/package.json`)
exec(`echo '{"type": "commonjs"}' > lib/cjs/package.json`)
