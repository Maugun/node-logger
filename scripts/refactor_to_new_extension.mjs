import { readdirSync, readFileSync, renameSync, writeFileSync } from 'fs'
import { join, extname } from 'path'

const MJS_TYPE = 'mjs'
const MJS_EXTENSION = '.mjs'
const MJS_LIB_DIR = 'lib/esm'

const CJS_TYPE = 'cjs'
const CJS_EXTENSION = '.cjs'
const CJS_LIB_DIR = 'lib/commonjs'

const JS_EXTENSION = '.js'
const MAP_EXTENSION = '.map'

export const refactorExtension = (fullPath, oldExtension, newExtension, type) => {
    const specificRegex =
        newExtension === MJS_EXTENSION || type === MJS_TYPE
            ? `(import\\s+.*from\\s+['"]|export\\s+.*from\\s+['"])(.*)(${oldExtension})(['"])`
            : `(require\\(['"]|__importStar\\(require\\(['"]|__exportStar\\(require\\(['"])(.*)(${oldExtension})(['"]\\))`

    const updateSourceMappingURL = readFileSync(fullPath, 'utf-8')
        .replace(new RegExp(specificRegex, 'g'), `$1$2${newExtension}$4`)
        .replace(new RegExp(`(?<=sourceMappingURL=.*)${oldExtension}(?=\.map)`, 'g'), newExtension)

    writeFileSync(fullPath, updateSourceMappingURL)
    renameSync(fullPath, fullPath.replace(oldExtension, newExtension))
}

const refactorMapFileFromJsToNewExtension = (fullPath, newExtension) => {
    const map = JSON.parse(readFileSync(fullPath, 'utf-8'))

    if (map.file) map.file = map.file.replace(/\.js$/, newExtension)

    writeFileSync(fullPath, JSON.stringify(map))
    renameSync(fullPath, fullPath.replace(/\.js.map$/, `${newExtension}.map`))
}

const refactorToNewExtension = (dir, newExtension = MJS_EXTENSION) => {
    if (newExtension != MJS_EXTENSION && newExtension != CJS_EXTENSION) return

    const entries = readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isFile()) {
            const extension = extname(entry.name)
            if (extension === JS_EXTENSION) {
                refactorExtension(fullPath, JS_EXTENSION, newExtension)
            } else if (extension === MAP_EXTENSION) {
                refactorMapFileFromJsToNewExtension(fullPath, newExtension)
            }
        } else if (entry.isDirectory()) {
            refactorToNewExtension(fullPath, newExtension)
        }
    }
}

export const getPackageJsonType = () => process.env.npm_package_type === 'module' ? CJS_TYPE : MJS_TYPE

const main = (type) => {
    if (!type) type = getPackageJsonType()
    if (type != MJS_TYPE && type != CJS_TYPE) return

    const libDir = type === MJS_TYPE ? MJS_LIB_DIR : CJS_LIB_DIR
    const extension = type === MJS_TYPE ? MJS_EXTENSION : CJS_EXTENSION

    refactorToNewExtension(libDir, extension)
}

main(process.argv[2])
