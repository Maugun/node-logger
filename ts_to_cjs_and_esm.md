# Typescript transpilation to commonJS & ES modules

- [Typescript transpilation to commonJS \& ES modules](#typescript-transpilation-to-commonjs--es-modules)
- [How to do it ?](#how-to-do-it-)
  - [Modify import in .ts files](#modify-import-in-ts-files)
  - [Modify tsconfig.json \& package.json](#modify-tsconfigjson--packagejson)
  - [Modify .js extensions](#modify-js-extensions)
    - ["type": "commonjs"](#type-commonjs)
    - ["type": "module"](#type-module)
    - [Tools](#tools)
  - [Update Examples](#update-examples)
    - [Tools](#tools-1)
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
        "outDir": "lib/commonjs",
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
        "build": "yarn build:commonjs & yarn build:esm",
    }
```

Now you have to choose if you want `.js` to be interpreted as commonJS or ES modules.

-   For commonJS add `"type": "commonjs"` to your `package.json` or remove the `"type"` configuration as commonJS is used by default anyway
-   For ES modules add `"type": "module"` to your `package.json`

## Modify .js extensions

### "type": "commonjs"

If you choose to add `"type": "commonjs"` to your `package.json` you need to rename:

-   `.js` file to `.mjs`
-   `.js.map` file to `mjs.map`

And to modify:

-   In `.mjs` file:
    -   `.js` to `.mjs` in `import` and `export` statements
    -   `//# sourceMappingURL=your_file.js.map` into `//# sourceMappingURL=your_file.mjs.map`
-   In `.mjs.map` file:
    -   `.js` to `.mjs` in `file` parameters of the JSON

### "type": "module"

If you choose to add `"type": "module"` to your `package.json` you need to the same step as for ["type": "commonjs"](#type-commonjs) but replace all occurence of `.mjs` with `.cjs`.

-   `.js` file to `.cjs`
-   `.js.map` file to `cjs.map`

And to modify:

-   In `.cjs` file:
    -   `.js` to `.cjs` in `require` statements (don't forget `require` statements inside `__exportStar` & `__importStar` statements)
    -   `//# sourceMappingURL=your_file.js.map` into `//# sourceMappingURL=your_file.cjs.map`
-   In `.cjs.map` file:
    -   `.js` to `.cjs` in `file` parameters of the JSON

### Tools

I made a script to automate the process that will be run after transpiling from TypeScript: [refactor_to_new_extension.mjs](./scripts/refactor_to_new_extension.mjs)
To use it you need to add the `refactor-js-extension` script and update your `build` script to your `package.json` as below:

```package.json
    "scripts": {
        ...
        "refactor-js-extension": "node ./scripts/refactor_to_new_extension.mjs",
        ...
        "build": "yarn build:commonjs & yarn build:esm && yarn refactor-js-extension",
        ...
    }
```

**_NOTE:_** You can also add `mjs` or `cjs` as an argument to the `update_examples.mjs` script to force to update for a specific type.

## Update Examples

You also have to update the examples files to be able to have working examples for both commonJS & ES modules.

To do this you need to:

-   Create 2 folders, one for commonjs & one for esm
-   Modify your files `extension` and `import` / `require` to match the `type` you choose as a default in your `package.json`

### Tools

To simplify the modifications when you switch from `"type": "commonjs"` to `"type": "module"` I made a script that update `extension` and `import` / `require`: [update_examples.mjs](./scripts/update_examples.mjs)

To use it simply add to you `package.json`:

```package.json
    "scripts": {
        ...
        "update-examples": "node ./scripts/update_examples.mjs"
        ...
        "build": "yarn build:commonjs & yarn build:esm && yarn refactor-js-extension && yarn update-examples",
        ...
    }
```

**_NOTE:_** You can also add `mjs` or `cjs` as an argument to the `update_examples.mjs` script to force to update for a specific type.

## Update Tests

### Ava

To make the ava tests work with both `"type": "commonjs"` & `"type": "module"` you need to:

-   Rename your `*.test.js` files to `*.test.mjs`
-   Replace all `require` statements in your tests with `import` statements
-   Create an `ava.config.mjs` file with:

```javascript
export default {
    require: ['ts-node/register'],
    extensions: ['js', 'ts', 'mjs'],
    files: ['test/**/*.test.{mjs,js,ts}'],
    nodeArguments: ['--experimental-specifier-resolution=node', '--loader=ts-node/esm', '--no-warnings'],
    environmentVariables: {
        TS_NODE_FILES: 'true',
        TS_NODE_TRANSPILE_ONLY: 'true',
        TS_NODE_COMPILER_OPTIONS: '{"module":"ESNext"}',
    },
}
```

Ava tests will only works when `type` is `module`, to fix this problem I add 2 scripts [pre-test.mjs](./scripts/pre-test.mjs) & [pre-test.mjs](./scripts/pre-test.mjs) that will change the `type` in `package.json` before running the tests and that will restored the `type` after the tests.

```package.json
    "scripts": {
        ...
        "pre-test": "node ./scripts/pre_test.mjs",
        "post-test": "node ./scripts/post_test.mjs",
        "test": "yarn pre-test && ava && yarn post-test",
        ...
    }
```

@TODO execute `yarn post-test` even when ava tests fail

### Sinon

@TODO complete this section


