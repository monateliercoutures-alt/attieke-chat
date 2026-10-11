const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const webSrcDir = path.resolve(__dirname, '../src');
const sharedEntry = path.resolve(__dirname, '../../../packages/shared/src/index.ts');

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === '@attieke-chat/shared') {
    return sharedEntry;
  }
  if (request.startsWith('@/')) {
    const candidate = path.join(webSrcDir, request.slice(2));
    if (fs.existsSync(candidate + '.ts')) return candidate + '.ts';
    if (fs.existsSync(candidate + '.tsx')) return candidate + '.tsx';
    if (fs.existsSync(path.join(candidate, 'index.ts'))) {
      return path.join(candidate, 'index.ts');
    }
  }
  if (
    (request.startsWith('./') || request.startsWith('../')) &&
    parent &&
    parent.filename
  ) {
    const baseDir = path.dirname(parent.filename);
    const resolved = path.resolve(baseDir, request);
    if (fs.existsSync(resolved + '.ts')) return resolved + '.ts';
    if (fs.existsSync(resolved + '.tsx')) return resolved + '.tsx';
    if (fs.existsSync(path.join(resolved, 'index.ts'))) {
      return path.join(resolved, 'index.ts');
    }
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

function compileTs(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      resolveJsonModule: true,
      strict: true,
    },
  });
  module._compile(outputText, filename);
}

Module._extensions['.ts'] = compileTs;
Module._extensions['.tsx'] = compileTs;

const testFile = path.resolve(
  __dirname,
  '../src/store/__tests__/chatStoreAndRules.test.ts'
);
const { runChatUnitTests } = require(testFile);
const result = runChatUnitTests();
for (const line of result.details) {
  process.stdout.write(line + '\n');
}
process.stdout.write(
  `\nUnit Tests Summary: ${result.passed} passed, ${result.failed} failed.\n`
);
if (result.failed > 0) {
  process.exit(1);
}

