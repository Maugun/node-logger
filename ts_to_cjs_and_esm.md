# Typescript transpilation to commonJS & ES modules

- [Typescript transpilation to commonJS \& ES modules](#typescript-transpilation-to-commonjs--es-modules)
- [How to do it ?](#how-to-do-it-)
  - [Modify import in .ts files](#modify-import-in-ts-files)
  - [Modify tsconfig.json \& package.json](#modify-tsconfigjson--packagejson)
    - [Create a script to add package.json to your lib directories](#create-a-script-to-add-packagejson-to-your-lib-directories)
    - [Final steps](#final-steps)
  - [Update Examples](#update-examples)
  - [Update Tests](#update-tests)
    - [Ava](#ava)
    - [Sinon](#sinon)

# How to do it ?

## Modify import in .ts files

Add `.js` to the path of `import` from file of your project.

Example:

```diff
- import * as outputUtils from './output_utils'
+ import * as outputUtils from './output_utils.js'
```

Also be sure to not use `require` statements. Add `@types` if needed.

Example:

Create a new file `src/@types/prettyoutput/index.d.ts`:

```typescript
declare module 'prettyoutput' {
    const prettyoutput: (input: Record<string, unknown>, opts: Record<string, unknown>, indent: number) => string

    export = prettyoutput
}
```

then:

```diff
- const prettyOutput = require('prettyoutput')'
+ import prettyOutput from 'prettyoutput'
```

## Modify tsconfig.json & package.json

-   Remove `module`, `outDir`, `target` & `moduleResolution` from the `tsconfig.json`
-   Be sure to have `"esModuleInterop": true,` and `"sourceMap": true` in your `tsconfig.json`
-   Create a `tsconfig.lib.cjs.json` that extend from `tsconfig.json` to transpile TypeScript to commonJS as below:

```tsconfig.json
{
    "extends": "./tsconfig.json",
    "compilerOptions": {
        "module": "CommonJS",
        "outDir": "lib/cjs",
        "target": "es2019",
        "moduleResolution": "node"
    },
    "include": ["src/**/*.ts"]
}
```

-   Create a `tsconfig.lib.esm.json` that extend from `tsconfig.json` to transpile TypeScript to ES modules as below:

```tsconfig.json
{
    "extends": "./tsconfig.json",
    "compilerOptions": {
        "module": "ES2022",
        "outDir": "lib/esm",
        "target": "ESNext",
        "moduleResolution": "nodenext"
    },
    "include": ["src/**/*.ts"]
}
```

Add the following scripts to `package.json` to build to commonJS & ES modules:

```package.json
    "scripts": {
        ...
        "build:commonjs": "tsc --build tsconfig.lib.cjs.json",
        "build:esm": "tsc --build tsconfig.lib.esm.json",
    }
```

To be able to export your types don't forget to add theses lines to `package.json`:

```package.json
   "main": "lib/esm/index.js",
    "types": "lib/esm/index.d.ts",
    "exports": {
        ".": {
            "require": {
                "default": "./lib/cjs/index.js",
                "types": "./lib/cjs/index.d.ts"
            },
            "import": {
                "default": "./lib/esm/index.js",
                "types": "./lib/esm/index.d.ts"
            }
        }
    },
```

### Create a script to add package.json to your lib directories

To be able to run your `.js` files from your lib directories, you need to add a `package.json` file with the field `type` set to `module` for esm js files (`lib/esm` dir) & `commonjs` for cjs js files (`lib/cjs` dir).

You can do it manually after every build but you can also automate the process by adding this script: [create_packages.js](./scripts/create_packages.js)

And by adding the following scripts to `package.json`:

```package.json
    "scripts": {
        ...
        "build:commonjs": "tsc --build tsconfig.lib.cjs.json",
        "build:esm": "tsc --build tsconfig.lib.esm.json",
        "create-packages": "node ./scripts/create_packages.js",
        "build": "yarn build:commonjs & yarn build:esm && yarn create-packages",
    }
```

### Final steps

- Be sure to have `"type": "module"` in your `package.json`
- Add a `package.json` file to the scripts folder: `{"type": "commonjs"}`

You can now run `yarn build` to build your project to ES modules & commonJs !

## Update Examples

You need to update the examples files to be able to have working examples for both commonJS & ES modules.

To do this you need to:

-   Create 2 directories, one for commonjs & one for ES module (`examples/cjs` & `examples/esm`)
-   In the `cjs` directory:
    -   Use `require` statements with path from `lib/cjs` in your js files (don't forget the `.js` at the end of your paths)
    -   Add a `package.json` file to the scripts folder: `{"type": "commonjs"}`
-   In the `esm` directory:
    -   Use `import` statements with path from `lib/esm` in your js files (don't forget the `.js` at the end of your paths)
    -   Add a `package.json` file to the scripts folder: `{"type": "module"}`

You can now run `make examples` to run your examples !

## Update Tests

### Ava

To make the ava tests work in ES module you need to:

-   Replace all `require` statements in your tests with `import` statements (don't forget the `.js` at the end of your paths)
-   Add a `package.json` file to the test folder: `{"type": "module"}`
-   Create an `ava.config.js` file with:

```javascript
export default {
    require: ['ts-node/register'],
    extensions: ['js', 'ts'],
    files: ['test/**/*.test.{js,ts}'],
    nodeArguments: ['--experimental-specifier-resolution=node', '--loader=ts-node/esm', '--no-warnings'],
    environmentVariables: {
        TS_NODE_FILES: 'true',
        TS_NODE_TRANSPILE_ONLY: 'true',
        TS_NODE_COMPILER_OPTIONS: '{"module":"ESNext"}',
    },
}
```

### Sinon

@TODO complete this section
