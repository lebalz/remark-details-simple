const remark = require('remark');
const html = require('remark-html');
const remarkDetails = require('../lib/index')

remark()
    .use(html)
    .use(remarkDetails, {
        tags: ['details', 'solution'],
        marker: ':::',
        classNameMap: { details: 'alert', solution: ['alert', 'success'] }
    })
    .process(`
:::details Hello
Foo Bar
:::

:::solution Solution
It's a miracle
:::
    `).then((val) => console.log(val))

