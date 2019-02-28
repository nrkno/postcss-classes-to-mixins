# postcss-classes-to-mixins [![Build Status][ci-img]][ci]

> [PostCSS] plugin to intelligently convert CSS classes to SASS, Less and Stylus mixins.

## Installation

```
npm install postcss-classes-to-mixins
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
```scss
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
    less: 'style.less',  // String: less output
    styl: 'style.styl' // String: stylus output
  })
]).process('style.css')
.then((done) => console.log('done!'))
```

This will write the output to the file paths specified.
See [PostCSS] docs for examples for your environment.

Now, import the exported stylesheet and start using the mixins:

```scss
/* my.scss */
@import 'style.scss'

.red-green-btn {
  @include red-button;
  color: green;
}
```



## Why?

When sharing CSS between projects you often want to distribute it so people can consume it in Sass, Less and Stylus.
This can be tricky without maintaining separate versions of the code written in each of these languages. Also,
when loading different versions of the same stylesheet globally (by widgets on the same page) name space collisions
will eventually occur, resulting in styling errors.

This plugin will solve that:

- Versioning: Class names from the exported CSS are no longer global and won't collide with each other.
Instead they are built into your own classes by extending them. This also makes your HTML more clean, as you don't need to use several
classes (`class="standard-btn red-btn my-btn"`) to style one thing.

- Three shaking: Using mixins you only include the styles that you actually use in your project, which is nice
for load. Loading the entire stylesheet globally (several times for each widget) is wasteful and not nice.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/nrkno/postcss-classes-to-mixins.svg
[ci]:      https://travis-ci.org/nrkno/postcss-classes-to-mixins

