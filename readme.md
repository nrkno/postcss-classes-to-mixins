# postcss-classes-to-mixins [![Build Status][ci-img]][ci]

> [PostCSS] plugin to intelligently convert CSS classes to SASS, Less and Stylus mixins.

## Installation

```
npm install @nrk/postcss-classes-to-mixins
```

## Example

Input: 

```css
/* style.css */
.red-btn {
    background: red;
    color: white;
}
```

Output:
```sass
/* style.scss */
@mixin red-btn() {
    background: red;
    color: white;
}
```

## Usage

```js
import postcss from 'postcss'
import classesToMixins from 'postcss-classes-to-mixins'

postcss([  
  classesToMixins({     // Object: options
    scss: 'style.scss', // String: sass output
    less: 'style.less'  // String: less output
    styl: 'style.styl', // String: stylus output
  })
]).process('style.css')
```

This will write the output to the file paths specified.

See [PostCSS] docs for examples for your environment.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/nrkno/postcss-classes-to-mixins.svg
[ci]:      https://travis-ci.org/nrkno/postcss-classes-to-mixins

