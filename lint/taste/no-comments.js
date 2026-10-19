const TOOL_DIRECTIVE = /^\/\/\/?\s*(<reference|@ts-|#region|#endregion)|^\/\*\s*@vite/
const LINK_ONLY = /^\/\/\s*https?:\/\/\S+\s*$/
const MESSAGE = 'rule 1 (docs/code-taste.md): no comments. Say it with a name, a function or a file; only a one-line external URL may stay'

const sourceOf = (comment) => (comment.type === 'Line' ? `//${comment.value}` : `/*${comment.value}*/`)

export default {
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const text = sourceOf(comment).trim()

          if (!TOOL_DIRECTIVE.test(text) && !LINK_ONLY.test(text)) context.report({ node: comment, message: MESSAGE })
        }
      },
    }
  },
}
