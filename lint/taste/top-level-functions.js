import { unwrapExport } from './unwrap-export.js'

const MEMO = /memo|forwardRef/

const isFunction = (node) => node?.type === 'ArrowFunctionExpression' || node?.type === 'FunctionExpression'

const unwrapMemo = (init, sourceCode) =>
  init?.type === 'CallExpression' && MEMO.test(sourceCode.getText(init.callee)) && isFunction(init.arguments[0])
    ? init.arguments[0]
    : init

export function topLevelFunctions(program, sourceCode) {
  const lineCount = (node) => sourceCode.getText(node).split('\n').length

  return program.body.map(unwrapExport).flatMap((statement) => {
    if (statement.type === 'FunctionDeclaration' && statement.body) {
      return [{ name: statement.id?.name ?? 'default', lines: lineCount(statement), node: statement }]
    }

    if (statement.type !== 'VariableDeclaration') return []

    return statement.declarations
      .filter((declaration) => isFunction(unwrapMemo(declaration.init, sourceCode)))
      .map((declaration) => ({ name: sourceCode.getText(declaration.id), lines: lineCount(declaration), node: declaration }))
  })
}
