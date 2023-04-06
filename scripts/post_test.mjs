import { execSync } from 'child_process'
import { readFileSync } from 'fs'

const tmpFilePath = './tmp/original_type'

const originalType = readFileSync(tmpFilePath, 'utf8').trim()

execSync(`json -I -f package.json -e 'this.type="${originalType}"'`)
execSync(`rm -f ${tmpFilePath}`)
