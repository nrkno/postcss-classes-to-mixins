/* global describe, test, expect, beforeEach */

const postcss = require('postcss')
const rimraf = require('rimraf')
const util = require('util')
const fs = require('fs')
const classesToMixins = require('./index.js')
const readFile = util.promisify(fs.readFile)

beforeEach((done) => rimraf('/tmp/postcss-ctm*', done))

describe('postcss-classes-to-mixins', () => {
  test('files are written', () => {
    return postcss([classesToMixins({
      scss: '/tmp/postcss-ctm.scss',
      less: '/tmp/postcss-ctm.less',
      styl: '/tmp/postcss-ctm.styl'
    })])
      .process(``, { from: undefined }).then((_) => {
        expect(fs.existsSync('/tmp/postcss-ctm.scss')).toEqual(true)
        expect(fs.existsSync('/tmp/postcss-ctm.less')).toEqual(true)
        expect(fs.existsSync('/tmp/postcss-ctm.styl')).toEqual(true)
      })
  })

  test('@font-face is kept', () => {
    return postcss([classesToMixins({ scss: '/tmp/postcss-ctm-font.scss' })])
      .process(`@font-face { font-weight: 300; src: url('test.woff') }`, { from: undefined }).then((result) => {
        return readFile('/tmp/postcss-ctm-font.scss').then((scss) => {
          scss = scss.toString().replace(/\s+/g, ' ')
          expect(scss).toBe(`@font-face { font-weight: 300; src: url('test.woff'); } `)
        })
      })
  })

  test('scss mixin from simple class selector', () => {
    return postcss([classesToMixins({ scss: '/tmp/postcss-ctm-simple.scss' })])
      .process(`.foo { bar: baz; }`, { from: undefined }).then((result) => {
        return readFile('/tmp/postcss-ctm-simple.scss').then((scss) => {
          scss = scss.toString().replace(/\s+/g, ' ')
          expect(scss).toBe(`@mixin foo { bar: baz; } `)
        })
      })
  })

  test('less mixin from simple class selector', () => {
    return postcss([classesToMixins({ less: '/tmp/postcss-ctm-simple.less' })])
      .process(`.foo { bar: baz; }`, { from: undefined }).then((result) => {
        return readFile('/tmp/postcss-ctm-simple.less').then((less) => {
          less = less.toString().replace(/\s+/g, ' ')
          expect(less).toBe(`.foo() { bar: baz; } `)
        })
      })
  })

  test('stylus mixin from simple class selector', () => {
    return postcss([classesToMixins({ styl: '/tmp/postcss-ctm-simple.styl' })])
      .process(`.foo { bar: baz; }`, { from: undefined }).then((result) => {
        return readFile('/tmp/postcss-ctm-simple.styl').then((styl) => {
          styl = styl.toString().replace(/\s+/g, ' ')
          expect(styl).toBe(`foo() { bar: baz; } `)
        })
      })
  })

  test('scss mixin from complex class selector', () => {
    return postcss([classesToMixins({ scss: '/tmp/postcss-ctm-complex.scss' })])
      .process(`tag.class[attribute="value"]:pseudo(:selector) { prop: value; }`, { from: undefined }).then((result) => {
        return readFile('/tmp/postcss-ctm-complex.scss').then((scss) => {
          scss = scss.toString().replace(/\s+/g, ' ')
          expect(scss).toBe(`@mixin class { @at-root tag#{&}[attribute="value"]:pseudo(:selector) { prop: value; } } `)
        })
      })
  })

  test('less mixin from complex class selector', () => {
    return postcss([classesToMixins({ less: '/tmp/postcss-ctm-complex.less' })])
      .process(`tag.class[attribute="value"]:pseudo(:selector) { prop: value; }`, { from: undefined }).then((result) => {
        return readFile('/tmp/postcss-ctm-complex.less').then((less) => {
          less = less.toString().replace(/\s+/g, ' ')
          expect(less).toBe(`.class() { tag&[attribute="value"]:pseudo(:selector) { prop: value; } } `)
        })
      })
  })

  test('styl mixin from complex class selector', () => {
    return postcss([classesToMixins({ styl: '/tmp/postcss-ctm-complex.styl' })])
      .process(`tag.class[attribute="value"]:pseudo(:selector) { prop: value; }`, { from: undefined }).then((result) => {
        return readFile('/tmp/postcss-ctm-complex.styl').then((styl) => {
          styl = styl.toString().replace(/\s+/g, ' ')
          expect(styl).toBe(`class() { tag&[attribute="value"]:pseudo(:selector) { prop: value; } } `)
        })
      })
  })
})
