import noComments from './no-comments.js'
import noUseEffect from './no-use-effect.js'
import oneComponentPerFile from './one-component-per-file.js'
import oneFunctionPerFile from './one-function-per-file.js'

export default {
  meta: { name: 'taste' },
  rules: {
    'no-comments': noComments,
    'no-use-effect': noUseEffect,
    'one-component-per-file': oneComponentPerFile,
    'one-function-per-file': oneFunctionPerFile,
  },
}
