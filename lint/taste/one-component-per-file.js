import { topLevelFunctions } from './top-level-functions.js'

const COMPONENT_FILE = /\.[jt]sx$/

export default {
  create(context) {
    if (!COMPONENT_FILE.test(context.filename)) return {}

    return {
      Program(program) {
        const components = topLevelFunctions(program, context.sourceCode).filter((fn) => /^[A-Z]/.test(fn.name))

        if (components.length < 2) return

        context.report({
          node: components[1].node,
          message: `rule 10 (docs/code-taste.md): one component per file. Move ${components[1].name} to its own file`,
        })
      },
    }
  },
}
