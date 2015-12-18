window.parsed = false;

/**
 * Compiler
 */

;(function() {

    /**
     * Block-Level Grammar
     */

    var block = {
        newline: /^\n+/,
        comment: /^\/\*.*?\*\/(?=.|$)/,
        code: /^( {4}[^\n]+\n*)+/,
        fences: noop,
        hr: /^( *[-*_]){3,} *(?:\n+|$)/,
        obj: /^\{[a-zA-Z\-]+\{.*?}.*?(?:}(\n+|$))}/,
        heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
        nptable: noop,
        lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
        blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
        list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
        html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
        table: noop,
        paragraph: /^((?:[^\n]+\n?(?!hr|menu|heading|lheading|blockquote|tag|def))+)\n*/,
        text: /^[^\n]+/
    };

    /**
     * Heading Counter
     */

    var counter = {
        "1" : 0,
        "2" : 0,
        "3" : 0,
        "4" : 0,
        "5" : 0,
        "6" : 0
    };

    window.changePage = function(name) {
        if (name) {
            var tag = '#' + name.toLowerCase().replace(/%20| /g, '-').replace(/%22|[^a-z\d\-]]/g, '');
            if ($('body').hasClass('onepage')) {
                window.location.hash = tag;
            } else {
                var query = $(tag);
                if (query.length) {
                    query.css("display", "block");
                    query.siblings('.section').css("display", "none");
                    query = query.siblings('nav').first().find('.link-container a');
                    query.css('color', '');
                    for (var i=0; i<query.length; i++) {
                        if (query[i].innerHTML.toLowerCase()
                                .replace(/ /g, '-').replace(/[^a-z\d\-]/g, '')
                            === tag.substring(1)) {
                            $(query[i]).css('color', '#2c8fdb');
                            break;
                        }
                    }
                    //window.location.hash = tag;
                }
            }
        }
    };

    /**
     * Object values
     */

    function toObject(object, args, content) {
        try {
            var x = {
                "menu": [
                    '<nav>',
                    '<span class="link-container"><a onclick="changePage(\'||p||\');">',
                    content,
                    '</a></span>',
                    '<span class="separator"></span>',
                    '</nav>'
                ],
                "icon":[
                    '<i class="fa fa-', '', [args[0]], '', '', '"></i>'
                ],
                "header":[
                    '<h'+args[0]+'>', '', content, '', '', '</h'+args[0]+'>'
                ],
                "tagline":[
                    '<span class="tagline'
                    +(content[0]?(content[0].split(" ").length+2<6?content[0].split(" ").length+2:6):'')
                    +'">',
                    '',
                    content,
                    '',
                    '',
                    '</span>'
                ],
                "underline":[
                    '<span style="text-decoration:underline">', '', content, '', '', '</span>'
                ],
                "color":[
                    '<span style="color:' + args[0] + '">', '', content, '', '', '</span>'
                ],
                "comment":[
                    '', '', [], '', '', ''
                ],
                "vspace":[
                    '<div style="margin-bottom:'+args[0], '', content, '', '', '"></div>'
                ],
                "hspace":[
                    '<span style="margin-left:'+args[0], '', content, '', '', '"></span>'
                ],
                "escape":[
                    '', '', content, '', '', ''
                ]}[object];
        } catch (e) {
            console.log("----------");
            console.log(arguments);
            console.log(x);
            throw new Error("Incorrect number of arguments in " + object);
        }
        console.log("----------");
        console.log(arguments);
        console.log(x);
        return loop(x[0],x[1],x[2],x[3],x[4],x[5],x[6]);
    }

    block.bullet = /(?:[*+-]|\d+\.)/;
    block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
    block.item = replace(block.item, 'gm')
    (/bull/g, block.bullet)
    ();

    block.list = replace(block.list)
    (/bull/g, block.bullet)
    ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
    ('def', '\\n+(?=' + block.def.source + ')')
    ();

    block.blockquote = replace(block.blockquote)
    ('def', block.def)
    ();

    block._tag = '(?!(?:'
        + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
        + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
        + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

    block.html = replace(block.html)
    ('comment', /<!--[\s\S]*?-->/)
    ('closed', /<(tag)[\s\S]+?<\/\1>/)
    ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
    (/tag/g, block._tag)
    ();

    block.paragraph = replace(block.paragraph)
    ('hr', block.hr)
    ('heading', block.heading)
    ('lheading', block.lheading)
    ('blockquote', block.blockquote)
    ('tag', '<' + block._tag)
    ('def', block.def)
    ();

    /**
     * Normal Block Grammar
     */

    block.normal = merge({}, block);

    /**
     * GFM Block Grammar
     */

    block.gfm = merge({}, block.normal, {
        fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
        paragraph: /^/,
        heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
    });

    block.gfm.paragraph = replace(block.paragraph)
    ('(?!', '(?!'
        + block.gfm.fences.source.replace('\\1', '\\2') + '|'
        + block.list.source.replace('\\1', '\\3') + '|')
    ();

    /**
     * GFM + Tables Block Grammar
     */

    block.tables = merge({}, block.gfm, {
        nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
        table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
    });

    /**
     * Block Lexer
     */

    function Lexer(options) {
        this.tokens = [];
        this.tokens.links = {};
        this.options = options || marked.defaults;
        this.rules = block.normal;

        if (this.options.gfm) {
            if (this.options.tables) {
                this.rules = block.tables;
            } else {
                this.rules = block.gfm;
            }
        }
    }

    /**
     * Expose Block Rules
     */

    Lexer.rules = block;

    /**
     * Static Lex Method
     */

    Lexer.lex = function(src, options) {
        var lexer = new Lexer(options);
        return lexer.lex(src);
    };

    /**
     * Preprocessing
     */

    Lexer.prototype.lex = function(src) {
        src = src
            .replace(/\r\n|\r/g, '\n')
            .replace(/\t/g, '    ')
            .replace(/\u00a0/g, ' ')
            .replace(/\u2424/g, '\n');

        return this.token(src, true);
    };

    /**
     * Lexing
     */

    Lexer.prototype.token = function(src, top, bq) {
        var src = src.replace(/^ +$/gm, ''),
            next, loose, cap, bull, b, item, space, i, l;

        while (src) {
            // newline
            if (cap = this.rules.newline.exec(src)) {
                src = src.substring(cap[0].length);
                if (cap[0].length > 1) {
                    this.tokens.push({
                        type: 'space'
                    });
                }
            }

            // code
            if (cap = this.rules.code.exec(src)) {
                src = src.substring(cap[0].length);
                cap = cap[0].replace(/^ {4}/gm, '');
                this.tokens.push({
                    type: 'code',
                    text: !this.options.pedantic
                        ? cap.replace(/\n+$/, '')
                        : cap
                });
                continue;
            }

            // fences (gfm)
            if (cap = this.rules.fences.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'code',
                    lang: cap[2],
                    text: cap[3] || ''
                });
                continue;
            }

            // heading
            if (cap = this.rules.heading.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'heading',
                    depth: cap[1].length,
                    text: cap[2]
                });
                continue;
            }

            // table no leading pipe (gfm)
            if (top && (cap = this.rules.nptable.exec(src))) {
                src = src.substring(cap[0].length);

                item = {
                    type: 'table',
                    header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
                    align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
                    cells: cap[3].replace(/\n$/, '').split('\n')
                };

                for (i = 0; i < item.align.length; i++) {
                    if (/^ *-+: *$/.test(item.align[i])) {
                        item.align[i] = 'right';
                    } else if (/^ *:-+: *$/.test(item.align[i])) {
                        item.align[i] = 'center';
                    } else if (/^ *:-+ *$/.test(item.align[i])) {
                        item.align[i] = 'left';
                    } else {
                        item.align[i] = null;
                    }
                }

                for (i = 0; i < item.cells.length; i++) {
                    item.cells[i] = item.cells[i].split(/ *\| */);
                }

                this.tokens.push(item);

                continue;
            }

            // lheading
            if (cap = this.rules.lheading.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'heading',
                    depth: cap[2] === '=' ? 1 : 2,
                    text: cap[1]
                });
                continue;
            }

            // hr
            if (cap = this.rules.hr.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'hr'
                });
                continue;
            }

            // obj
            if (cap = this.rules.obj.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'obj'
                });
                continue;
            }

            // blockquote
            if (cap = this.rules.blockquote.exec(src)) {
                src = src.substring(cap[0].length);

                this.tokens.push({
                    type: 'blockquote_start'
                });

                cap = cap[0].replace(/^ *> ?/gm, '');

                // Pass `top` to keep the current
                // "toplevel" state. This is exactly
                // how markdown.pl works.
                this.token(cap, top, true);

                this.tokens.push({
                    type: 'blockquote_end'
                });

                continue;
            }

            // list
            if (cap = this.rules.list.exec(src)) {
                src = src.substring(cap[0].length);
                bull = cap[2];

                this.tokens.push({
                    type: 'list_start',
                    ordered: bull.length > 1
                });

                // Get each top-level item.
                cap = cap[0].match(this.rules.item);

                next = false;
                l = cap.length;
                i = 0;

                for (; i < l; i++) {
                    item = cap[i];

                    // Remove the list item's bullet
                    // so it is seen as the next token.
                    space = item.length;
                    item = item.replace(/^ *([*+-]|\d+\.) +/, '');

                    // Outdent whatever the
                    // list item contains. Hacky.
                    if (~item.indexOf('\n ')) {
                        space -= item.length;
                        item = !this.options.pedantic
                            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
                            : item.replace(/^ {1,4}/gm, '');
                    }

                    // Determine whether the next list item belongs here.
                    // Backpedal if it does not belong in this list.
                    if (this.options.smartLists && i !== l - 1) {
                        b = block.bullet.exec(cap[i + 1])[0];
                        if (bull !== b && !(bull.length > 1 && b.length > 1)) {
                            src = cap.slice(i + 1).join('\n') + src;
                            i = l - 1;
                        }
                    }

                    // Determine whether item is loose or not.
                    // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
                    // for discount behavior.
                    loose = next || /\n\n(?!\s*$)/.test(item);
                    if (i !== l - 1) {
                        next = item.charAt(item.length - 1) === '\n';
                        if (!loose) loose = next;
                    }

                    this.tokens.push({
                        type: loose
                            ? 'loose_item_start'
                            : 'list_item_start'
                    });

                    // Recurse.
                    this.token(item, false, bq);

                    this.tokens.push({
                        type: 'list_item_end'
                    });
                }

                this.tokens.push({
                    type: 'list_end'
                });

                continue;
            }

            // html
            if (cap = this.rules.html.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: this.options.sanitize
                        ? 'paragraph'
                        : 'html',
                    pre: !this.options.sanitizer
                    && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
                    text: cap[0]
                });
                continue;
            }

            // def
            if ((!bq && top) && (cap = this.rules.def.exec(src))) {
                src = src.substring(cap[0].length);
                this.tokens.links[cap[1].toLowerCase()] = {
                    href: cap[2],
                    title: cap[3]
                };
                continue;
            }

            // table (gfm)
            if (top && (cap = this.rules.table.exec(src))) {
                src = src.substring(cap[0].length);

                item = {
                    type: 'table',
                    header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
                    align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
                    cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
                };

                for (i = 0; i < item.align.length; i++) {
                    if (/^ *-+: *$/.test(item.align[i])) {
                        item.align[i] = 'right';
                    } else if (/^ *:-+: *$/.test(item.align[i])) {
                        item.align[i] = 'center';
                    } else if (/^ *:-+ *$/.test(item.align[i])) {
                        item.align[i] = 'left';
                    } else {
                        item.align[i] = null;
                    }
                }

                for (i = 0; i < item.cells.length; i++) {
                    item.cells[i] = item.cells[i]
                        .replace(/^ *\| *| *\| *$/g, '')
                        .split(/ *\| */);
                }

                this.tokens.push(item);

                continue;
            }

            // top-level paragraph
            if (top && (cap = this.rules.paragraph.exec(src))) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'paragraph',
                    text: cap[1].charAt(cap[1].length - 1) === '\n'
                        ? cap[1].slice(0, -1)
                        : cap[1]
                });
                continue;
            }

            // text
            if (cap = this.rules.text.exec(src)) {
                // Top-level should never reach here.
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'text',
                    text: cap[0]
                });
                continue;
            }

            if (src) {
                throw new
                    Error('Infinite loop on byte: ' + src.charCodeAt(0));
            }
        }

        return this.tokens;
    };

    /**
     * Inline-Level Grammar
     */

    var inline = {
        comment: /^\/\*.*?\*\/(?=.|$)/,
        obj: /^\{[a-zA-Z\-]+\{.*?}.*?(?=}[ \n]|}$)}/,
        escape: /^\\([\\`*{}\[\]()#+\-.!_>/])/,
        autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
        url: noop,
        tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
        link: /^!?\[(inside)\]\(href\)/,
        reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
        nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
        underline: /^\b_((?:[^_]|__)+?)_\b/,
        strong: /^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
        em: /^\/\/(.*?[^:])\/\//,
        code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
        br: /^ {2,}\n(?!\s*$)/,
        del: noop,
        text: /^[\s\S]+?(?=[@/\\<!\{\[_*`]| {2,}\n|$)/
    };

    inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
    inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

    inline.link = replace(inline.link)
    ('inside', inline._inside)
    ('href', inline._href)
    ();

    inline.reflink = replace(inline.reflink)
    ('inside', inline._inside)
    ();

    /**
     * Normal Inline Grammar
     */

    inline.normal = merge({}, inline);

    /**
     * Pedantic Inline Grammar
     */

    inline.pedantic = merge({}, inline.normal, {
        strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
        em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
    });

    /**
     * GFM Inline Grammar
     */

    inline.gfm = merge({}, inline.normal, {
        escape: replace(inline.escape)('])', '~|])')(),
        url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
        del: /^~~(?=\S)([\s\S]*?\S)~~/,
        text: replace(inline.text)
        (']|', '~]|')
        ('|', '|https?://|')
        ()
    });

    /**
     * GFM + Line Breaks Inline Grammar
     */

    inline.breaks = merge({}, inline.gfm, {
        br: replace(inline.br)('{2,}', '*')(),
        text: replace(inline.gfm.text)('{2,}', '*')()
    });

    /**
     * Inline Lexer & Compiler
     */

    function InlineLexer(links, options) {
        this.options = options || marked.defaults;
        this.links = links;
        this.rules = inline.normal;
        this.renderer = this.options.renderer || new Renderer;
        this.renderer.options = this.options;

        if (!this.links) {
            throw new
                Error('Tokens array requires a `links` property.');
        }

        if (this.options.gfm) {
            if (this.options.breaks) {
                this.rules = inline.breaks;
            } else {
                this.rules = inline.gfm;
            }
        } else if (this.options.pedantic) {
            this.rules = inline.pedantic;
        }
    }

    /**
     * Expose Inline Rules
     */

    InlineLexer.rules = inline;

    /**
     * Static Lexing/Compiling Method
     */

    InlineLexer.output = function(src, links, options) {
        var inline = new InlineLexer(links, options);
        return inline.output(src);
    };

    /**
     * Lexing/Compiling
     */

    InlineLexer.prototype.output = function(src) {
        var out = '', link, text, href, cap;

        while (src) {
            // escape
            if (cap = this.rules.escape.exec(src)) {
                src = src.substring(cap[0].length);
                out += cap[1];
                continue;
            }

            // comment
            if (cap = this.rules.comment.exec(src)) {
                src = src.substring(cap[0].length);
                continue;
            }

            // obj
            if (cap = this.rules.obj.exec(src)) {
                src = src.substring(cap[0].length);
                var name, args, content, firstArgIndex, lastArgIndex, count = 1, char, lastPunc = true, punc;
                name = cap[0].substring(1,cap[0].length-1)
                    .replace(/\\\\/g, '~!7!~').replace(/\\\{/g, '~!8!~').replace(/\\}/g, '~!9!~');
                firstArgIndex = name.indexOf('{');
                for (var i=1+firstArgIndex; i<name.length; i++) {
                    char = name.charAt(i);
                    if (char === '{') count++;
                    else if (char === '}') {
                        count--;
                        if (count < 1) {
                            lastArgIndex = i;
                            break;
                        }
                    }
                }

                content = '[' + name.substring(lastArgIndex+1)
                        .replace(/\{}/g, ',').replace(/\{/g, '[').replace(/}/g, ']') + ']';
                args = '[' + name.substring(firstArgIndex+1,lastArgIndex)
                        .replace(/\{}/g, ',').replace(/\{/g, '[').replace(/}/g, ']') + ']';
                name = name.substring(0,firstArgIndex);

                for (var i=1; i<args.length; i++) {
                    char = args.charAt(i);
                    punc = char === '[' || char === ']' || char === ',';
                    if (punc !== lastPunc) {
                        args = args.substring(0,i) + '"' + args.substring(i++);
                    }
                    lastPunc = punc;
                }
                for (var i=1; i<content.length; i++) {
                    char = content.charAt(i);
                    punc = char === '[' || char === ']' || char === ',';
                    if (punc !== lastPunc) {
                        content = content.substring(0,i) + '"' + content.substring(i++);
                    }
                    lastPunc = punc;
                }

                function unescape(arr) {
                    if (typeof arr === 'string') return arr.replace(/~!7!~/g, '\\')
                        .replace(/~!8!~/g, '{')
                        .replace(/~!9!~/g, '}');
                    for (var i=arr.length-1; i>=0; i--) {
                        arr[i] = typeof arr[i] === 'string' ? arr[i].replace(/~!7!~/g, '\\')
                            .replace(/~!8!~/g, '{')
                            .replace(/~!9!~/g, '}') : unescape(arr[i]);
                    }
                    return arr;
                }

                out += this.renderer.obj(name, unescape(JSON.parse(args)), unescape(JSON.parse(content)));
                continue;
            }

            // autolink
            if (cap = this.rules.autolink.exec(src)) {
                src = src.substring(cap[0].length);
                if (cap[2] === '@') {
                    text = cap[1].charAt(6) === ':'
                        ? this.mangle(cap[1].substring(7))
                        : this.mangle(cap[1]);
                    href = this.mangle('mailto:') + text;
                } else {
                    text = escape(cap[1]);
                    href = text;
                }
                out += this.renderer.link(href, null, text);
                continue;
            }

            // url (gfm)
            if (!this.inLink && (cap = this.rules.url.exec(src))) {
                src = src.substring(cap[0].length);
                text = escape(cap[1]);
                href = text;
                out += this.renderer.link(href, null, text);
                continue;
            }

            // tag
            if (cap = this.rules.tag.exec(src)) {
                if (!this.inLink && /^<a /i.test(cap[0])) {
                    this.inLink = true;
                } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
                    this.inLink = false;
                }
                src = src.substring(cap[0].length);
                out += this.options.sanitize
                    ? this.options.sanitizer
                    ? this.options.sanitizer(cap[0])
                    : escape(cap[0])
                    : cap[0]
                continue;
            }

            // link
            if (cap = this.rules.link.exec(src)) {
                src = src.substring(cap[0].length);
                this.inLink = true;
                out += this.outputLink(cap, {
                    href: cap[2],
                    title: cap[3]
                });
                this.inLink = false;
                continue;
            }

            // reflink, nolink
            if ((cap = this.rules.reflink.exec(src))
                || (cap = this.rules.nolink.exec(src))) {
                src = src.substring(cap[0].length);
                link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
                link = this.links[link.toLowerCase()];
                if (!link || !link.href) {
                    out += cap[0].charAt(0);
                    src = cap[0].substring(1) + src;
                    continue;
                }
                this.inLink = true;
                out += this.outputLink(cap, link);
                this.inLink = false;
                continue;
            }

            // strong
            if (cap = this.rules.strong.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.strong(this.output(cap[2] || cap[1]));
                continue;
            }

            // underline
            if (cap = this.rules.underline.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.underline(this.output(cap[2] || cap[1]));
                continue;
            }

            // em
            if (cap = this.rules.em.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.em(this.output(cap[2] || cap[1]));
                continue;
            }

            // code
            if (cap = this.rules.code.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.codespan(escape(cap[2], true));
                continue;
            }

            // br
            if (cap = this.rules.br.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.br();
                continue;
            }

            // del (gfm)
            if (cap = this.rules.del.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.del(this.output(cap[1]));
                continue;
            }

            // text
            if (cap = this.rules.text.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.text(escape(this.smartypants(cap[0])));
                continue;
            }

            if (src) {
                throw new
                    Error('Infinite loop on byte: ' + src.charCodeAt(0));
            }
        }

        return out;
    };

    /**
     * Compile Link
     */

    InlineLexer.prototype.outputLink = function(cap, link) {
        var href = escape(link.href)
            , title = link.title ? escape(link.title) : null;

        return cap[0].charAt(0) !== '!'
            ? this.renderer.link(href, title, this.output(cap[1]))
            : this.renderer.image(href, title, escape(cap[1]));
    };

    /**
     * Smartypants Transformations
     */

    InlineLexer.prototype.smartypants = function(text) {
        if (!this.options.smartypants) return text;
        return text
        // em-dashes
            .replace(/---/g, '\u2014')
            // en-dashes
            .replace(/--/g, '\u2013')
            // opening singles
            .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
            // closing singles & apostrophes
            .replace(/'/g, '\u2019')
            // opening doubles
            .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
            // closing doubles
            .replace(/"/g, '\u201d')
            // ellipses
            .replace(/\.{3}/g, '\u2026');
    };

    /**
     * Mangle Links
     */

    InlineLexer.prototype.mangle = function(text) {
        if (!this.options.mangle) return text;
        var out = '', l = text.length, i = 0, ch;

        for (; i < l; i++) {
            ch = text.charCodeAt(i);
            if (Math.random() > 0.5) {
                ch = 'x' + ch.toString(16);
            }
            out += '&#' + ch + ';';
        }

        return out;
    };

    /**
     * Renderer
     */

    function Renderer(options) {
        this.options = options || {};
    }

    Renderer.prototype.code = function(code, lang, escaped) {
        if (this.options.highlight) {
            var out = this.options.highlight(code, lang);
            if (out != null && out !== code) {
                escaped = true;
                code = out;
            }
        }

        if (!lang) {
            return '<pre><code>'
                + (escaped ? code : escape(code, true))
                + '\n</code></pre>';
        }

        return '<pre><code class="'
            + this.options.langPrefix
            + escape(lang, true)
            + '">'
            + (escaped ? code : escape(code, true))
            + '\n</code></pre>\n';
    };

    Renderer.prototype.blockquote = function(quote) {
        return '<blockquote>\n' + quote + '</blockquote>\n';
    };

    Renderer.prototype.html = function(html) {
        return html;
    };

    Renderer.prototype.heading = function(text, level, raw) {
        var headerCloses = 0;
        var out = "";
        for (var i=level; i<7; i++) {
            headerCloses += counter[""+i];
            counter[""+i] = 0;
        }
        counter[""+level] = 1;
        while (headerCloses>0) { out += "</div>"; headerCloses--; }
        return out + '<div class="section" id="' + raw.toLowerCase().replace(/ *<.*?>(.*?<\/[^/]*?>)? */g, '').replace(/[^\w]+/g, '-') + '">' +
            '<h' + level  + this.options.headerPrefix + '>' + text + '</h' + level + '>\n';
    };

    Renderer.prototype.hr = function() {
        return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
    };

    Renderer.prototype.obj = function(name, args, content) {
        return toObject(name.toLowerCase(), args, content) + "\n";
    };

    Renderer.prototype.list = function(body, ordered) {
        var type = ordered ? 'ol' : 'ul';
        return '<' + type + '>\n' + body + '</' + type + '>\n';
    };

    Renderer.prototype.listitem = function(text) {
        return '<li>' + text + '</li>\n';
    };

    Renderer.prototype.checkbox = function(text, checked) {
        return '<div><input disabled type="checkbox"' + (checked ? ' checked' : '') + '></input>' + text + '</div>\n';
    };

    Renderer.prototype.paragraph = function(text) {
        return '<p>' + text + '</p>\n';
    };

    Renderer.prototype.table = function(header, body) {
        return '<div class="table-wrapper">\n'
            + '<table>\n'
            + '<thead>\n'
            + header
            + '</thead>\n'
            + '<tbody>\n'
            + body
            + '</tbody>\n'
            + '</table>\n'
            + '</div>\n';
    };

    Renderer.prototype.tablerow = function(content) {
        return '<tr>\n' + content + '</tr>\n';
    };

    Renderer.prototype.tablecell = function(content, flags) {
        var type = flags.header ? "th" : "td";
        var tag = flags.align
            ? '<' + type + ' style="text-align:' + flags.align + '">'
            : '<' + type + '>';
        return tag + content + '</' + type + '>\n';
    };

// span level renderer
    Renderer.prototype.strong = function(text) {
        return '<strong>' + text + '</strong>';
    };

    Renderer.prototype.underline = function(text) {
        return '<span class="underline">' + text + '</span>';
    };

    Renderer.prototype.em = function(text) {
        return '<em>' + text + '</em>';
    };

    Renderer.prototype.codespan = function(text) {
        return '<code>' + text + '</code>';
    };

    Renderer.prototype.br = function() {
        return this.options.xhtml ? '<br/>' : '<br>';
    };

    Renderer.prototype.del = function(text) {
        return '<s>' + text + '</s>';
    };

    Renderer.prototype.link = function(href, title, text) {
        if (this.options.sanitize) {
            try {
                var prot = decodeURIComponent(unescape(href))
                    .replace(/[^\w:]/g, '')
                    .toLowerCase();
            } catch (e) {
                return '';
            }
            if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
                return '';
            }
        }
        var out = '<a href="' + href + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += '>' + text + '</a>';
        return out;
    };

    Renderer.prototype.image = function(href, title, text) {
        var out = '<img src="' + href + '" alt="' + text + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';
        return out;
    };

    Renderer.prototype.text = function(text) {
        return text;
    };

    /**
     * Parsing & Compiling
     */

    function Parser(options) {
        this.tokens = [];
        this.token = null;
        this.options = options || marked.defaults;
        this.options.renderer = this.options.renderer || new Renderer;
        this.renderer = this.options.renderer;
        this.renderer.options = this.options;
    }

    /**
     * Static Parse Method
     */

    Parser.parse = function(src, options, renderer) {
        var parser = new Parser(options, renderer);
        return parser.parse(src);
    };

    /**
     * Parse Loop
     */

    Parser.prototype.parse = function(src) {
        this.inline = new InlineLexer(src.links, this.options, this.renderer);
        this.tokens = src.reverse();

        var out = '';
        while (this.next()) {
            out += this.tok();
        }

        return out;
    };

    /**
     * Next Token
     */

    Parser.prototype.next = function() {
        return this.token = this.tokens.pop();
    };

    /**
     * Preview Next Token
     */

    Parser.prototype.peek = function() {
        return this.tokens[this.tokens.length - 1] || 0;
    };

    /**
     * Parse Text Tokens
     */

    Parser.prototype.parseText = function() {
        var body = this.token.text;

        while (this.peek().type === 'text') {
            body += '\n' + this.next().text;
        }

        return this.inline.output(body);
    };

    /**
     * Parse Current Token
     */

    Parser.prototype.tok = function() {
        switch (this.token.type) {
            case 'space': {
                return '';
            }
            case 'hr': {
                return this.renderer.hr();
            }
            case 'obj': {
                return this.renderer.obj();
            }
            case 'heading': {
                return this.renderer.heading(
                    this.inline.output(this.token.text),
                    this.token.depth,
                    this.token.text);
            }
            case 'code': {
                return this.renderer.code(this.token.text,
                    this.token.lang,
                    this.token.escaped);
            }
            case 'table': {
                var header = '', body = '', i, row, cell, flags, j;

                // header
                cell = '';
                for (i = 0; i < this.token.header.length; i++) {
                    flags = { header: true, align: this.token.align[i] };
                    cell += this.renderer.tablecell(
                        this.inline.output(this.token.header[i]),
                        { header: true, align: this.token.align[i] }
                    );
                }
                header += this.renderer.tablerow(cell);

                for (i = 0; i < this.token.cells.length; i++) {
                    row = this.token.cells[i];

                    cell = '';
                    for (j = 0; j < row.length; j++) {
                        cell += this.renderer.tablecell(
                            this.inline.output(row[j]),
                            { header: false, align: this.token.align[j] }
                        );
                    }

                    body += this.renderer.tablerow(cell);
                }
                return this.renderer.table(header, body);
            }
            case 'blockquote_start': {
                var body = '';

                while (this.next().type !== 'blockquote_end') {
                    body += this.tok();
                }

                return this.renderer.blockquote(body);
            }
            case 'list_start': {
                var body = ''
                    , ordered = this.token.ordered;

                while (this.next().type !== 'list_end') {
                    body += this.tok();
                }

                return this.renderer.list(body, ordered);
            }
            case 'list_item_start': {
                var body = '';

                while (this.next().type !== 'list_item_end') {
                    body += this.token.type === 'text'
                        ? this.parseText()
                        : this.tok();
                }

                if (body.match(/^\[[ x]]/)) {
                    return this.renderer.checkbox(body.substring(3).trim(), body.charAt(1) === 'x');
                }

                return this.renderer.listitem(body);
            }
            case 'loose_item_start': {
                var body = '';

                while (this.next().type !== 'list_item_end') {
                    body += this.tok();
                }

                return this.renderer.listitem(body);
            }
            case 'html': {
                var html = !this.token.pre && !this.options.pedantic
                    ? this.inline.output(this.token.text)
                    : this.token.text;
                return this.renderer.html(html);
            }
            case 'paragraph': {
                return this.renderer.paragraph(this.inline.output(this.token.text));
            }
            case 'text': {
                return this.renderer.paragraph(this.parseText());
            }
        }
    };

    /**
     * Helpers
     */

    function loop(u,l,params,r,s,d) {
        var newStr = u;
        var tmp = l;
        for (var i=0;i<params.length;i++) {
            l = l.replace("||p||", params[i].replace(/"/g,'%22').replace(/ /g,'%20')).replace(/\|\|i\|\|/g, i);
            newStr += l + params[i] + r;
            if (i<params.length-1) newStr += s;
            l = tmp;
        }
        return newStr + d;
    }

    function escape(html, encode) {
        return html
            .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function unescape(html) {
        return html.replace(/&([#\w]+);/g, function(_, n) {
            n = n.toLowerCase();
            if (n === 'colon') return ':';
            if (n.charAt(0) === '#') {
                return n.charAt(1) === 'x'
                    ? String.fromCharCode(parseInt(n.substring(2), 16))
                    : String.fromCharCode(+n.substring(1));
            }
            return '';
        });
    }

    function replace(regex, opt) {
        regex = regex.source;
        opt = opt || '';
        return function self(name, val) {
            if (!name) return new RegExp(regex, opt);
            val = val.source || val;
            val = val.replace(/(^|[^\[])\^/g, '$1');
            regex = regex.replace(name, val);
            return self;
        };
    }

    function noop() {}
    noop.exec = noop;

    function merge(obj) {
        var i = 1
            , target
            , key;

        for (; i < arguments.length; i++) {
            target = arguments[i];
            for (key in target) {
                if (Object.prototype.hasOwnProperty.call(target, key)) {
                    obj[key] = target[key];
                }
            }
        }

        return obj;
    }


    /**
     * Marked
     */

    window.marked = function (src, opt, callback) {
        if (callback || typeof opt === 'function') {
            if (!callback) {
                callback = opt;
                opt = null;
            }

            opt = merge({}, marked.defaults, opt || {});

            var highlight = opt.highlight, tokens, pending, i = 0;

            try {
                tokens = Lexer.lex(src, opt);
            } catch (e) {
                return callback(e);
            }

            pending = tokens.length;

            var done = function(err) {
                if (err) {
                    opt.highlight = highlight;
                    return callback(err);
                }

                var out;

                try {
                    out = Parser.parse(tokens, opt);
                } catch (e) {
                    err = e;
                }

                opt.highlight = highlight;

                return err
                    ? callback(err)
                    : callback(null, out);
            };

            if (!highlight || highlight.length < 3) {
                return done();
            }

            delete opt.highlight;

            if (!pending) return done();

            for (; i < tokens.length; i++) {
                (function(token) {
                    if (token.type !== 'code') {
                        return --pending || done();
                    }
                    return highlight(token.text, token.lang, function(err, code) {
                        if (err) return done(err);
                        if (code == null || code === token.text) {
                            return --pending || done();
                        }
                        token.text = code;
                        token.escaped = true;
                        --pending || done();
                    });
                })(tokens[i]);
            }

            return;
        }
        //try {
        if (opt) opt = merge({}, marked.defaults, opt);
        return Parser.parse(Lexer.lex(src, opt), opt);
        /*} catch (e) {
         e.message += '\nPlease report this to https://github.com/chjj/marked.';
         if ((opt || marked.defaults).silent) {
         return '<p>An error occured:</p><pre>'
         + escape(e.message + '', true)
         + '</pre>';
         }
         throw e;
         }*/
    };

    /**
     * Options
     */

    marked.options =
        marked.setOptions = function(opt) {
            merge(marked.defaults, opt);
            return marked;
        };

    marked.defaults = {
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        sanitizer: null,
        mangle: true,
        smartLists: false,
        silent: false,
        highlight: null,
        langPrefix: 'lang-',
        smartypants: false,
        headerPrefix: '',
        renderer: new Renderer,
        xhtml: false
    };

    /**
     * Expose
     */

    marked.Parser = Parser;
    marked.parser = Parser.parse;

    marked.Renderer = Renderer;

    marked.Lexer = Lexer;
    marked.lexer = Lexer.lex;

    marked.InlineLexer = InlineLexer;
    marked.inlineLexer = InlineLexer.output;

    marked.parse = marked;

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = marked;
    } else if (typeof define === 'function' && define.amd) {
        define(function() { return marked; });
    } else {
        this.marked = marked;
    }

}).call(function() {
    return this || (typeof window !== 'undefined' ? window : global);
}());

/**
 * On Load
 */

document.addEventListener("DOMContentLoaded", function() {
    // set character set
    var charset = document.createElement("meta");
    charset.setAttribute("charset", "UTF-8");
    document.head.insertBefore(charset, document.head.firstChild);

    // defines source types
    var tagTypes = [
        { // 0 = external js
            0: "script",
            "type": "text/javascript",
            "src": ""
        },
        { // 1 = external css
            0: "link",
            "rel": "stylesheet",
            "type": "text/css",
            "href": ""
        },
        { // 2 = meta tagTypes
            0: "meta",
            "name": "",
            "content": ""
        }
    ];

    // load an array of sources
    function loadSources(sources) {
        var tagToAdd, args, tagInfo, tagKeys, val, count, prevNode;
        for (var i=0; i<sources.length; i++) {
            count = 0;
            args = sources[i];
            tagInfo = tagTypes[args[0]];
            tagToAdd = document.createElement(tagInfo[0]);
            tagKeys = Object.getOwnPropertyNames(tagInfo);
            for (var j=0; j<tagKeys.length; j++) {
                if (tagKeys[j] != 0) {
                    val = tagInfo[tagKeys[j]];
                    tagToAdd[tagKeys[j]] = val ? val : args[1+(count++)];
                }
            }
            prevNode = document.head.firstChild;
            for (var j=i; j>0; j--) {
                prevNode = prevNode.nextSibling;
            }
            document.head.insertBefore(tagToAdd, prevNode);
        }
    }

    var style = ".container{position:relative;width:100%;max-width:960px!important;margin:0 auto;padding:0 20px;overflow-wrap:break-word;box-sizing:border-box}.column,.columns{width:100%;float:left;box-sizing:border-box}@media (min-width: 400px){.container{width:85%;padding:0}}@media (min-width: 550px){.container{width:80%}.column,.columns{margin-left:4%}.column:first-child,.columns:first-child{margin-left:0}.one.column,.one.columns{width:4.66666666667%}.two.columns{width:13.3333333333%}.three.columns{width:22%}.four.columns{width:30.6666666667%}.five.columns{width:39.3333333333%}.six.columns{width:48%}.seven.columns{width:56.6666666667%}.eight.columns{width:65.3333333333%}.nine.columns{width:74%}.ten.columns{width:82.6666666667%}.eleven.columns{width:91.3333333333%}.twelve.columns{width:100%;margin-left:0}.one-third.column{width:30.6666666667%}.two-thirds.column{width:65.3333333333%}.one-half.column{width:48%}.offset-by-one.column,.offset-by-one.columns{margin-left:8.66666666667%}.offset-by-two.column,.offset-by-two.columns{margin-left:17.3333333333%}.offset-by-three.column,.offset-by-three.columns{margin-left:26%}.offset-by-four.column,.offset-by-four.columns{margin-left:34.6666666667%}.offset-by-five.column,.offset-by-five.columns{margin-left:43.3333333333%}.offset-by-six.column,.offset-by-six.columns{margin-left:52%}.offset-by-seven.column,.offset-by-seven.columns{margin-left:60.6666666667%}.offset-by-eight.column,.offset-by-eight.columns{margin-left:69.3333333333%}.offset-by-nine.column,.offset-by-nine.columns{margin-left:78%}.offset-by-ten.column,.offset-by-ten.columns{margin-left:86.6666666667%}.offset-by-eleven.column,.offset-by-eleven.columns{margin-left:95.3333333333%}.offset-by-one-third.column,.offset-by-one-third.columns{margin-left:34.6666666667%}.offset-by-two-thirds.column,.offset-by-two-thirds.columns{margin-left:69.3333333333%}.offset-by-one-half.column,.offset-by-one-half.columns{margin-left:52%}}html{font-size:62.5%}body{font-size:1.5em;line-height:1.6;font-weight:400;font-family:\"Raleway\",\"Open Sans\",\"HelveticaNeue\",\"Helvetica Neue\",Helvetica,Arial,sans-serif;color:#222}h1,h2,h3,h4,h5,h6{margin-top:-.5rem;padding-top:1rem;margin-bottom:2rem;font-weight:300}h1{font-size:5rem;line-height:1.2;letter-spacing:-.1rem}h2{font-size:3.6rem;line-height:1.25;letter-spacing:-.1rem}h3,.tagline3{font-size:3rem;line-height:1.3;letter-spacing:-.1rem}h4,.tagline4{font-size:2.4rem;line-height:1.35;letter-spacing:-.08rem}h5,.tagline5{font-size:1.8rem;line-height:1.5;letter-spacing:-.05rem}h6,.tagline6{font-size:1.5rem;line-height:1.6;letter-spacing:0}@media (min-width: 550px){h2{font-size:4.2rem}h3,.tagline3{font-size:3.6rem}h4,.tagline4{font-size:3rem}h5,.tagline5{font-size:2.4rem}}p{margin-top:0}a{color:#1EAEDB}a:hover{color:#0FA0CE}.button,button,input[type=\"submit\"],input[type=\"reset\"],input[type=\"button\"]{display:inline-block;height:38px;padding:0 30px;color:#555;text-align:center;font-size:11px;font-weight:600;line-height:38px;letter-spacing:.1rem;text-transform:uppercase;text-decoration:none;white-space:nowrap;background-color:transparent;border:1px solid #bbb;cursor:pointer;box-sizing:border-box}.button:hover,button:hover,input[type=\"submit\"]:hover,input[type=\"reset\"]:hover,input[type=\"button\"]:hover,.button:focus,button:focus,input[type=\"submit\"]:focus,input[type=\"reset\"]:focus,input[type=\"button\"]:focus{color:#333;border-color:#888;outline:0}.button.button-primary,button.button-primary,input[type=\"submit\"].button-primary,input[type=\"reset\"].button-primary,input[type=\"button\"].button-primary{color:#FFF;background-color:#33C3F0;border-color:#33C3F0}.button.button-primary:hover,button.button-primary:hover,input[type=\"submit\"].button-primary:hover,input[type=\"reset\"].button-primary:hover,input[type=\"button\"].button-primary:hover,.button.button-primary:focus,button.button-primary:focus,input[type=\"submit\"].button-primary:focus,input[type=\"reset\"].button-primary:focus,input[type=\"button\"].button-primary:focus{color:#FFF;background-color:#1EAEDB;border-color:#1EAEDB}input[type=\"email\"],input[type=\"number\"],input[type=\"search\"],input[type=\"text\"],input[type=\"tel\"],input[type=\"url\"],input[type=\"password\"],textarea,select{height:38px;padding:6px 10px;background-color:#fff;border:1px solid #D1D1D1;box-shadow:none;box-sizing:border-box}input[type=\"email\"],input[type=\"number\"],input[type=\"search\"],input[type=\"text\"],input[type=\"tel\"],input[type=\"url\"],input[type=\"password\"],textarea{-webkit-appearance:none;-moz-appearance:none;appearance:none}textarea{min-height:65px;padding-top:6px;padding-bottom:6px}input[type=\"email\"]:focus,input[type=\"number\"]:focus,input[type=\"search\"]:focus,input[type=\"text\"]:focus,input[type=\"tel\"]:focus,input[type=\"url\"]:focus,input[type=\"password\"]:focus,textarea:focus,select:focus{border:1px solid #33C3F0;outline:0}label,legend{display:block;margin-bottom:.5rem;font-weight:600}fieldset{padding:0;border-width:0}input[type=\"checkbox\"],input[type=\"radio\"]{margin-bottom:0;position:relative;top:.2rem;display:inline}ul > div > input[type=\"checkbox\"]{right:.4rem}label > .label-body{display:inline-block;margin-left:.5rem;font-weight:400}ul{list-style:circle inside}ol{list-style:decimal inside}ol,ul{padding-left:0;margin-top:0}ul ul,ul ol,ol ol,ol ul{margin:1.5rem 0 1.5rem 3rem;font-size:90%}li,ul > *{margin-bottom:1rem}code{padding:.2rem .5rem;margin:0 .2rem;font-size:90%;white-space:nowrap;background:#F1F1F1;border:1px solid #E1E1E1}pre > code{display:block;padding:2rem 1.5rem 1rem;white-space:pre;overflow-x:scroll;overflow-wrap:normal}th,td{padding:12px 15px;text-align:left}th:first-child,td:first-child{padding-left:0}th:last-child,td:last-child{padding-right:0}tr{border-bottom:1px solid #E1E1E1}table :last-child tr:last-child{border-bottom:0}button,.button{margin-bottom:1rem}input,textarea,select,fieldset{margin-bottom:1.5rem}pre,blockquote,dl,figure,p,ul,ol,.table-wrapper,form{margin-bottom:2.5rem}hr{margin-top:3rem;margin-bottom:3.5rem;border-width:0;border-top:1px solid #E1E1E1}.container:after,.row:after,.u-cf{content:\"\";display:table;clear:both}.separator{margin-right:1.8rem}span.underline{text-decoration:underline}body{background-color:#fff}blockquote{border-left:2px solid #ccc;padding:0 2rem;margin:0 0 2.5rem;color:#666}nav{background-color:#f6f6f6;padding:1rem 1.5rem;margin:-1rem -1rem 1rem;border:.1rem solid #ccc;position:relative;transition:height 1s ease-in-out;overflow:hidden}nav:first-of-type{margin-bottom:2rem}nav:first-of-type ~ .section{padding:0 2rem}nav > .link-container > a{white-space:nowrap;color:#999}nav > .link-container > a:hover{color:#666}a{cursor:pointer;cursor:hand}img,.table-wrapper{max-width:100%!important}.table-wrapper{overflow-x:auto;border-bottom:1px solid #E1E1E1;display:inline-block}.toggle-container{color:#999;position:absolute;bottom:-.4rem;font-size:2rem;padding:.5rem 1.5rem}.toggle-container:hover{color:#333;cursor:pointer;cursor:hand}.toggle-container.left{left:0;transform:rotate(90deg)}.toggle-container.right{right:0;transform:rotate(270deg)}::-webkit-scrollbar{position:absolute;z-index:9999;width:1%;height:1%;min-width:1rem;min-height:1rem}body{overflow-x:hidden;overflow-y:scroll}.container > nav:first-child{position:fixed;top:1rem;left:0;width:100%;z-index:999}::-webkit-scrollbar *{background:transparent}::-webkit-scrollbar-thumb{border:.1rem solid rgba(0,0,0,0.22)!important;background:rgba(0,0,0,0.04)!important}code,kbd,samp{font-family:\'Roboto Mono\',\"Lucida Console\",Monaco,monospace}.section h1:first-child + p{margin-top:-2rem}.tagline3,.tagline4,.tagline5,.tagline6{opacity:.6}";
    document.head.innerHTML = '<style rel="stylesheet" type="text/css">' + style + '</style>' + document.head.innerHTML;


    // Essential sources
    loadSources([
        [0,'https://cdn.jsdelivr.net/jquery/3.0.0-alpha1/jquery.min.js'],
        [1,'https://cdn.jsdelivr.net/normalize/3.0.3/normalize.min.css'],
        [2,'viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no']
    ]);

    // Defer module
    window.defer = function(method, str) {
        if (eval(str)) return method(); else setTimeout(function() { window.defer(method, str) }, 1);
    };

    window.defer(function() {
        window.defer(function() {
            window.onhashchange = changePage(window.location.hash.replace("#",""));
            var pageCodeAddress = document.getElementsByTagName("html")[0].getAttribute("md").trim();
            $.get(pageCodeAddress, function (data) {
                loadSources([
                    [0,'https://cdn.jsdelivr.net/highlight.js/8.9.1/highlight.min.js'],
                    [0,'https://cdn.jsdelivr.net/less/2.5.3/less.min.js'],
                    [0,'https://cdn.jsdelivr.net/codemirror/4.5.0/codemirror.min.js'],
                    [1,'https://fonts.googleapis.com/css?family=Raleway'],
                    [1,'https://fonts.googleapis.com/css?family=Roboto+Mono:400,700'],
                    [1,'https://cdn.jsdelivr.net/codemirror/4.5.0/codemirror.css'],
                    [1,'https://cdn.jsdelivr.net/fontawesome/4.5.0/css/font-awesome.min.css'],
                    [1,'https://cdn.jsdelivr.net/codemirror/4.5.0/theme/neo.css']
                ]);

                window.markdownHighlighting = false;

                // Get Markdown highlighting
                window.defer(function() {
                    loadSources([
                        [0,'https://cdn.jsdelivr.net/codemirror/4.5.0/mode/markdown/markdown.js']
                    ]);
                    window.markdownHighlighting = true;
                }, "typeof CodeMirror !== 'undefined'");

                // Loop to retrieve all Markdown sources
                window.documents = [];
                function findFiles(inp) {
                    var regex;
                    regex = (/\{\{(?! )(?:https?:\/\/)?(?:(?:[\da-z\.-]+)\.(?:[a-z\.]{2,6}))?(?:[\/\w\.-]*)*\/?}}/g).exec(inp);
                    if (regex) {
                        if (regex[0].length>2) {
                            window.documents.push([regex[0].substring(2,regex[0].length-2),""]);
                        }
                        findFiles(inp.substring(regex.index + regex[0].length))
                    }
                }
                findFiles(data);

                for (var i=0; i<window.documents.length; i++) {
                    getFile(window.documents[i][0], i);
                }

                function getFile(file, index) {
                    $.get(file, function(content) {
                        window.documents[index][1] = content ? content : " ";
                    });
                }

                window.defer(function() {
                    for (var i=0; i<window.documents.length; i++) {
                        data = data.replace('{{'+window.documents[i][0]+'}}', window.documents[i][1]);
                    }
                    var hash = window.location.hash;
                    //-------------Parse and insert data----------------
                    $('body').html('<div class="container">' + marked(data) + '</div>');
                    window.parsed = true;
                    // If a menu is too long, make inline
                    var menus = $('nav'), menu;
                    var retrieved = false, breakLengths = [];
                    var adjustMenus = function () {
                        for (var i = 0; i < menus.length; i++) {
                            menu = $(menus[i]);
                            if (!retrieved) {
                                var total = 0, menuChildren = menu.children();
                                for (var j = 0; j < menuChildren.length; j += 2) {
                                    total += $(menuChildren[j]).width() + 18;
                                }
                                breakLengths[i] = total - 18;
                            }
                            if (menu.height() > 25 || $(menu).width() < breakLengths[i]) {
                                $(menu).children().css('display', 'block').css('margin', '0.25rem 0');
                                if ($(menu).width() > breakLengths[i]) {
                                    $(menu).children().css('display', 'inline').css('text-align', '').css('margin', '');
                                    $(menu).css('height', '').css('overflow-y', '');
                                }
                            }
                        }
                        retrieved = true;
                    };
                    adjustMenus();
                    // Set listeners to switch back and forth
                    $(window).resize(adjustMenus);
                    // Menus pre-set to first one
                    $('nav :first-child :first-child').trigger("click");
                    // If there's a hash, open it
                    if (hash.length > 1) changePage(hash.replace(/^#/,""));
                    // Check if images are too large
                    /*defer(function() {
                        var imgs = $("img"), img, native;
                        for (var i = 0; i < imgs.length; i++) {
                            img = imgs[i];
                            native = new Image();
                            native.src = img.src;
                            alert("Width:         " + img.clientWidth
                                + "\nHeight:        " + img.clientHeight
                                + "\nNative width:  " + native.width
                                + "\nNative height: " + native.height);
                        }
                    }, "window.parsed && (function(){var im = $('img');" +
                        "for (var i=0;i<im.length; i++) {if (!im[i].complete) return false}return true;})()");*/

                    // Code block highlighting
                    window.defer(function () {
                        var date1, date2;
                        date1 = new Date();
                        $('pre code').each(function (i, block) {
                            hljs.highlightBlock(block);
                        });
                        date2 = new Date();
                        //console.log("HLJS: " + (date2.getTime() - date1.getTime()));
                    }, "window.hljs");
                }, "(function(){for (var i=0;i<window.documents.length;i++) {if (!window.documents[i][1]) return false;} return true;})()");
            });
        }, "window.marked");
    }, "window.jQuery");
});