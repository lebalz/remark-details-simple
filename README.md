# remark-details-simple

Built for docusaurus v2 s.t. it can be required (docusaurus is not yet ESM ready...).

## Syntax

```md
:::details Click for the Details
It's sunny and i like it
:::
```

## AST (see [mdast](https://github.com/syntax-tree/mdast/blob/master/readme.md) specification)

For example, the following markdown:

```
:::details Click for the Details
It's sunny and i like it
:::
```

Yields:

```js
{
    type: 'detailsWrapper',
    data: {
        hName: 'div',
        hProperties: {
            className: 'details'
        }
    },
    children:  [
        {
            type: 'details',
            data: {
                hName: 'details'
            },
            children: [
                {
                    type: 'summary',
                    data: {
                        hName: 'summary',
                    },
                    children:  [{
                        type: 'text',
                        value: 'Click for the Details'
                    }]
                },
                {
                    type: 'text',
                    value: 'It\'s sunny and i like it'
                }
            ]
        }]
}
```

## Rehype

This plugin is compatible with [rehype][https://github.com/rehypejs/rehype]. `deflist` mdast nodes will become

```html
<div className="details">
    <details>
        <summary>Click for the Details</summary>
        <p>
            It's sunny and i like it
        </p>
    </details>
</div>
```

## Installation

```bash
yarn add remark-details-simple
```

## Usage

Dependencies:

```javascript
const unified = require('unified')
const remarkParse = require('remark-parse')
const stringify = require('rehype-stringify')
const remark2rehype = require('remark-rehype')

const remarkDetails = require('remark-details-simple')
```

Usage:

```javascript
unified()
  .use(remarkParse)
  .use(remarkDetails, {
    tags: ['details', 'solution'], 
    marker: ':::', 
    classNameMap: {details: 'info', solution: 'green'}
    })
  .use(remark2rehype)
  .use(stringify)
```
## Options

- `tags`: a list of tags to use, default: `['details']`  
- `marker`: the marker in front of a tag, default: `:::`
- `classNameMap`: a map containing the class names per tag for the wrapper div. default: `{details: 'details'}`


Usage:

```javascript
unified()
  .use(remarkParse)
  .use(remarkDetails, {
    tags: ['details', 'solution'], 
    marker: ':::', 
    classNameMap: {details: 'alert', solution: ['alert', 'success']}
    })
  .use(remark2rehype)
  .use(stringify)
  .process(`
:::details Hello
Foo Bar
:::

:::solution Solution
It's a miracle
:::
  `)
```

will produce

```html
<div class="alert">
    <details>
        <summary>Hello</summary>
        <p>
            Foo Bar
        </p>
    </details>
</div>
<div class="alert success">
    <details>
        <summary>Solution</summary>
        <p>
            It's a miracle
        </p>
    </details>
</div>
```