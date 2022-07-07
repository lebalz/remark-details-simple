const remark = require('remark');
const html = require('remark-html');
const remarkDetails = require('../lib/index')

remark()
    .use(html)
    .use(remarkDetails)
    .process(`
:::details Hello
Foo Bar
:::

:::solution Solution
It's a miracle
:::
    `).then((val) => console.log(val))

