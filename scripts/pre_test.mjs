import { execSync } from 'child_process'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname } from 'path'

const tmpFilePath = './tmp/original_type'
const moduleType = 'module'

const originalType = process.env.npm_package_type || 'commonjs'

const tmpFileDir = dirname(tmpFilePath)
if (!existsSync(tmpFileDir)) {
    mkdirSync(tmpFileDir, { recursive: true })
}
writeFileSync(tmpFilePath, originalType)

execSync(`json -I -f package.json -e 'this.type="${moduleType}"'`)
