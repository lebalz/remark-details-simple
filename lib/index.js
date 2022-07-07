const visit = require("unist-util-visit");

const NEWLINE = "\n";

// escape regex special characters
function escapeRegExp(s) {
    return s.replace(new RegExp(`[-[\\]{}()*+?.\\\\^$|/]`, "g"), "\\$&");
}


// passed to unified.use()
// you have to use a named function for access to `this` :(
function attacher(options) {
    options = options ?? {}
    const tags = options.tags ?? ['details'];
    const marker = options.marker ?? ':::';
    const classNameMap = options.classNameMap ?? { details: ['details'] }

    const regex = new RegExp(`${escapeRegExp(marker)}(${tags.map(escapeRegExp).join('|')})(?: *(.*))?\n`);
    const escapeTag = new RegExp(escapeRegExp(`\\${marker}`), "g");
    const openingTag = new RegExp(`^${escapeRegExp(marker)}\\s*\\S+`);
    const closingTag = new RegExp(`^${escapeRegExp(marker)}\\s*$`);

    // the tokenizer is called on blocks to determine if there is a details block present 
    function blockTokenizer(eat, value, silent) {
        // stop if no match or match does not start at beginning of line
        const match = regex.exec(value);
        if (!match || match.index !== 0) {
            return false;
        }
        // if silent return the match
        if (silent) {
            return true;
        } 

        const now = eat.now();
        const [opening, tag, summary] = match;
        console.log(opening, tag, summary);
        const food = [];
        const content = [];

        // consume lines until a closing tag
        let idx = 0;
        let level = 0;
        while ((idx = value.indexOf(NEWLINE)) !== -1) {
            // grab this line and eat it
            const next = value.indexOf(NEWLINE, idx + 1);
            const line =
                (next !== -1) ? value.slice(idx + 1, next) : value.slice(idx + 1);
            food.push(line);
            value = value.slice(idx + 1);

            // keep track of nested opening tags
            if (openingTag.test(line)) {
                level += 1;
            }
            if (closingTag.test(line)) {
                if (level === 0) {
                    // the closing tag is NOT part of the content
                    break;
                }
                // a nested block was closed
                level -= 1;
            }
            content.push(line);
        }

        const childNodes = this.tokenizeBlock(content.join(NEWLINE).replace(escapeTag, marker), now);
        const node = {
            type: 'detailsWrapper',
            data: {
                hName: 'div',
                hProperties: {
                    className: classNameMap[tag] ?? undefined
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
                            children:  this.tokenizeInline(summary || tag[0].toUpperCase() + tag.slice(1), { line: 0, column: 0 })
                        },
                        ...childNodes
                    ]
                }]
        };

        const add = eat(opening + food.join(NEWLINE));

        // parse the content in block mode
        const exit = this.enterBlock();
        exit();

        return add(node);
    }

    // add tokenizer to parser after fenced code blocks
    const Parser = this.Parser.prototype;
    Parser.blockTokenizers.details = blockTokenizer;
    Parser.blockMethods.splice(
        Parser.blockMethods.indexOf("fencedCode") + 1,
        0,
        "details"
    );
    Parser.interruptParagraph.splice(
        Parser.interruptParagraph.indexOf("fencedCode") + 1,
        0,
        ["details"]
    );
    Parser.interruptList.splice(
        Parser.interruptList.indexOf("fencedCode") + 1,
        0,
        ["details"]
    );
    Parser.interruptBlockquote.splice(
        Parser.interruptBlockquote.indexOf("fencedCode") + 1,
        0,
        ["details"]
    );

    // TODO: add compiler rules for converting back to markdown

    return function transformer(tree) {
        // escape everything except flexHTML nodes
        visit(
            tree,
            node => {
                return node.type !== "details";
            },
            function visitor(node) {
                if (node.value) {
                    node.value = node.value.replace(escapeTag, marker)
                }
                return node;
            }
        );
    };
}

module.exports = attacher;