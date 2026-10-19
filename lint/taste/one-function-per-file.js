import { topLevelFunctions } from './top-level-functions.js'
import { unwrapExport } from './unwrap-export.js'

const TEST_FILE = /\.(test|spec)\.[cm]?[jt]sx?$|\/test\/|__tests__/

const hasSharedState = (program) =>
  program.body
    .map(unwrapExport)
    .some((statement) => statement.type === 'ClassDeclaration' || (statement.type === 'VariableDeclaration' && statement.kind === 'let'))

export default {
  create(context) {
    if (TEST_FILE.test(context.filename)) return {}

    return {
      Program(program) {
        const big = topLevelFunctions(program, context.sourceCode).filter((fn) => fn.lines > 5)

        if (big.length < 2 || hasSharedState(program)) return

        context.report({
          node: big[1].node,
          message: `rule 9 (docs/code-taste.md): one file, one thing. ${big.map((fn) => fn.name).join(', ')} are each over 5 lines; make the file a directory module, one function per file`,
        })
      },
    }
  },
}
