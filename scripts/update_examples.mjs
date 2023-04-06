import { readdirSync } from 'fs'
import { join, extname } from 'path'
import { refactorExtension, getPackageJsonType } from './refactor_to_new_extension.mjs'

const MJS_TYPE = 'mjs'
const MJS_EXTENSION = '.mjs'
const MJS_EXAMPLES_DIR = 'examples/esm'

const CJS_TYPE = 'cjs'
const CJS_EXTENSION = '.cjs'
const CJS_EXAMPLES_DIR = 'examples/commonjs'

const JS_EXTENSION = '.js'

const updateAndClean = (dir, entries, oldExtension, newExtension, type) => {
    for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isFile()) {
            const extension = extname(entry.name)
            if (extension === oldExtension) {
                refactorExtension(fullPath, oldExtension, newExtension, type)
            }
        } else if (entry.isDirectory()) {
            updateAndClean(fullPath, entries, oldExtension, newExtension, type)
        }
    }
}

const updateExamples = (type) => {
    const mjsEntries = readdirSync(MJS_EXAMPLES_DIR, { withFileTypes: true })
    const cjsEntries = readdirSync(CJS_EXAMPLES_DIR, { withFileTypes: true })

    if (type === MJS_TYPE) {
        updateAndClean(MJS_EXAMPLES_DIR, mjsEntries, JS_EXTENSION, MJS_EXTENSION, MJS_TYPE)
        updateAndClean(CJS_EXAMPLES_DIR, cjsEntries, CJS_EXTENSION, JS_EXTENSION)
    } else {
        updateAndClean(MJS_EXAMPLES_DIR, mjsEntries, MJS_EXTENSION, JS_EXTENSION, MJS_TYPE)
        updateAndClean(CJS_EXAMPLES_DIR, cjsEntries, JS_EXTENSION, CJS_EXTENSION)
    }
}

const main = (type) => {
    if (!type) type = getPackageJsonType()
    if (type != MJS_TYPE && type != CJS_TYPE) return

    updateExamples(type)
}

main(process.argv[2])
