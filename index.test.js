/* global describe, test, expect */

import postcss from 'postcss'
import fs from 'fs'
import util from 'util'
import classesToMixins from './'

fs.readFile = util.promisify(fs.readFile)

describe('postcss-classes-to-mixins', () => {
  test('scss mixin from simple class selector', () => {
    return postcss([classesToMixins({ scss: '/tmp/postcss-ctm-out.scss' })])
      .process(`.foo { bar: baz; }`, { from: undefined }).then((result) => {
        return fs.readFile('/tmp/postcss-ctm-out.scss').then((scss) => {
          scss = scss.toString().replace(/\s+/g, ' ')
          expect(scss).toBe(`@mixin foo { bar: baz; } `)
        })
      })
  })

  test('less mixin from simple class selector', () => {
    return postcss([classesToMixins({ less: '/tmp/postcss-ctm-out.less' })])
      .process(`.foo { bar: baz; }`, { from: undefined }).then((result) => {
        return fs.readFile('/tmp/postcss-ctm-out.less').then((less) => {
          less = less.toString().replace(/\s+/g, ' ')
          expect(less).toBe(`.foo() { bar: baz; } `)
        })
      })
  })

  test('stylus mixin from simple class selector', () => {
    return postcss([classesToMixins({ styl: '/tmp/postcss-ctm-out.styl' })])
      .process(`.foo { bar: baz; }`, { from: undefined }).then((result) => {
        return fs.readFile('/tmp/postcss-ctm-out.styl').then((styl) => {
          styl = styl.toString().replace(/\s+/g, ' ')
          expect(styl).toBe(`foo() { bar: baz; } `)
        })
      })
  })

  test('scss mixin from complex class selector', () => {
    return postcss([classesToMixins({ scss: '/tmp/postcss-ctm-out.scss' })])
      .process(`tag.class[attribute="value"]:pseudo(:selector) { prop: value; }`, { from: undefined }).then((result) => {
        return fs.readFile('/tmp/postcss-ctm-out.scss').then((scss) => {
          scss = scss.toString().replace(/\s+/g, ' ')
          expect(scss).toBe(`@mixin class { @at-root tag#{&}[attribute="value"]:pseudo(:selector) { prop: value; } } `)
        })
      })
  })

  test('less mixin from complex class selector', () => {
    return postcss([classesToMixins({ less: '/tmp/postcss-ctm-out.less' })])
      .process(`tag.class[attribute="value"]:pseudo(:selector) { prop: value; }`, { from: undefined }).then((result) => {
        return fs.readFile('/tmp/postcss-ctm-out.less').then((less) => {
          less = less.toString().replace(/\s+/g, ' ')
          expect(less).toBe(`.class() { tag&[attribute="value"]:pseudo(:selector) { prop: value; } } `)
        })
      })
  })

  test('styl mixin from complex class selector', () => {
    return postcss([classesToMixins({ styl: '/tmp/postcss-ctm-out.styl' })])
      .process(`tag.class[attribute="value"]:pseudo(:selector) { prop: value; }`, { from: undefined }).then((result) => {
        return fs.readFile('/tmp/postcss-ctm-out.styl').then((styl) => {
          styl = styl.toString().replace(/\s+/g, ' ')
          expect(styl).toBe(`class() { tag&[attribute="value"]:pseudo(:selector) { prop: value; } } `)
        })
      })
  })
})
