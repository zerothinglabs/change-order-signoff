const MESSAGE = 'rule 6 (docs/code-taste.md): no useEffect. Use a ref callback with cleanup, a loader or an event handler'

export default {
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee.type === 'MemberExpression' ? node.callee.property : node.callee

        if (callee.type === 'Identifier' && callee.name === 'useEffect') context.report({ node, message: MESSAGE })
      },
    }
  },
}
