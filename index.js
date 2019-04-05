const postcss = require('postcss')
const util = require('util')
const fs = require('fs')

const writeFile = util.promisify(fs.writeFile)

module.exports = postcss.plugin('postcss-classes-to-mixins', (opts = {}) => {
  return (root, result) => {
    const cssArray = postcssToArray(root)
    const targets = ['scss', 'less', 'styl']

    return Promise.all(targets
      .filter((ext) => typeof opts[ext] === 'string')
      .map((ext) => writeFile(opts[ext], toString(nestRules({
        rules: cssArray,
        target: ext,
        mixinsOnly: opts.mixinsOnly
      }))))
    )
  }
})

function postcssToArray (root) {
  const rules = []

  root.nodes.forEach((node) => {
    if (node.type === 'atrule' && node.name === 'font-face') {
      const style = node.nodes.reduce((acc, { prop, value }) => acc.concat([[prop, value]]), [])
      rules.push([`@${node.name}`, style])
    }
    else if (node.type === 'atrule') rules.push([`@${node.name} ${node.params}`, postcssToArray(node)])
    else if (node.type === 'rule') {
      const style = node.nodes.reduce((acc, { prop, value, important }) => {
        return acc.concat(prop ? [[prop, `${value}${important ? '!important' : ''}`]] : [])
      }, [])
      node.selector.split(',').forEach((selector) => {
        rules.push([selector.trim(), style])
      })
    }
  })

  return rules
}

function nestRules ({rules, target, nested = [], mediaQuery = false, mixinsOnly = false}) {
  rules.forEach(([selector, rule]) => {
    const isAtRule = selector.match(/@(media|supports)/)
    const className = selector.match(/\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*/)
    let ruleset = rule

    if (isAtRule) nestRules({rules: rule, mediaQuery: selector, target, nested, mixinsOnly})
    else if (className) {
      let mixin = className[0].slice(1)
      switch (target) {
        case 'styl': mixin = `${mixin}()`; break
        case 'less': mixin = `.${mixin}()`; break
        case 'scss': mixin = `@mixin ${mixin}`; break
      }
      const parent = nested.filter(([m]) => m === mixin)[0] || nested[nested.push([mixin, []]) - 1]
      const prefix = selector.slice(0, className.index)
      const suffix = selector.slice(className.index + className[0].length).replace(className[0], '&')

      if (prefix) {
        if (target !== 'scss') ruleset = [[`${prefix}&${suffix}`, rule]]
        else ruleset = [[`@at-root ${prefix}#{&}${suffix.replace('&', '#{&}')}`, rule]]
      } else if (suffix) {
        ruleset = [[`&${suffix}`, rule]]
      }

      // Include keyframes
      rule.forEach(([name, props]) => {
        if (name.indexOf('animation') === 0) {
          const keyName = `@keyframes ${props.match(/\b[\w-]+\b/)}`
          const keyRule = rules.filter(([name]) => name === keyName)[0]
          if (keyRule) ruleset.push(keyRule)
        }
      })

      if (mediaQuery) ruleset = [[mediaQuery, ruleset]]
      parent[1].push(...ruleset)
    } else if (!mixinsOnly) {
      if (mediaQuery) ruleset = [[mediaQuery, ruleset]]
      nested.push([selector, ruleset])
    }
  })

  return nested
}

function toString (rules, pad = '') {
  return rules.map(([key, val]) => {
    if (typeof val === 'string') return `${pad}${key}: ${val};\n`
    return `${pad}${key} {\n${toString(val, pad + '  ')}${pad}}\n`
  }).join('')
}

// If ever needed to use without postcss, this also works:
// const { JSDOM } = require('jsdom')
// const dom = new JSDOM(`<style>${fs.readFileSync('./lib/core-css.css')}</style>`)
// const css = dom.window.document.styleSheets[0]
// // Returns array of [[selector, props], ...] to support multiple equal selectors and consistent order
// function cssToArray (root) {
//   const rules = []
//
//   Array.from(root.cssRules).forEach((rule) => {
//     const type = rule.constructor.name.replace(/^CSS|Rule$/g, '').toLowerCase()
//
//     if (type === 'media') rules.push([`@media ${Array.from(rule.media).join(',')}`, cssToArray(rule)])
//     else if (type === 'supports') rules.push([`@supports ${rule.conditionText}`, cssToArray(rule)])
//     else if (type === 'keyframes') rules.push([`@keyframes ${rule.name}`, cssToArray(rule)])
//     else if (type === 'style' || type === 'keyframe') {
//       const selector = rule.selectorText || rule.keyText
//       const style = Array.from(rule.style).map((prop) => {
//         const priority = rule.style.getPropertyPriority(prop).replace(/./, '!$&')
//         return [prop, `${rule.style.getPropertyValue(prop)}${priority}`]
//       })
//       selector.split(',').forEach((selector) => {
//         rules.push([selector.trim(), style])
//       })
//     }
//   })
//
//   return rules
// }
