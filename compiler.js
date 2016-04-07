 /**
 * Generate function
 */

function generate(str, opt) {
    window.header_tree = [];
    window.header_counter = {"1":0,"2":0,"3":0,"4":0,"5":0,"6":0};

    return opt ? postprocess(interpret(preprocess(str), opt)) : postprocess(interpret(preprocess(str)));
}

/**
 * Pre-process
 */

function preprocess(str) {
    // Tested - removing comments
    str = str.replace(/(^|\n)@{3,}\s*?\n(.|\n)*?\n@{3,}\s*?($|\n)/g, "").replace(/\@{2,} .*/g, "");

    // Tested
    var re = /\{[a-zA-Z_]+\(.*?\).*?}/g;
    var re = /\{[a-zA-Z_]+\(.*?\).*?}/g;
    // Tested - Finding the start indices of Web Objects
    var indices = [], match = re.exec(str), count, cont, i, c;
    while (match) {
        indices[indices.length] = match.index;
        match = re.exec(str);
    }
    var script_o_indices = [], script_c_indices = [];
    var re_1 = /<script/g;
    match = re_1.exec(str);
    while (match) {
        script_o_indices[script_o_indices.length] = match.index;
        match = re_1.exec(str);
    }
    var re_2 = /<\/script>/g;
    match = re_2.exec(str);
    while (match) {
        script_c_indices[script_c_indices.length] = match.index+9;
        match = re_2.exec(str);
    }

    // Tested
    for (var j=indices.length-1; j>=0; j--) {
        cont = true;
        try {
        for (var k=0; k<script_o_indices.length; k++)
            if (script_o_indices[k]<=indices[j] && indices[j]<script_c_indices[k]) { cont = false; break; }
        } catch (e) { console.log(e.stack); console.log("Numbers of <sc"+"ript> and </scr"+"ipt> must be equal."); }
        if (cont) {
            cont = false; i = 3; count = 1;
            while (count > 0) {
                if (indices[j]+i<str.length) {
                    c = str.charAt(indices[j] + i);
                    if (!cont && c === ')')
                        cont = true;
                    else if (c === '{')
                        count++;
                    else if (c === '}' && --count > 0) {
                        str = str.substring(0, indices[j] + i + 1) + '<' + count + '>' + str.substring(indices[j] + i + 1);
                    }
                    i++;
                } else break;
            }
        }
    }

    return str;
}

/**
 * Interpret
 */
(function() {

    /**
     * Object functions
     */

    var objects = {
        "menu": [
            '<nav>',
            '<span class="link-container"><a onclick="changePage(\'||p||\');">',
            '</a></span>',
            '<span class="separator"> </span>',
            '</nav>'
        ],
        "tagline":[
            '<div class="tagline t~?0?~">',
            '',
            '',
            '',
            '</div>'
        ],
        "modify":[
            '<scr'+'ipt type="text/javascript" class="_sjs_this">',
            '',
            '',
            '',
            '$("._sjs_this").first().parent().css("~?0?~","~?1?~");$("._sjs_this").first().remove();</scr'+'ipt>'
        ],
        "break":['<div class="page-break">', '', '', '', '</div>'],
        "print":['<div class="__print__">', '', '', '', '</div>'],
        "donotprint":['<div class="__donotprint__">', '', '', '', '</div>'],
        "icon":['<i class="fa fa-~?0?~">', '', '', '', '</i>'],
        "font":['<span style="font-family:~?0?~">', '', '', '', '</span>'],
        "header":['<h~?0?~>', '', '', '', '</h~?0?~>'],
        "heading":['~>', 'header'],
        "color":['<span style="color:~?0?~">', '', '', '', '</span>'],
        "vspace":['<div style="margin-bottom:~?0?~">', '', '', '', '</div>'],
        "hspace":['<span style="margin-left:~?0?~">', '', '', '', '</span>'],
        "vertical":['~>', 'vspace'],
        "horizontal":['~>', 'hspace'],
        "date":['<span class="__date__">', '', '', '', '</span>'],
        "bold":['<strong>', '', '', '', '</strong>'],
        "italic":['<em>', '', '', '', '</em>'],
        "underline":['<span class="__underline__">', '', '', '', '</span>'],
        "super":['<sup>', '', '', '', '</sup>'],
        "sub":['<sub>', '', '', '', '</sub>'],
        "hspace":['<span style="margin-left:~?0?~">', '', '', '', '</span>'],
        "group":['<span class="group">', '', '', '', '</span>'],
        "align":['~>', 'text-align', '~?0?~'],
        "background":[''],
        "backgroundimage":['~>', 'background-image', 'url("~?0?~")'],
        "backgroundcolor":['~>', 'background-color', '~?0?~'],
        "comment":[''],
        "escape":[''],
        "rule":['<hr>', '', '', '', ''],
        "contents":['<span class="__contents__">', '', '', '', '</span>'],
        "emoji":['<i style="font-style:inherit;" class="__emoji__">', ':', ':', '', '</i>'],
        "emoticon":['~>', 'emoji'],
        "up":['<span style="position:relative;bottom:~?0?~">', '', '', '', '</span>'],
        "down":['<span style="position:relative;top:~?0?~">', '', '', '', '</span>'],
        "left":['<span style="position:relative;right:~?0?~">', '', '', '', '</span>'],
        "right":['<span style="position:relative;left:~?0?~">', '', '', '', '</span>']
    };

    var objList = Object.getOwnPropertyNames(objects);

    function valsToHTML(object, args, content) {
        if (object === "comment") {
            return "";
        } else if (object === "escape") {
            console.log(content);
            return '<span>' + toHTMLCharCodes(content.join()) + '</span>';
        } else if (object === "tagline") {
            if (args.length < 1) {
                args[1] = content[0].split(" ");
                args[0] = args[1].length<4 ? args[1].length+2 : 6;
            }
        } else if (object === "background") {
            if (args.length > 0) {
                if (args[0].match(/\.[a-zA-Z]{1,7}$/g) == null) {
                    return valsToHTML('backgroundcolor', args, content);
                } else {
                    return valsToHTML('backgroundimage', args, content);
                }
            }
        } else if (object == "contents") {
            for (var i=args.length; i<4; i++) args.push((i<2?"":"#$k}plz>n0$"));
            return '<span class="__contents__">['+args[0]+','+args[1]+','+args[2]+','+args[3]+']</span>';
        }

        var obj = objects[object];

        if (obj[0].indexOf('~>')>-1) {
            // Shortcut
            if (obj.length < 3) return valsToHTML(obj[1], args, content);
            // Modify
            var mods = "";
            for (var index = 1; index+1 < obj.length; index += 2)
                mods += valsToHTML("modify", [obj[index], insertArgs(obj[index+1], args)], content);
            return mods;
        }

        var str = obj[0];
        var temp = obj[1];
        for (var i=0;i<content.length;i++) {
            obj[1] = obj[1].replace("||p||", content[i].replace(/"/g,'%22').replace(/ /g,'%20')).replace(/\|\|i\|\|/g, i);
            str += obj[1] + content[i] + obj[2];
            if (i<content.length-1) str += obj[3];
            obj[1] = temp;
        }
        str += obj[4];

        return insertArgs(str, args);
    }

    function insertArgs(str, args) {
        var res;
        var regex = /~\?([0-9]+)\?~/;
        do {
            res = regex.exec(str);
            if (res) {
                if (parseInt(res[1]) < args.length) {
                    str = str.substring(0, res.index) + args[parseInt(res[1])] + str.substring(res.index+res[0].length);
                } else {
                    return '<span style="color:red">Incorrect number of settings in this <strong>' + object + '</strong> object.</span>';
                }
            }
        } while (res);

        return str;
    }

    function stringToValues(str) {
        /* Split string into parts */
        var name, args, content, firstArgIndex, lastArgIndex, count = 1, char, lastPunc = true, punc;
        var match, matches = [], re = /<[0-9]+>/g;
        name = str.substring(1);
        firstArgIndex = name.indexOf('(');
        for (var i=1+firstArgIndex; i<name.length; i++) {
            char = name.charAt(i);
            if (char === '(') count++;
            else if (char === ')') {
                count--;
                if (count < 1) { lastArgIndex = i; break; }
            }
        }

        content = name.substring(lastArgIndex+1).replace(/<1>/g, "");
        if (content && content.charAt(content.length-1)==='}') content = content.substring(0,content.length-1);
        args = name.substring(firstArgIndex+1,lastArgIndex);
        name = name.substring(0,firstArgIndex);

        match = re.exec(content);
        while (match) {
            matches[matches.length] = match;
            match = re.exec(content);
        }
        for (var i=matches.length-1; i>=0; i--) {
            content = content.substring(0, matches[i].index) +
                '<' + (parseInt(matches[i][0].substring(1, matches[i][0].length - 1)) - 1) + '>' +
                content.substring(matches[i].index + matches[i][0].length);
        }

        return [name.toLowerCase(), toObject(args, false), toObject(content, true)];
    }
    function toObject(str, cln) {
        return unescapeObject(JSON.parse(jsonify(escapeObject(str, cln))));
    }

    function escapeObject(str, cln) {
        var r0 = [
            [/\\\\/g, '~!4!~'],
            [/\\\[/g, '~!5!~'],
            [/\\]/g,  '~!6!~'],
            [/\\,/g,  '~!7!~'],
            [/\\\(/g, '~!8!~'],
            [/\\\)/g, '~!9!~']
        ];
        var r1 = [
            [/\(/g, '['],
            [/\)/g, ']']
        ];
        for (var i=0; i<r0.length; i++) str = str.replace(r0[i][0],r0[i][1]);
        if (!cln) for (var i=0;i<r1.length;i++) str=str.replace(r1[i][0],r1[i][1]);
        return '[' + str + ']';
    }

    function unescapeObject(arr) {
        if (typeof arr === 'string') return arr
            .replace(/~!4!~/g, '\\')
            .replace(/~!5!~/g, "[")
            .replace(/~!6!~/g, "]")
            .replace(/~!7!~/g, ",")
            .replace(/~!8!~/g, '(')
            .replace(/~!9!~/g, ')');
        for (var i=arr.length-1; i>=0; i--) {
            arr[i] = unescapeObject(arr[i]);
        }
        return arr;
    }

    function jsonify(str) {
        var lastPunc = true, punc, char;
        for (var i=1; i<str.length; i++) {
            char = str.charAt(i);
            punc = char === '[' || char === ']' || char === ',';
            if (punc !== lastPunc) {
                str = str.substring(0,i) + '"' + str.substring(i++);
            }
            lastPunc = punc;
        }
        return str;
    }

    function addNode(tree, node, history) {
         if (node[1] < 2 || window.header_tree.length < 1) {
              window.header_tree.push(node);
              return;
         }
         var text = node[0];
         var level = node[1];
         for (var i=tree.length-1; i>=0; i--) {
              if (tree[i][1] < node[1]) {
                   history.push(i);
                   if (tree[i][3]) return addNode(tree[i][3], node, history);
                   else eval(('window.header_tree[' + (""+history).replace(/,/g, "][3][") + '][3].push(["'+text.replace(/[^\\]"/g, '\\"')+'",'+level+',[' + history + '],[]]);').replace(/\[]\[3]/g, ""));
                   return;
              }
         }
         eval(('window.header_tree[' + (""+history).replace(/,/g, "][3][") + '][3].push(["'+text.replace(/[^\\]"/g, '\\"')+'",'+level+',[' + history.concat([eval(('window.header_tree[' + (""+history).replace(/,/g, "][3][") + '][3].length').replace(/\[]\[3]/g, ""))]) + '],[]]);').replace(/\[]\[3]/g, ""));
         return;
    }

    function fixedCharCodeAt(e, b) {
        b = b || 0;
        var d = e.charCodeAt(b);
        var c, a;
        if (55296 <= d && d <= 56319) {
            c = d;
            a = e.charCodeAt(b + 1);
            if (isNaN(a)) {
                throw "High surrogate not followed by low surrogate in fixedCharCodeAt()"
            }
            return ((c - 55296) * 1024) + (a - 56320) + 65536
        }
        if (56320 <= d && d <= 57343) {
            return false
        }
        return d
    };

    function toHTMLCharCodes(str) {
        var out = "";
        for (var i=0; i<str.length; i++) {
            code = fixedCharCodeAt(str,i);
            if (code) out += '&#'+code+';';
        }
        return out;
    }

    /**
     * Block-Level Grammar
     */

    var block = {
        newline: /^\n+/,
        code: /^( {4}[^\n]+\n*)+/,
        fences: noop,
        hr: /^( *[-*_]){3,} *(?:\n+|$)/,
        obj: /^\{[a-zA-Z\-]+\(.*?\).*?(?:}(\n+|$))}/,
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
        this.options = options || interpret.defaults;
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
        src = src.replace(/\r\n|\r/g, '\n').replace(/\t/g, '    ').replace(/\u00a0/g, ' ').replace(/\u2424/g, '\n');

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
                var values = stringToValues(cap[0]);
                this.tokens.push({
                    type: 'obj',
                    object: values[0],
                    args: values[1],
                    content: values[2]
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
        obj: /^\{[a-zA-Z\-]+\(.*?\).*?}(?!<[0-9]+>)/,
        escape: /^\\([\\`*{}\[\]()#+\-.!_>@/])/,
        autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
        url: noop,
        tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
        link: /^!?\[(inside)\]\(href\)/,
        reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
        nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
        underline: /^\b_((?:.|\n)+?)_\b/,
        strong: /^\*((?:.|\n)+?\*?)\*/,
        em: /^\/\/((?:.|\n)*?[^:])\/\//,
        code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
        br: /^ {2,}\n(?!\s*$)/,
        del: noop,
        text: /^[\s\S]+?(?=[@/\\<!\{\[_*`]| {2,}\n|$)/
    };

    inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
    inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;
    inline._compat = {
        underline: /(?!)/, strong:/^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
        em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/
    };

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
    inline.c_normal = merge({}, inline.normal, inline._compat);

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
    inline.c_gfm = merge({}, inline.gfm, inline._compat);

    /**
     * GFM + Line Breaks Inline Grammar
     */

    inline.breaks = merge({}, inline.gfm, {
        br: replace(inline.br)('{2,}', '*')(),
        text: replace(inline.gfm.text)('{2,}', '*')()
    });
    inline.c_breaks = merge({}, inline.breaks, inline._compat);

    /**
     * Inline Lexer & Compiler
     */

    function InlineLexer(links, options) {
        this.options = options || interpret.defaults;
        this.links = links;
        this.rules = inline.normal;
        this.renderer = this.options.renderer || new Renderer;
        this.renderer.options = this.options;

        if (!this.links) {
            throw new
                Error('Tokens array requires a `links` property.');
        }

        if (this.options.compatibility) {
            if (this.options.gfm) {
                if (this.options.breaks) {
                    this.rules = inline.c_breaks;
                } else {
                    this.rules = inline.c_gfm;
                }
            } else {
                this.rules = inline.c_normal;
            }
        } else {
            if (this.options.gfm) {
                if (this.options.breaks) {
                    this.rules = inline.breaks;
                } else {
                    this.rules = inline.gfm;
                }
            }
        }

        if (this.options.pedantic) {
            this.rules = inline.pedantic;
        }

    }

    /**
     * Expose Inline Rules
     */

    InlineLexer.rules = inline;

    window.hai = (inline);

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

            // obj
            if (cap = this.rules.obj.exec(src)) {
                src = src.substring(cap[0].length);
                var values = stringToValues(cap[0]);
                out += objList.indexOf(values[0])>-1
                        ? this.renderer.obj(values[0], values[1], values[2])
                        : this.renderer.text(cap[0]);
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
                out += this.options.sanitize && /^<s(cript|tyle)/i.test(cap[0])
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
        addNode(window.header_tree, [text, level, [0], []], []);
        for (var i=level; i<7; i++) {
            headerCloses += window.header_counter[""+i];
            window.header_counter[""+i] = 0;
        }
        window.header_counter[""+level] = 1;
        while (headerCloses>0) { out += "</div>"; headerCloses--; }
        return out + '<div class="section" id="' + raw.toLowerCase().replace(/ *<.*?>(.*?<\/[^/]*?>)? */g, '').replace(/[^\w]+/g, '-') + '">' + '<h' + level  + this.options.headerPrefix + '>' + text + '</h' + level + '>\n';
    };

    Renderer.prototype.hr = function() {
        return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
    };

    Renderer.prototype.obj = function(object, args, content) {
        if (object != "escape")
            for (var i=0; i<content.length; i++)
                content[i] = interpret.inlineLexer.output(content[i]);

        return valsToHTML(object, args, content);
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
        return '<span class="__underline__">' + text + '</span>';
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
        this.options = options || interpret.defaults;
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
        interpret.inlineLexer = this.inline;
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
                return this.renderer.obj(
                    this.token.object,
                    this.token.args,
                    this.token.content);
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
        var i = 1, target, key;

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
     * Interpret function
     */

    window.interpret = function (src, opt, callback) {
        if (callback || typeof opt === 'function') {
            if (!callback) { callback = opt; opt = null; }

            opt = merge({}, interpret.defaults, opt || {});

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
            if (opt) opt = merge({}, interpret.defaults, opt);
            return Parser.parse(Lexer.lex(src, opt), opt);
        /*} catch (e) {
            e.message += '\nPlease report this to https://github.com/chjj/interpret.';
            if ((opt || interpret.defaults).silent) {
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

    interpret.options =
        interpret.setOptions = function(opt) {
            merge(interpret.defaults, opt);
            return interpret;
        };

    interpret.defaults = {
        compatibility: false,
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

    interpret.Parser = Parser;
    interpret.parser = Parser.parse;

    interpret.Renderer = Renderer;

    interpret.Lexer = Lexer;
    interpret.lexer = Lexer.lex;

    interpret.InlineLexer = InlineLexer;
    interpret.inlineLexer = InlineLexer.output;

    interpret.parse = interpret;

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = interpret;
    } else if (typeof define === 'function' && define.amd) {
        define(function() { return interpret; });
    } else {
        this.interpret = interpret;
    }

}).call(function() {
    return this || (typeof window !== 'undefined' ? window : global);
}());

/**
 * Post-process
 */

function postprocess(str) {
    /******** Contents bar ********/
    var tree_str = "";

    var matches = str.match(/<span class="__contents__">.*?(\]<\/span>)/g);

    if (matches == null) matches = [];

    for (var i = 0; i < matches.length; i++)
        matches[i] = [matches[i], matches[i].substring(28, matches[i].indexOf(']')).split(",")];

    function recurseDHM(element) {
        if (element == null) return "";
        if (element[3].length < 1) return '<li class="__headername__">' + element[0] + '</li>\n';
        var children = "";
        for (var i=0; i<element[3].length; i++)
            children += recurseDHM(element[3][i]);
        return '<li class="__headername__">' + element[0] + '<ol>' + children + '</ol></li>\n';
    }

    for (var i=0; i<matches.length; i++) {
        var contents = recurseDHM(window.header_tree[window.header_tree.length-1], matches[i][1]);
        // Find string
        var count = 0;
        var match = contents.indexOf(matches[i][1][count]);
        while (match>-1) {
            if (match) {
                var split = contents.substring(0, match).lastIndexOf('<li class="__headername__">');
                contents = contents.substring(0, split) + '</ol><ol>' + contents.substring(split);
            }

            if (count > 3) break;
            match = contents.indexOf(matches[i][1][++count]);
        }

        str = str.replace(matches[i][0], '<div class="__contents__"><div>' + contents + "</div></div>");
    }
    /****************************/

    // All scripts which have executed are given a class to show it
    str = str.replace(/<script>/g, "<script>try{document.currentScript.classList.add('__executed__')}catch(e){[].slice.call(document.getElementsByTagName('script')).pop().classList.add('__executed__')}");

    return '<div class="container">' + str + '</div>';
}

/**
 * Contextualise
 */

function contextualise() {
    $('body').css('opacity', '0').css('overflow', 'hidden');
    $('p:empty').remove();

    $('._sjs_this, script:not(.__executed__)').each(function(i, x) {
        eval(x.innerHTML);
    });

    (function(){
        var d = new Date();
        var day = d.getDate();
        var month = d.getMonth();
        var year = d.getFullYear();
        if (day % 10 == 1) day += "st of ";
        else if (day % 10 == 2) day += "nd of ";
        else if (day % 10 == 3) day += "rd of ";
        else day += "th of ";
        month = ["January", "February", "March",
                 "April", "May", "June",
                 "July", "August", "September",
                 "October", "November", "December"][month] + ", ";
        $('.__date__').html(day + month + year);}
    )();

    /********** Emoji ***********/
    !function(a){a.emojioneList={":kiss_ww:":{unicode:["1f469-200d-2764-fe0f-200d-1f48b-200d-1f469","1f469-2764-1f48b-1f469"],isCanonical:!0},":couplekiss_ww:":{unicode:["1f469-200d-2764-fe0f-200d-1f48b-200d-1f469","1f469-2764-1f48b-1f469"],isCanonical:!1},":kiss_mm:":{unicode:["1f468-200d-2764-fe0f-200d-1f48b-200d-1f468","1f468-2764-1f48b-1f468"],isCanonical:!0},":couplekiss_mm:":{unicode:["1f468-200d-2764-fe0f-200d-1f48b-200d-1f468","1f468-2764-1f48b-1f468"],isCanonical:!1},":family_mmbb:":{unicode:["1f468-200d-1f468-200d-1f466-200d-1f466","1f468-1f468-1f466-1f466"],isCanonical:!0},":family_mmgb:":{unicode:["1f468-200d-1f468-200d-1f467-200d-1f466","1f468-1f468-1f467-1f466"],isCanonical:!0},":family_mmgg:":{unicode:["1f468-200d-1f468-200d-1f467-200d-1f467","1f468-1f468-1f467-1f467"],isCanonical:!0},":family_mwbb:":{unicode:["1f468-200d-1f469-200d-1f466-200d-1f466","1f468-1f469-1f466-1f466"],isCanonical:!0},":family_mwgb:":{unicode:["1f468-200d-1f469-200d-1f467-200d-1f466","1f468-1f469-1f467-1f466"],isCanonical:!0},":family_mwgg:":{unicode:["1f468-200d-1f469-200d-1f467-200d-1f467","1f468-1f469-1f467-1f467"],isCanonical:!0},":family_wwbb:":{unicode:["1f469-200d-1f469-200d-1f466-200d-1f466","1f469-1f469-1f466-1f466"],isCanonical:!0},":family_wwgb:":{unicode:["1f469-200d-1f469-200d-1f467-200d-1f466","1f469-1f469-1f467-1f466"],isCanonical:!0},":family_wwgg:":{unicode:["1f469-200d-1f469-200d-1f467-200d-1f467","1f469-1f469-1f467-1f467"],isCanonical:!0},":couple_ww:":{unicode:["1f469-200d-2764-fe0f-200d-1f469","1f469-2764-1f469"],isCanonical:!0},":couple_with_heart_ww:":{unicode:["1f469-200d-2764-fe0f-200d-1f469","1f469-2764-1f469"],isCanonical:!1},":couple_mm:":{unicode:["1f468-200d-2764-fe0f-200d-1f468","1f468-2764-1f468"],isCanonical:!0},":couple_with_heart_mm:":{unicode:["1f468-200d-2764-fe0f-200d-1f468","1f468-2764-1f468"],isCanonical:!1},":family_mmb:":{unicode:["1f468-200d-1f468-200d-1f466","1f468-1f468-1f466"],isCanonical:!0},":family_mmg:":{unicode:["1f468-200d-1f468-200d-1f467","1f468-1f468-1f467"],isCanonical:!0},":family_mwg:":{unicode:["1f468-200d-1f469-200d-1f467","1f468-1f469-1f467"],isCanonical:!0},":family_wwb:":{unicode:["1f469-200d-1f469-200d-1f466","1f469-1f469-1f466"],isCanonical:!0},":family_wwg:":{unicode:["1f469-200d-1f469-200d-1f467","1f469-1f469-1f467"],isCanonical:!0},":eye_in_speech_bubble:":{unicode:["1f441-200d-1f5e8","1f441-1f5e8"],isCanonical:!0},":hash:":{unicode:["0023-fe0f-20e3","0023-20e3"],isCanonical:!0},":zero:":{unicode:["0030-fe0f-20e3","0030-20e3"],isCanonical:!0},":one:":{unicode:["0031-fe0f-20e3","0031-20e3"],isCanonical:!0},":two:":{unicode:["0032-fe0f-20e3","0032-20e3"],isCanonical:!0},":three:":{unicode:["0033-fe0f-20e3","0033-20e3"],isCanonical:!0},":four:":{unicode:["0034-fe0f-20e3","0034-20e3"],isCanonical:!0},":five:":{unicode:["0035-fe0f-20e3","0035-20e3"],isCanonical:!0},":six:":{unicode:["0036-fe0f-20e3","0036-20e3"],isCanonical:!0},":seven:":{unicode:["0037-fe0f-20e3","0037-20e3"],isCanonical:!0},":eight:":{unicode:["0038-fe0f-20e3","0038-20e3"],isCanonical:!0},":nine:":{unicode:["0039-fe0f-20e3","0039-20e3"],isCanonical:!0},":asterisk:":{unicode:["002a-fe0f-20e3","002a-20e3"],isCanonical:!0},":keycap_asterisk:":{unicode:["002a-fe0f-20e3","002a-20e3"],isCanonical:!1},":metal_tone5:":{unicode:["1f918-1f3ff"],isCanonical:!0},":sign_of_the_horns_tone5:":{unicode:["1f918-1f3ff"],isCanonical:!1},":metal_tone4:":{unicode:["1f918-1f3fe"],isCanonical:!0},":sign_of_the_horns_tone4:":{unicode:["1f918-1f3fe"],isCanonical:!1},":metal_tone3:":{unicode:["1f918-1f3fd"],isCanonical:!0},":sign_of_the_horns_tone3:":{unicode:["1f918-1f3fd"],isCanonical:!1},":metal_tone2:":{unicode:["1f918-1f3fc"],isCanonical:!0},":sign_of_the_horns_tone2:":{unicode:["1f918-1f3fc"],isCanonical:!1},":metal_tone1:":{unicode:["1f918-1f3fb"],isCanonical:!0},":sign_of_the_horns_tone1:":{unicode:["1f918-1f3fb"],isCanonical:!1},":bath_tone5:":{unicode:["1f6c0-1f3ff"],isCanonical:!0},":bath_tone4:":{unicode:["1f6c0-1f3fe"],isCanonical:!0},":bath_tone3:":{unicode:["1f6c0-1f3fd"],isCanonical:!0},":bath_tone2:":{unicode:["1f6c0-1f3fc"],isCanonical:!0},":bath_tone1:":{unicode:["1f6c0-1f3fb"],isCanonical:!0},":walking_tone5:":{unicode:["1f6b6-1f3ff"],isCanonical:!0},":walking_tone4:":{unicode:["1f6b6-1f3fe"],isCanonical:!0},":walking_tone3:":{unicode:["1f6b6-1f3fd"],isCanonical:!0},":walking_tone2:":{unicode:["1f6b6-1f3fc"],isCanonical:!0},":walking_tone1:":{unicode:["1f6b6-1f3fb"],isCanonical:!0},":mountain_bicyclist_tone5:":{unicode:["1f6b5-1f3ff"],isCanonical:!0},":mountain_bicyclist_tone4:":{unicode:["1f6b5-1f3fe"],isCanonical:!0},":mountain_bicyclist_tone3:":{unicode:["1f6b5-1f3fd"],isCanonical:!0},":mountain_bicyclist_tone2:":{unicode:["1f6b5-1f3fc"],isCanonical:!0},":mountain_bicyclist_tone1:":{unicode:["1f6b5-1f3fb"],isCanonical:!0},":bicyclist_tone5:":{unicode:["1f6b4-1f3ff"],isCanonical:!0},":bicyclist_tone4:":{unicode:["1f6b4-1f3fe"],isCanonical:!0},":bicyclist_tone3:":{unicode:["1f6b4-1f3fd"],isCanonical:!0},":bicyclist_tone2:":{unicode:["1f6b4-1f3fc"],isCanonical:!0},":bicyclist_tone1:":{unicode:["1f6b4-1f3fb"],isCanonical:!0},":rowboat_tone5:":{unicode:["1f6a3-1f3ff"],isCanonical:!0},":rowboat_tone4:":{unicode:["1f6a3-1f3fe"],isCanonical:!0},":rowboat_tone3:":{unicode:["1f6a3-1f3fd"],isCanonical:!0},":rowboat_tone2:":{unicode:["1f6a3-1f3fc"],isCanonical:!0},":rowboat_tone1:":{unicode:["1f6a3-1f3fb"],isCanonical:!0},":pray_tone5:":{unicode:["1f64f-1f3ff"],isCanonical:!0},":pray_tone4:":{unicode:["1f64f-1f3fe"],isCanonical:!0},":pray_tone3:":{unicode:["1f64f-1f3fd"],isCanonical:!0},":pray_tone2:":{unicode:["1f64f-1f3fc"],isCanonical:!0},":pray_tone1:":{unicode:["1f64f-1f3fb"],isCanonical:!0},":person_with_pouting_face_tone5:":{unicode:["1f64e-1f3ff"],isCanonical:!0},":person_with_pouting_face_tone4:":{unicode:["1f64e-1f3fe"],isCanonical:!0},":person_with_pouting_face_tone3:":{unicode:["1f64e-1f3fd"],isCanonical:!0},":person_with_pouting_face_tone2:":{unicode:["1f64e-1f3fc"],isCanonical:!0},":person_with_pouting_face_tone1:":{unicode:["1f64e-1f3fb"],isCanonical:!0},":person_frowning_tone5:":{unicode:["1f64d-1f3ff"],isCanonical:!0},":person_frowning_tone4:":{unicode:["1f64d-1f3fe"],isCanonical:!0},":person_frowning_tone3:":{unicode:["1f64d-1f3fd"],isCanonical:!0},":person_frowning_tone2:":{unicode:["1f64d-1f3fc"],isCanonical:!0},":person_frowning_tone1:":{unicode:["1f64d-1f3fb"],isCanonical:!0},":raised_hands_tone5:":{unicode:["1f64c-1f3ff"],isCanonical:!0},":raised_hands_tone4:":{unicode:["1f64c-1f3fe"],isCanonical:!0},":raised_hands_tone3:":{unicode:["1f64c-1f3fd"],isCanonical:!0},":raised_hands_tone2:":{unicode:["1f64c-1f3fc"],isCanonical:!0},":raised_hands_tone1:":{unicode:["1f64c-1f3fb"],isCanonical:!0},":raising_hand_tone5:":{unicode:["1f64b-1f3ff"],isCanonical:!0},":raising_hand_tone4:":{unicode:["1f64b-1f3fe"],isCanonical:!0},":raising_hand_tone3:":{unicode:["1f64b-1f3fd"],isCanonical:!0},":raising_hand_tone2:":{unicode:["1f64b-1f3fc"],isCanonical:!0},":raising_hand_tone1:":{unicode:["1f64b-1f3fb"],isCanonical:!0},":bow_tone5:":{unicode:["1f647-1f3ff"],isCanonical:!0},":bow_tone4:":{unicode:["1f647-1f3fe"],isCanonical:!0},":bow_tone3:":{unicode:["1f647-1f3fd"],isCanonical:!0},":bow_tone2:":{unicode:["1f647-1f3fc"],isCanonical:!0},":bow_tone1:":{unicode:["1f647-1f3fb"],isCanonical:!0},":ok_woman_tone5:":{unicode:["1f646-1f3ff"],isCanonical:!0},":ok_woman_tone4:":{unicode:["1f646-1f3fe"],isCanonical:!0},":ok_woman_tone3:":{unicode:["1f646-1f3fd"],isCanonical:!0},":ok_woman_tone2:":{unicode:["1f646-1f3fc"],isCanonical:!0},":ok_woman_tone1:":{unicode:["1f646-1f3fb"],isCanonical:!0},":no_good_tone5:":{unicode:["1f645-1f3ff"],isCanonical:!0},":no_good_tone4:":{unicode:["1f645-1f3fe"],isCanonical:!0},":no_good_tone3:":{unicode:["1f645-1f3fd"],isCanonical:!0},":no_good_tone2:":{unicode:["1f645-1f3fc"],isCanonical:!0},":no_good_tone1:":{unicode:["1f645-1f3fb"],isCanonical:!0},":vulcan_tone5:":{unicode:["1f596-1f3ff"],isCanonical:!0},":raised_hand_with_part_between_middle_and_ring_fingers_tone5:":{unicode:["1f596-1f3ff"],isCanonical:!1},":vulcan_tone4:":{unicode:["1f596-1f3fe"],isCanonical:!0},":raised_hand_with_part_between_middle_and_ring_fingers_tone4:":{unicode:["1f596-1f3fe"],isCanonical:!1},":vulcan_tone3:":{unicode:["1f596-1f3fd"],isCanonical:!0},":raised_hand_with_part_between_middle_and_ring_fingers_tone3:":{unicode:["1f596-1f3fd"],isCanonical:!1},":vulcan_tone2:":{unicode:["1f596-1f3fc"],isCanonical:!0},":raised_hand_with_part_between_middle_and_ring_fingers_tone2:":{unicode:["1f596-1f3fc"],isCanonical:!1},":vulcan_tone1:":{unicode:["1f596-1f3fb"],isCanonical:!0},":raised_hand_with_part_between_middle_and_ring_fingers_tone1:":{unicode:["1f596-1f3fb"],isCanonical:!1},":middle_finger_tone5:":{unicode:["1f595-1f3ff"],isCanonical:!0},":reversed_hand_with_middle_finger_extended_tone5:":{unicode:["1f595-1f3ff"],isCanonical:!1},":middle_finger_tone4:":{unicode:["1f595-1f3fe"],isCanonical:!0},":reversed_hand_with_middle_finger_extended_tone4:":{unicode:["1f595-1f3fe"],isCanonical:!1},":middle_finger_tone3:":{unicode:["1f595-1f3fd"],isCanonical:!0},":reversed_hand_with_middle_finger_extended_tone3:":{unicode:["1f595-1f3fd"],isCanonical:!1},":middle_finger_tone2:":{unicode:["1f595-1f3fc"],isCanonical:!0},":reversed_hand_with_middle_finger_extended_tone2:":{unicode:["1f595-1f3fc"],isCanonical:!1},":middle_finger_tone1:":{unicode:["1f595-1f3fb"],isCanonical:!0},":reversed_hand_with_middle_finger_extended_tone1:":{unicode:["1f595-1f3fb"],isCanonical:!1},":hand_splayed_tone5:":{unicode:["1f590-1f3ff"],isCanonical:!0},":raised_hand_with_fingers_splayed_tone5:":{unicode:["1f590-1f3ff"],isCanonical:!1},":hand_splayed_tone4:":{unicode:["1f590-1f3fe"],isCanonical:!0},":raised_hand_with_fingers_splayed_tone4:":{unicode:["1f590-1f3fe"],isCanonical:!1},":hand_splayed_tone3:":{unicode:["1f590-1f3fd"],isCanonical:!0},":raised_hand_with_fingers_splayed_tone3:":{unicode:["1f590-1f3fd"],isCanonical:!1},":hand_splayed_tone2:":{unicode:["1f590-1f3fc"],isCanonical:!0},":raised_hand_with_fingers_splayed_tone2:":{unicode:["1f590-1f3fc"],isCanonical:!1},":hand_splayed_tone1:":{unicode:["1f590-1f3fb"],isCanonical:!0},":raised_hand_with_fingers_splayed_tone1:":{unicode:["1f590-1f3fb"],isCanonical:!1},":spy_tone5:":{unicode:["1f575-1f3ff"],isCanonical:!0},":sleuth_or_spy_tone5:":{unicode:["1f575-1f3ff"],isCanonical:!1},":spy_tone4:":{unicode:["1f575-1f3fe"],isCanonical:!0},":sleuth_or_spy_tone4:":{unicode:["1f575-1f3fe"],isCanonical:!1},":spy_tone3:":{unicode:["1f575-1f3fd"],isCanonical:!0},":sleuth_or_spy_tone3:":{unicode:["1f575-1f3fd"],isCanonical:!1},":spy_tone2:":{unicode:["1f575-1f3fc"],isCanonical:!0},":sleuth_or_spy_tone2:":{unicode:["1f575-1f3fc"],isCanonical:!1},":spy_tone1:":{unicode:["1f575-1f3fb"],isCanonical:!0},":sleuth_or_spy_tone1:":{unicode:["1f575-1f3fb"],isCanonical:!1},":muscle_tone5:":{unicode:["1f4aa-1f3ff"],isCanonical:!0},":muscle_tone4:":{unicode:["1f4aa-1f3fe"],isCanonical:!0},":muscle_tone3:":{unicode:["1f4aa-1f3fd"],isCanonical:!0},":muscle_tone2:":{unicode:["1f4aa-1f3fc"],isCanonical:!0},":muscle_tone1:":{unicode:["1f4aa-1f3fb"],isCanonical:!0},":haircut_tone5:":{unicode:["1f487-1f3ff"],isCanonical:!0},":haircut_tone4:":{unicode:["1f487-1f3fe"],isCanonical:!0},":haircut_tone3:":{unicode:["1f487-1f3fd"],isCanonical:!0},":haircut_tone2:":{unicode:["1f487-1f3fc"],isCanonical:!0},":haircut_tone1:":{unicode:["1f487-1f3fb"],isCanonical:!0},":massage_tone5:":{unicode:["1f486-1f3ff"],isCanonical:!0},":massage_tone4:":{unicode:["1f486-1f3fe"],isCanonical:!0},":massage_tone3:":{unicode:["1f486-1f3fd"],isCanonical:!0},":massage_tone2:":{unicode:["1f486-1f3fc"],isCanonical:!0},":massage_tone1:":{unicode:["1f486-1f3fb"],isCanonical:!0},":nail_care_tone5:":{unicode:["1f485-1f3ff"],isCanonical:!0},":nail_care_tone4:":{unicode:["1f485-1f3fe"],isCanonical:!0},":nail_care_tone3:":{unicode:["1f485-1f3fd"],isCanonical:!0},":nail_care_tone2:":{unicode:["1f485-1f3fc"],isCanonical:!0},":nail_care_tone1:":{unicode:["1f485-1f3fb"],isCanonical:!0},":dancer_tone5:":{unicode:["1f483-1f3ff"],isCanonical:!0},":dancer_tone4:":{unicode:["1f483-1f3fe"],isCanonical:!0},":dancer_tone3:":{unicode:["1f483-1f3fd"],isCanonical:!0},":dancer_tone2:":{unicode:["1f483-1f3fc"],isCanonical:!0},":dancer_tone1:":{unicode:["1f483-1f3fb"],isCanonical:!0},":guardsman_tone5:":{unicode:["1f482-1f3ff"],isCanonical:!0},":guardsman_tone4:":{unicode:["1f482-1f3fe"],isCanonical:!0},":guardsman_tone3:":{unicode:["1f482-1f3fd"],isCanonical:!0},":guardsman_tone2:":{unicode:["1f482-1f3fc"],isCanonical:!0},":guardsman_tone1:":{unicode:["1f482-1f3fb"],isCanonical:!0},":information_desk_person_tone5:":{unicode:["1f481-1f3ff"],isCanonical:!0},":information_desk_person_tone4:":{unicode:["1f481-1f3fe"],isCanonical:!0},":information_desk_person_tone3:":{unicode:["1f481-1f3fd"],isCanonical:!0},":information_desk_person_tone2:":{unicode:["1f481-1f3fc"],isCanonical:!0},":information_desk_person_tone1:":{unicode:["1f481-1f3fb"],isCanonical:!0},":angel_tone5:":{unicode:["1f47c-1f3ff"],isCanonical:!0},":angel_tone4:":{unicode:["1f47c-1f3fe"],isCanonical:!0},":angel_tone3:":{unicode:["1f47c-1f3fd"],isCanonical:!0},":angel_tone2:":{unicode:["1f47c-1f3fc"],isCanonical:!0},":angel_tone1:":{unicode:["1f47c-1f3fb"],isCanonical:!0},":princess_tone5:":{unicode:["1f478-1f3ff"],isCanonical:!0},":princess_tone4:":{unicode:["1f478-1f3fe"],isCanonical:!0},":princess_tone3:":{unicode:["1f478-1f3fd"],isCanonical:!0},":princess_tone2:":{unicode:["1f478-1f3fc"],isCanonical:!0},":princess_tone1:":{unicode:["1f478-1f3fb"],isCanonical:!0},":construction_worker_tone5:":{unicode:["1f477-1f3ff"],isCanonical:!0},":construction_worker_tone4:":{unicode:["1f477-1f3fe"],isCanonical:!0},":construction_worker_tone3:":{unicode:["1f477-1f3fd"],isCanonical:!0},":construction_worker_tone2:":{unicode:["1f477-1f3fc"],isCanonical:!0},":construction_worker_tone1:":{unicode:["1f477-1f3fb"],isCanonical:!0},":baby_tone5:":{unicode:["1f476-1f3ff"],isCanonical:!0},":baby_tone4:":{unicode:["1f476-1f3fe"],isCanonical:!0},":baby_tone3:":{unicode:["1f476-1f3fd"],isCanonical:!0},":baby_tone2:":{unicode:["1f476-1f3fc"],isCanonical:!0},":baby_tone1:":{unicode:["1f476-1f3fb"],isCanonical:!0},":older_woman_tone5:":{unicode:["1f475-1f3ff"],isCanonical:!0},":grandma_tone5:":{unicode:["1f475-1f3ff"],isCanonical:!1},":older_woman_tone4:":{unicode:["1f475-1f3fe"],isCanonical:!0},":grandma_tone4:":{unicode:["1f475-1f3fe"],isCanonical:!1},":older_woman_tone3:":{unicode:["1f475-1f3fd"],isCanonical:!0},":grandma_tone3:":{unicode:["1f475-1f3fd"],isCanonical:!1},":older_woman_tone2:":{unicode:["1f475-1f3fc"],isCanonical:!0},":grandma_tone2:":{unicode:["1f475-1f3fc"],isCanonical:!1},":older_woman_tone1:":{unicode:["1f475-1f3fb"],isCanonical:!0},":grandma_tone1:":{unicode:["1f475-1f3fb"],isCanonical:!1},":older_man_tone5:":{unicode:["1f474-1f3ff"],isCanonical:!0},":older_man_tone4:":{unicode:["1f474-1f3fe"],isCanonical:!0},":older_man_tone3:":{unicode:["1f474-1f3fd"],isCanonical:!0},":older_man_tone2:":{unicode:["1f474-1f3fc"],isCanonical:!0},":older_man_tone1:":{unicode:["1f474-1f3fb"],isCanonical:!0},":man_with_turban_tone5:":{unicode:["1f473-1f3ff"],isCanonical:!0},":man_with_turban_tone4:":{unicode:["1f473-1f3fe"],isCanonical:!0},":man_with_turban_tone3:":{unicode:["1f473-1f3fd"],isCanonical:!0},":man_with_turban_tone2:":{unicode:["1f473-1f3fc"],isCanonical:!0},":man_with_turban_tone1:":{unicode:["1f473-1f3fb"],isCanonical:!0},":man_with_gua_pi_mao_tone5:":{unicode:["1f472-1f3ff"],isCanonical:!0},":man_with_gua_pi_mao_tone4:":{unicode:["1f472-1f3fe"],isCanonical:!0},":man_with_gua_pi_mao_tone3:":{unicode:["1f472-1f3fd"],isCanonical:!0},":man_with_gua_pi_mao_tone2:":{unicode:["1f472-1f3fc"],isCanonical:!0},":man_with_gua_pi_mao_tone1:":{unicode:["1f472-1f3fb"],isCanonical:!0},":person_with_blond_hair_tone5:":{unicode:["1f471-1f3ff"],isCanonical:!0},":person_with_blond_hair_tone4:":{unicode:["1f471-1f3fe"],isCanonical:!0},":person_with_blond_hair_tone3:":{unicode:["1f471-1f3fd"],isCanonical:!0},":person_with_blond_hair_tone2:":{unicode:["1f471-1f3fc"],isCanonical:!0},":person_with_blond_hair_tone1:":{unicode:["1f471-1f3fb"],isCanonical:!0},":bride_with_veil_tone5:":{unicode:["1f470-1f3ff"],isCanonical:!0},":bride_with_veil_tone4:":{unicode:["1f470-1f3fe"],isCanonical:!0},":bride_with_veil_tone3:":{unicode:["1f470-1f3fd"],isCanonical:!0},":bride_with_veil_tone2:":{unicode:["1f470-1f3fc"],isCanonical:!0},":bride_with_veil_tone1:":{unicode:["1f470-1f3fb"],isCanonical:!0},":cop_tone5:":{unicode:["1f46e-1f3ff"],isCanonical:!0},":cop_tone4:":{unicode:["1f46e-1f3fe"],isCanonical:!0},":cop_tone3:":{unicode:["1f46e-1f3fd"],isCanonical:!0},":cop_tone2:":{unicode:["1f46e-1f3fc"],isCanonical:!0},":cop_tone1:":{unicode:["1f46e-1f3fb"],isCanonical:!0},":woman_tone5:":{unicode:["1f469-1f3ff"],isCanonical:!0},":woman_tone4:":{unicode:["1f469-1f3fe"],isCanonical:!0},":woman_tone3:":{unicode:["1f469-1f3fd"],isCanonical:!0},":woman_tone2:":{unicode:["1f469-1f3fc"],isCanonical:!0},":woman_tone1:":{unicode:["1f469-1f3fb"],isCanonical:!0},":man_tone5:":{unicode:["1f468-1f3ff"],isCanonical:!0},":man_tone4:":{unicode:["1f468-1f3fe"],isCanonical:!0},":man_tone3:":{unicode:["1f468-1f3fd"],isCanonical:!0},":man_tone2:":{unicode:["1f468-1f3fc"],isCanonical:!0},":man_tone1:":{unicode:["1f468-1f3fb"],isCanonical:!0},":girl_tone5:":{unicode:["1f467-1f3ff"],isCanonical:!0},":girl_tone4:":{unicode:["1f467-1f3fe"],isCanonical:!0},":girl_tone3:":{unicode:["1f467-1f3fd"],isCanonical:!0},":girl_tone2:":{unicode:["1f467-1f3fc"],isCanonical:!0},":girl_tone1:":{unicode:["1f467-1f3fb"],isCanonical:!0},":boy_tone5:":{unicode:["1f466-1f3ff"],isCanonical:!0},":boy_tone4:":{unicode:["1f466-1f3fe"],isCanonical:!0},":boy_tone3:":{unicode:["1f466-1f3fd"],isCanonical:!0},":boy_tone2:":{unicode:["1f466-1f3fc"],isCanonical:!0},":boy_tone1:":{unicode:["1f466-1f3fb"],isCanonical:!0},":open_hands_tone5:":{unicode:["1f450-1f3ff"],isCanonical:!0},":open_hands_tone4:":{unicode:["1f450-1f3fe"],isCanonical:!0},":open_hands_tone3:":{unicode:["1f450-1f3fd"],isCanonical:!0},":open_hands_tone2:":{unicode:["1f450-1f3fc"],isCanonical:!0},":open_hands_tone1:":{unicode:["1f450-1f3fb"],isCanonical:!0},":clap_tone5:":{unicode:["1f44f-1f3ff"],isCanonical:!0},":clap_tone4:":{unicode:["1f44f-1f3fe"],isCanonical:!0},":clap_tone3:":{unicode:["1f44f-1f3fd"],isCanonical:!0},":clap_tone2:":{unicode:["1f44f-1f3fc"],isCanonical:!0},":clap_tone1:":{unicode:["1f44f-1f3fb"],isCanonical:!0},":thumbsdown_tone5:":{unicode:["1f44e-1f3ff"],isCanonical:!0},":-1_tone5:":{unicode:["1f44e-1f3ff"],isCanonical:!1},":thumbsdown_tone4:":{unicode:["1f44e-1f3fe"],isCanonical:!0},":-1_tone4:":{unicode:["1f44e-1f3fe"],isCanonical:!1},":thumbsdown_tone3:":{unicode:["1f44e-1f3fd"],isCanonical:!0},":-1_tone3:":{unicode:["1f44e-1f3fd"],isCanonical:!1},":thumbsdown_tone2:":{unicode:["1f44e-1f3fc"],isCanonical:!0},":-1_tone2:":{unicode:["1f44e-1f3fc"],isCanonical:!1},":thumbsdown_tone1:":{unicode:["1f44e-1f3fb"],isCanonical:!0},":-1_tone1:":{unicode:["1f44e-1f3fb"],isCanonical:!1},":thumbsup_tone5:":{unicode:["1f44d-1f3ff"],isCanonical:!0},":+1_tone5:":{unicode:["1f44d-1f3ff"],isCanonical:!1},":thumbsup_tone4:":{unicode:["1f44d-1f3fe"],isCanonical:!0},":+1_tone4:":{unicode:["1f44d-1f3fe"],isCanonical:!1},":thumbsup_tone3:":{unicode:["1f44d-1f3fd"],isCanonical:!0},":+1_tone3:":{unicode:["1f44d-1f3fd"],isCanonical:!1},":thumbsup_tone2:":{unicode:["1f44d-1f3fc"],isCanonical:!0},":+1_tone2:":{unicode:["1f44d-1f3fc"],isCanonical:!1},":thumbsup_tone1:":{unicode:["1f44d-1f3fb"],isCanonical:!0},":+1_tone1:":{unicode:["1f44d-1f3fb"],isCanonical:!1},":ok_hand_tone5:":{unicode:["1f44c-1f3ff"],isCanonical:!0},":ok_hand_tone4:":{unicode:["1f44c-1f3fe"],isCanonical:!0},":ok_hand_tone3:":{unicode:["1f44c-1f3fd"],isCanonical:!0},":ok_hand_tone2:":{unicode:["1f44c-1f3fc"],isCanonical:!0},":ok_hand_tone1:":{unicode:["1f44c-1f3fb"],isCanonical:!0},":wave_tone5:":{unicode:["1f44b-1f3ff"],isCanonical:!0},":wave_tone4:":{unicode:["1f44b-1f3fe"],isCanonical:!0},":wave_tone3:":{unicode:["1f44b-1f3fd"],isCanonical:!0},":wave_tone2:":{unicode:["1f44b-1f3fc"],isCanonical:!0},":wave_tone1:":{unicode:["1f44b-1f3fb"],isCanonical:!0},":punch_tone5:":{unicode:["1f44a-1f3ff"],isCanonical:!0},":punch_tone4:":{unicode:["1f44a-1f3fe"],isCanonical:!0},":punch_tone3:":{unicode:["1f44a-1f3fd"],isCanonical:!0},":punch_tone2:":{unicode:["1f44a-1f3fc"],isCanonical:!0},":punch_tone1:":{unicode:["1f44a-1f3fb"],isCanonical:!0},":point_right_tone5:":{unicode:["1f449-1f3ff"],isCanonical:!0},":point_right_tone4:":{unicode:["1f449-1f3fe"],isCanonical:!0},":point_right_tone3:":{unicode:["1f449-1f3fd"],isCanonical:!0},":point_right_tone2:":{unicode:["1f449-1f3fc"],isCanonical:!0},":point_right_tone1:":{unicode:["1f449-1f3fb"],isCanonical:!0},":point_left_tone5:":{unicode:["1f448-1f3ff"],isCanonical:!0},":point_left_tone4:":{unicode:["1f448-1f3fe"],isCanonical:!0},":point_left_tone3:":{unicode:["1f448-1f3fd"],isCanonical:!0},":point_left_tone2:":{unicode:["1f448-1f3fc"],isCanonical:!0},":point_left_tone1:":{unicode:["1f448-1f3fb"],isCanonical:!0},":point_down_tone5:":{unicode:["1f447-1f3ff"],isCanonical:!0},":point_down_tone4:":{unicode:["1f447-1f3fe"],isCanonical:!0},":point_down_tone3:":{unicode:["1f447-1f3fd"],isCanonical:!0},":point_down_tone2:":{unicode:["1f447-1f3fc"],isCanonical:!0},":point_down_tone1:":{unicode:["1f447-1f3fb"],isCanonical:!0},":point_up_2_tone5:":{unicode:["1f446-1f3ff"],isCanonical:!0},":point_up_2_tone4:":{unicode:["1f446-1f3fe"],isCanonical:!0},":point_up_2_tone3:":{unicode:["1f446-1f3fd"],isCanonical:!0},":point_up_2_tone2:":{unicode:["1f446-1f3fc"],isCanonical:!0},":point_up_2_tone1:":{unicode:["1f446-1f3fb"],isCanonical:!0},":nose_tone5:":{unicode:["1f443-1f3ff"],isCanonical:!0},":nose_tone4:":{unicode:["1f443-1f3fe"],isCanonical:!0},":nose_tone3:":{unicode:["1f443-1f3fd"],isCanonical:!0},":nose_tone2:":{unicode:["1f443-1f3fc"],isCanonical:!0},":nose_tone1:":{unicode:["1f443-1f3fb"],isCanonical:!0},":ear_tone5:":{unicode:["1f442-1f3ff"],isCanonical:!0},":ear_tone4:":{unicode:["1f442-1f3fe"],isCanonical:!0},":ear_tone3:":{unicode:["1f442-1f3fd"],isCanonical:!0},":ear_tone2:":{unicode:["1f442-1f3fc"],isCanonical:!0},":ear_tone1:":{unicode:["1f442-1f3fb"],isCanonical:!0},":lifter_tone5:":{unicode:["1f3cb-1f3ff"],isCanonical:!0},":weight_lifter_tone5:":{unicode:["1f3cb-1f3ff"],isCanonical:!1},":lifter_tone4:":{unicode:["1f3cb-1f3fe"],isCanonical:!0},":weight_lifter_tone4:":{unicode:["1f3cb-1f3fe"],isCanonical:!1},":lifter_tone3:":{unicode:["1f3cb-1f3fd"],isCanonical:!0},":weight_lifter_tone3:":{unicode:["1f3cb-1f3fd"],isCanonical:!1},":lifter_tone2:":{unicode:["1f3cb-1f3fc"],isCanonical:!0},":weight_lifter_tone2:":{unicode:["1f3cb-1f3fc"],isCanonical:!1},":lifter_tone1:":{unicode:["1f3cb-1f3fb"],isCanonical:!0},":weight_lifter_tone1:":{unicode:["1f3cb-1f3fb"],isCanonical:!1},":swimmer_tone5:":{unicode:["1f3ca-1f3ff"],isCanonical:!0},":swimmer_tone4:":{unicode:["1f3ca-1f3fe"],isCanonical:!0},":swimmer_tone3:":{unicode:["1f3ca-1f3fd"],isCanonical:!0},":swimmer_tone2:":{unicode:["1f3ca-1f3fc"],isCanonical:!0},":swimmer_tone1:":{unicode:["1f3ca-1f3fb"],isCanonical:!0},":horse_racing_tone5:":{unicode:["1f3c7-1f3ff"],isCanonical:!0},":horse_racing_tone4:":{unicode:["1f3c7-1f3fe"],isCanonical:!0},":horse_racing_tone3:":{unicode:["1f3c7-1f3fd"],isCanonical:!0},":horse_racing_tone2:":{unicode:["1f3c7-1f3fc"],isCanonical:!0},":horse_racing_tone1:":{unicode:["1f3c7-1f3fb"],isCanonical:!0},":surfer_tone5:":{unicode:["1f3c4-1f3ff"],isCanonical:!0},":surfer_tone4:":{unicode:["1f3c4-1f3fe"],isCanonical:!0},":surfer_tone3:":{unicode:["1f3c4-1f3fd"],isCanonical:!0},":surfer_tone2:":{unicode:["1f3c4-1f3fc"],isCanonical:!0},":surfer_tone1:":{unicode:["1f3c4-1f3fb"],isCanonical:!0},":runner_tone5:":{unicode:["1f3c3-1f3ff"],isCanonical:!0},":runner_tone4:":{unicode:["1f3c3-1f3fe"],isCanonical:!0},":runner_tone3:":{unicode:["1f3c3-1f3fd"],isCanonical:!0},":runner_tone2:":{unicode:["1f3c3-1f3fc"],isCanonical:!0},":runner_tone1:":{unicode:["1f3c3-1f3fb"],isCanonical:!0},":santa_tone5:":{unicode:["1f385-1f3ff"],isCanonical:!0},":santa_tone4:":{unicode:["1f385-1f3fe"],isCanonical:!0},":santa_tone3:":{unicode:["1f385-1f3fd"],isCanonical:!0},":santa_tone2:":{unicode:["1f385-1f3fc"],isCanonical:!0},":santa_tone1:":{unicode:["1f385-1f3fb"],isCanonical:!0},":flag_zw:":{unicode:["1f1ff-1f1fc"],isCanonical:!0},":zw:":{unicode:["1f1ff-1f1fc"],isCanonical:!1},":flag_zm:":{unicode:["1f1ff-1f1f2"],isCanonical:!0},":zm:":{unicode:["1f1ff-1f1f2"],isCanonical:!1},":flag_za:":{unicode:["1f1ff-1f1e6"],isCanonical:!0},":za:":{unicode:["1f1ff-1f1e6"],isCanonical:!1},":flag_yt:":{unicode:["1f1fe-1f1f9"],isCanonical:!0},":yt:":{unicode:["1f1fe-1f1f9"],isCanonical:!1},":flag_ye:":{unicode:["1f1fe-1f1ea"],isCanonical:!0},":ye:":{unicode:["1f1fe-1f1ea"],isCanonical:!1},":flag_xk:":{unicode:["1f1fd-1f1f0"],isCanonical:!0},":xk:":{unicode:["1f1fd-1f1f0"],isCanonical:!1},":flag_ws:":{unicode:["1f1fc-1f1f8"],isCanonical:!0},":ws:":{unicode:["1f1fc-1f1f8"],isCanonical:!1},":flag_wf:":{unicode:["1f1fc-1f1eb"],isCanonical:!0},":wf:":{unicode:["1f1fc-1f1eb"],isCanonical:!1},":flag_vu:":{unicode:["1f1fb-1f1fa"],isCanonical:!0},":vu:":{unicode:["1f1fb-1f1fa"],isCanonical:!1},":flag_vn:":{unicode:["1f1fb-1f1f3"],isCanonical:!0},":vn:":{unicode:["1f1fb-1f1f3"],isCanonical:!1},":flag_vi:":{unicode:["1f1fb-1f1ee"],isCanonical:!0},":vi:":{unicode:["1f1fb-1f1ee"],isCanonical:!1},":flag_vg:":{unicode:["1f1fb-1f1ec"],isCanonical:!0},":vg:":{unicode:["1f1fb-1f1ec"],isCanonical:!1},":flag_ve:":{unicode:["1f1fb-1f1ea"],isCanonical:!0},":ve:":{unicode:["1f1fb-1f1ea"],isCanonical:!1},":flag_vc:":{unicode:["1f1fb-1f1e8"],isCanonical:!0},":vc:":{unicode:["1f1fb-1f1e8"],isCanonical:!1},":flag_va:":{unicode:["1f1fb-1f1e6"],isCanonical:!0},":va:":{unicode:["1f1fb-1f1e6"],isCanonical:!1},":flag_uz:":{unicode:["1f1fa-1f1ff"],isCanonical:!0},":uz:":{unicode:["1f1fa-1f1ff"],isCanonical:!1},":flag_uy:":{unicode:["1f1fa-1f1fe"],isCanonical:!0},":uy:":{unicode:["1f1fa-1f1fe"],isCanonical:!1},":flag_us:":{unicode:["1f1fa-1f1f8"],isCanonical:!0},":us:":{unicode:["1f1fa-1f1f8"],isCanonical:!1},":flag_um:":{unicode:["1f1fa-1f1f2"],isCanonical:!0},":um:":{unicode:["1f1fa-1f1f2"],isCanonical:!1},":flag_ug:":{unicode:["1f1fa-1f1ec"],isCanonical:!0},":ug:":{unicode:["1f1fa-1f1ec"],isCanonical:!1},":flag_ua:":{unicode:["1f1fa-1f1e6"],isCanonical:!0},":ua:":{unicode:["1f1fa-1f1e6"],isCanonical:!1},":flag_tz:":{unicode:["1f1f9-1f1ff"],isCanonical:!0},":tz:":{unicode:["1f1f9-1f1ff"],isCanonical:!1},":flag_tw:":{unicode:["1f1f9-1f1fc"],isCanonical:!0},":tw:":{unicode:["1f1f9-1f1fc"],isCanonical:!1},":flag_tv:":{unicode:["1f1f9-1f1fb"],isCanonical:!0},":tuvalu:":{unicode:["1f1f9-1f1fb"],isCanonical:!1},":flag_tt:":{unicode:["1f1f9-1f1f9"],isCanonical:!0},":tt:":{unicode:["1f1f9-1f1f9"],isCanonical:!1},":flag_tr:":{unicode:["1f1f9-1f1f7"],isCanonical:!0},":tr:":{unicode:["1f1f9-1f1f7"],isCanonical:!1},":flag_to:":{unicode:["1f1f9-1f1f4"],isCanonical:!0},":to:":{unicode:["1f1f9-1f1f4"],isCanonical:!1},":flag_tn:":{unicode:["1f1f9-1f1f3"],isCanonical:!0},":tn:":{unicode:["1f1f9-1f1f3"],isCanonical:!1},":flag_tm:":{unicode:["1f1f9-1f1f2"],isCanonical:!0},":turkmenistan:":{unicode:["1f1f9-1f1f2"],isCanonical:!1},":flag_tl:":{unicode:["1f1f9-1f1f1"],isCanonical:!0},":tl:":{unicode:["1f1f9-1f1f1"],isCanonical:!1},":flag_tk:":{unicode:["1f1f9-1f1f0"],isCanonical:!0},":tk:":{unicode:["1f1f9-1f1f0"],isCanonical:!1},":flag_tj:":{unicode:["1f1f9-1f1ef"],isCanonical:!0},":tj:":{unicode:["1f1f9-1f1ef"],isCanonical:!1},":flag_th:":{unicode:["1f1f9-1f1ed"],isCanonical:!0},":th:":{unicode:["1f1f9-1f1ed"],isCanonical:!1},":flag_tg:":{unicode:["1f1f9-1f1ec"],isCanonical:!0},":tg:":{unicode:["1f1f9-1f1ec"],isCanonical:!1},":flag_tf:":{unicode:["1f1f9-1f1eb"],isCanonical:!0},":tf:":{unicode:["1f1f9-1f1eb"],isCanonical:!1},":flag_td:":{unicode:["1f1f9-1f1e9"],isCanonical:!0},":td:":{unicode:["1f1f9-1f1e9"],isCanonical:!1},":flag_tc:":{unicode:["1f1f9-1f1e8"],isCanonical:!0},":tc:":{unicode:["1f1f9-1f1e8"],isCanonical:!1},":flag_ta:":{unicode:["1f1f9-1f1e6"],isCanonical:!0},":ta:":{unicode:["1f1f9-1f1e6"],isCanonical:!1},":flag_sz:":{unicode:["1f1f8-1f1ff"],isCanonical:!0},":sz:":{unicode:["1f1f8-1f1ff"],isCanonical:!1},":flag_sy:":{unicode:["1f1f8-1f1fe"],isCanonical:!0},":sy:":{unicode:["1f1f8-1f1fe"],isCanonical:!1},":flag_sx:":{unicode:["1f1f8-1f1fd"],isCanonical:!0},":sx:":{unicode:["1f1f8-1f1fd"],isCanonical:!1},":flag_sv:":{unicode:["1f1f8-1f1fb"],isCanonical:!0},":sv:":{unicode:["1f1f8-1f1fb"],isCanonical:!1},":flag_st:":{unicode:["1f1f8-1f1f9"],isCanonical:!0},":st:":{unicode:["1f1f8-1f1f9"],isCanonical:!1},":flag_ss:":{unicode:["1f1f8-1f1f8"],isCanonical:!0},":ss:":{unicode:["1f1f8-1f1f8"],isCanonical:!1},":flag_sr:":{unicode:["1f1f8-1f1f7"],isCanonical:!0},":sr:":{unicode:["1f1f8-1f1f7"],isCanonical:!1},":flag_so:":{unicode:["1f1f8-1f1f4"],isCanonical:!0},":so:":{unicode:["1f1f8-1f1f4"],isCanonical:!1},":flag_sn:":{unicode:["1f1f8-1f1f3"],isCanonical:!0},":sn:":{unicode:["1f1f8-1f1f3"],isCanonical:!1},":flag_sm:":{unicode:["1f1f8-1f1f2"],isCanonical:!0},":sm:":{unicode:["1f1f8-1f1f2"],isCanonical:!1},":flag_sl:":{unicode:["1f1f8-1f1f1"],isCanonical:!0},":sl:":{unicode:["1f1f8-1f1f1"],isCanonical:!1},":flag_sk:":{unicode:["1f1f8-1f1f0"],isCanonical:!0},":sk:":{unicode:["1f1f8-1f1f0"],isCanonical:!1},":flag_sj:":{unicode:["1f1f8-1f1ef"],isCanonical:!0},":sj:":{unicode:["1f1f8-1f1ef"],isCanonical:!1},":flag_si:":{unicode:["1f1f8-1f1ee"],isCanonical:!0},":si:":{unicode:["1f1f8-1f1ee"],isCanonical:!1},":flag_sh:":{unicode:["1f1f8-1f1ed"],isCanonical:!0},":sh:":{unicode:["1f1f8-1f1ed"],isCanonical:!1},":flag_sg:":{unicode:["1f1f8-1f1ec"],isCanonical:!0},":sg:":{unicode:["1f1f8-1f1ec"],isCanonical:!1},":flag_se:":{unicode:["1f1f8-1f1ea"],isCanonical:!0},":se:":{unicode:["1f1f8-1f1ea"],isCanonical:!1},":flag_sd:":{unicode:["1f1f8-1f1e9"],isCanonical:!0},":sd:":{unicode:["1f1f8-1f1e9"],isCanonical:!1},":flag_sc:":{unicode:["1f1f8-1f1e8"],isCanonical:!0},":sc:":{unicode:["1f1f8-1f1e8"],isCanonical:!1},":flag_sb:":{unicode:["1f1f8-1f1e7"],isCanonical:!0},":sb:":{unicode:["1f1f8-1f1e7"],isCanonical:!1},":flag_sa:":{unicode:["1f1f8-1f1e6"],isCanonical:!0},":saudiarabia:":{unicode:["1f1f8-1f1e6"],isCanonical:!1},":saudi:":{unicode:["1f1f8-1f1e6"],isCanonical:!1},":flag_rw:":{unicode:["1f1f7-1f1fc"],isCanonical:!0},":rw:":{unicode:["1f1f7-1f1fc"],isCanonical:!1},":flag_ru:":{unicode:["1f1f7-1f1fa"],isCanonical:!0},":ru:":{unicode:["1f1f7-1f1fa"],isCanonical:!1},":flag_rs:":{unicode:["1f1f7-1f1f8"],isCanonical:!0},":rs:":{unicode:["1f1f7-1f1f8"],isCanonical:!1},":flag_ro:":{unicode:["1f1f7-1f1f4"],isCanonical:!0},":ro:":{unicode:["1f1f7-1f1f4"],isCanonical:!1},":flag_re:":{unicode:["1f1f7-1f1ea"],isCanonical:!0},":re:":{unicode:["1f1f7-1f1ea"],isCanonical:!1},":flag_qa:":{unicode:["1f1f6-1f1e6"],isCanonical:!0},":qa:":{unicode:["1f1f6-1f1e6"],isCanonical:!1},":flag_py:":{unicode:["1f1f5-1f1fe"],isCanonical:!0},":py:":{unicode:["1f1f5-1f1fe"],isCanonical:!1},":flag_pw:":{unicode:["1f1f5-1f1fc"],isCanonical:!0},":pw:":{unicode:["1f1f5-1f1fc"],isCanonical:!1},":flag_pt:":{unicode:["1f1f5-1f1f9"],isCanonical:!0},":pt:":{unicode:["1f1f5-1f1f9"],isCanonical:!1},":flag_ps:":{unicode:["1f1f5-1f1f8"],isCanonical:!0},":ps:":{unicode:["1f1f5-1f1f8"],isCanonical:!1},":flag_pr:":{unicode:["1f1f5-1f1f7"],isCanonical:!0},":pr:":{unicode:["1f1f5-1f1f7"],isCanonical:!1},":flag_pn:":{unicode:["1f1f5-1f1f3"],isCanonical:!0},":pn:":{unicode:["1f1f5-1f1f3"],isCanonical:!1},":flag_pm:":{unicode:["1f1f5-1f1f2"],isCanonical:!0},":pm:":{unicode:["1f1f5-1f1f2"],isCanonical:!1},":flag_pl:":{unicode:["1f1f5-1f1f1"],isCanonical:!0},":pl:":{unicode:["1f1f5-1f1f1"],isCanonical:!1},":flag_pk:":{unicode:["1f1f5-1f1f0"],isCanonical:!0},":pk:":{unicode:["1f1f5-1f1f0"],isCanonical:!1},":flag_ph:":{
    unicode:["1f1f5-1f1ed"],isCanonical:!0},":ph:":{unicode:["1f1f5-1f1ed"],isCanonical:!1},":flag_pg:":{unicode:["1f1f5-1f1ec"],isCanonical:!0},":pg:":{unicode:["1f1f5-1f1ec"],isCanonical:!1},":flag_pf:":{unicode:["1f1f5-1f1eb"],isCanonical:!0},":pf:":{unicode:["1f1f5-1f1eb"],isCanonical:!1},":flag_pe:":{unicode:["1f1f5-1f1ea"],isCanonical:!0},":pe:":{unicode:["1f1f5-1f1ea"],isCanonical:!1},":flag_pa:":{unicode:["1f1f5-1f1e6"],isCanonical:!0},":pa:":{unicode:["1f1f5-1f1e6"],isCanonical:!1},":flag_om:":{unicode:["1f1f4-1f1f2"],isCanonical:!0},":om:":{unicode:["1f1f4-1f1f2"],isCanonical:!1},":flag_nz:":{unicode:["1f1f3-1f1ff"],isCanonical:!0},":nz:":{unicode:["1f1f3-1f1ff"],isCanonical:!1},":flag_nu:":{unicode:["1f1f3-1f1fa"],isCanonical:!0},":nu:":{unicode:["1f1f3-1f1fa"],isCanonical:!1},":flag_nr:":{unicode:["1f1f3-1f1f7"],isCanonical:!0},":nr:":{unicode:["1f1f3-1f1f7"],isCanonical:!1},":flag_np:":{unicode:["1f1f3-1f1f5"],isCanonical:!0},":np:":{unicode:["1f1f3-1f1f5"],isCanonical:!1},":flag_no:":{unicode:["1f1f3-1f1f4"],isCanonical:!0},":no:":{unicode:["1f1f3-1f1f4"],isCanonical:!1},":flag_nl:":{unicode:["1f1f3-1f1f1"],isCanonical:!0},":nl:":{unicode:["1f1f3-1f1f1"],isCanonical:!1},":flag_ni:":{unicode:["1f1f3-1f1ee"],isCanonical:!0},":ni:":{unicode:["1f1f3-1f1ee"],isCanonical:!1},":flag_ng:":{unicode:["1f1f3-1f1ec"],isCanonical:!0},":nigeria:":{unicode:["1f1f3-1f1ec"],isCanonical:!1},":flag_nf:":{unicode:["1f1f3-1f1eb"],isCanonical:!0},":nf:":{unicode:["1f1f3-1f1eb"],isCanonical:!1},":flag_ne:":{unicode:["1f1f3-1f1ea"],isCanonical:!0},":ne:":{unicode:["1f1f3-1f1ea"],isCanonical:!1},":flag_nc:":{unicode:["1f1f3-1f1e8"],isCanonical:!0},":nc:":{unicode:["1f1f3-1f1e8"],isCanonical:!1},":flag_na:":{unicode:["1f1f3-1f1e6"],isCanonical:!0},":na:":{unicode:["1f1f3-1f1e6"],isCanonical:!1},":flag_mz:":{unicode:["1f1f2-1f1ff"],isCanonical:!0},":mz:":{unicode:["1f1f2-1f1ff"],isCanonical:!1},":flag_my:":{unicode:["1f1f2-1f1fe"],isCanonical:!0},":my:":{unicode:["1f1f2-1f1fe"],isCanonical:!1},":flag_mx:":{unicode:["1f1f2-1f1fd"],isCanonical:!0},":mx:":{unicode:["1f1f2-1f1fd"],isCanonical:!1},":flag_mw:":{unicode:["1f1f2-1f1fc"],isCanonical:!0},":mw:":{unicode:["1f1f2-1f1fc"],isCanonical:!1},":flag_mv:":{unicode:["1f1f2-1f1fb"],isCanonical:!0},":mv:":{unicode:["1f1f2-1f1fb"],isCanonical:!1},":flag_mu:":{unicode:["1f1f2-1f1fa"],isCanonical:!0},":mu:":{unicode:["1f1f2-1f1fa"],isCanonical:!1},":flag_mt:":{unicode:["1f1f2-1f1f9"],isCanonical:!0},":mt:":{unicode:["1f1f2-1f1f9"],isCanonical:!1},":flag_ms:":{unicode:["1f1f2-1f1f8"],isCanonical:!0},":ms:":{unicode:["1f1f2-1f1f8"],isCanonical:!1},":flag_mr:":{unicode:["1f1f2-1f1f7"],isCanonical:!0},":mr:":{unicode:["1f1f2-1f1f7"],isCanonical:!1},":flag_mq:":{unicode:["1f1f2-1f1f6"],isCanonical:!0},":mq:":{unicode:["1f1f2-1f1f6"],isCanonical:!1},":flag_mp:":{unicode:["1f1f2-1f1f5"],isCanonical:!0},":mp:":{unicode:["1f1f2-1f1f5"],isCanonical:!1},":flag_mo:":{unicode:["1f1f2-1f1f4"],isCanonical:!0},":mo:":{unicode:["1f1f2-1f1f4"],isCanonical:!1},":flag_mn:":{unicode:["1f1f2-1f1f3"],isCanonical:!0},":mn:":{unicode:["1f1f2-1f1f3"],isCanonical:!1},":flag_mm:":{unicode:["1f1f2-1f1f2"],isCanonical:!0},":mm:":{unicode:["1f1f2-1f1f2"],isCanonical:!1},":flag_ml:":{unicode:["1f1f2-1f1f1"],isCanonical:!0},":ml:":{unicode:["1f1f2-1f1f1"],isCanonical:!1},":flag_mk:":{unicode:["1f1f2-1f1f0"],isCanonical:!0},":mk:":{unicode:["1f1f2-1f1f0"],isCanonical:!1},":flag_mh:":{unicode:["1f1f2-1f1ed"],isCanonical:!0},":mh:":{unicode:["1f1f2-1f1ed"],isCanonical:!1},":flag_mg:":{unicode:["1f1f2-1f1ec"],isCanonical:!0},":mg:":{unicode:["1f1f2-1f1ec"],isCanonical:!1},":flag_mf:":{unicode:["1f1f2-1f1eb"],isCanonical:!0},":mf:":{unicode:["1f1f2-1f1eb"],isCanonical:!1},":flag_me:":{unicode:["1f1f2-1f1ea"],isCanonical:!0},":me:":{unicode:["1f1f2-1f1ea"],isCanonical:!1},":flag_md:":{unicode:["1f1f2-1f1e9"],isCanonical:!0},":md:":{unicode:["1f1f2-1f1e9"],isCanonical:!1},":flag_mc:":{unicode:["1f1f2-1f1e8"],isCanonical:!0},":mc:":{unicode:["1f1f2-1f1e8"],isCanonical:!1},":flag_ma:":{unicode:["1f1f2-1f1e6"],isCanonical:!0},":ma:":{unicode:["1f1f2-1f1e6"],isCanonical:!1},":flag_ly:":{unicode:["1f1f1-1f1fe"],isCanonical:!0},":ly:":{unicode:["1f1f1-1f1fe"],isCanonical:!1},":flag_lv:":{unicode:["1f1f1-1f1fb"],isCanonical:!0},":lv:":{unicode:["1f1f1-1f1fb"],isCanonical:!1},":flag_lu:":{unicode:["1f1f1-1f1fa"],isCanonical:!0},":lu:":{unicode:["1f1f1-1f1fa"],isCanonical:!1},":flag_lt:":{unicode:["1f1f1-1f1f9"],isCanonical:!0},":lt:":{unicode:["1f1f1-1f1f9"],isCanonical:!1},":flag_ls:":{unicode:["1f1f1-1f1f8"],isCanonical:!0},":ls:":{unicode:["1f1f1-1f1f8"],isCanonical:!1},":flag_lr:":{unicode:["1f1f1-1f1f7"],isCanonical:!0},":lr:":{unicode:["1f1f1-1f1f7"],isCanonical:!1},":flag_lk:":{unicode:["1f1f1-1f1f0"],isCanonical:!0},":lk:":{unicode:["1f1f1-1f1f0"],isCanonical:!1},":flag_li:":{unicode:["1f1f1-1f1ee"],isCanonical:!0},":li:":{unicode:["1f1f1-1f1ee"],isCanonical:!1},":flag_lc:":{unicode:["1f1f1-1f1e8"],isCanonical:!0},":lc:":{unicode:["1f1f1-1f1e8"],isCanonical:!1},":flag_lb:":{unicode:["1f1f1-1f1e7"],isCanonical:!0},":lb:":{unicode:["1f1f1-1f1e7"],isCanonical:!1},":flag_la:":{unicode:["1f1f1-1f1e6"],isCanonical:!0},":la:":{unicode:["1f1f1-1f1e6"],isCanonical:!1},":flag_kz:":{unicode:["1f1f0-1f1ff"],isCanonical:!0},":kz:":{unicode:["1f1f0-1f1ff"],isCanonical:!1},":flag_ky:":{unicode:["1f1f0-1f1fe"],isCanonical:!0},":ky:":{unicode:["1f1f0-1f1fe"],isCanonical:!1},":flag_kw:":{unicode:["1f1f0-1f1fc"],isCanonical:!0},":kw:":{unicode:["1f1f0-1f1fc"],isCanonical:!1},":flag_kr:":{unicode:["1f1f0-1f1f7"],isCanonical:!0},":kr:":{unicode:["1f1f0-1f1f7"],isCanonical:!1},":flag_kp:":{unicode:["1f1f0-1f1f5"],isCanonical:!0},":kp:":{unicode:["1f1f0-1f1f5"],isCanonical:!1},":flag_kn:":{unicode:["1f1f0-1f1f3"],isCanonical:!0},":kn:":{unicode:["1f1f0-1f1f3"],isCanonical:!1},":flag_km:":{unicode:["1f1f0-1f1f2"],isCanonical:!0},":km:":{unicode:["1f1f0-1f1f2"],isCanonical:!1},":flag_ki:":{unicode:["1f1f0-1f1ee"],isCanonical:!0},":ki:":{unicode:["1f1f0-1f1ee"],isCanonical:!1},":flag_kh:":{unicode:["1f1f0-1f1ed"],isCanonical:!0},":kh:":{unicode:["1f1f0-1f1ed"],isCanonical:!1},":flag_kg:":{unicode:["1f1f0-1f1ec"],isCanonical:!0},":kg:":{unicode:["1f1f0-1f1ec"],isCanonical:!1},":flag_ke:":{unicode:["1f1f0-1f1ea"],isCanonical:!0},":ke:":{unicode:["1f1f0-1f1ea"],isCanonical:!1},":flag_jp:":{unicode:["1f1ef-1f1f5"],isCanonical:!0},":jp:":{unicode:["1f1ef-1f1f5"],isCanonical:!1},":flag_jo:":{unicode:["1f1ef-1f1f4"],isCanonical:!0},":jo:":{unicode:["1f1ef-1f1f4"],isCanonical:!1},":flag_jm:":{unicode:["1f1ef-1f1f2"],isCanonical:!0},":jm:":{unicode:["1f1ef-1f1f2"],isCanonical:!1},":flag_je:":{unicode:["1f1ef-1f1ea"],isCanonical:!0},":je:":{unicode:["1f1ef-1f1ea"],isCanonical:!1},":flag_it:":{unicode:["1f1ee-1f1f9"],isCanonical:!0},":it:":{unicode:["1f1ee-1f1f9"],isCanonical:!1},":flag_is:":{unicode:["1f1ee-1f1f8"],isCanonical:!0},":is:":{unicode:["1f1ee-1f1f8"],isCanonical:!1},":flag_ir:":{unicode:["1f1ee-1f1f7"],isCanonical:!0},":ir:":{unicode:["1f1ee-1f1f7"],isCanonical:!1},":flag_iq:":{unicode:["1f1ee-1f1f6"],isCanonical:!0},":iq:":{unicode:["1f1ee-1f1f6"],isCanonical:!1},":flag_io:":{unicode:["1f1ee-1f1f4"],isCanonical:!0},":io:":{unicode:["1f1ee-1f1f4"],isCanonical:!1},":flag_in:":{unicode:["1f1ee-1f1f3"],isCanonical:!0},":in:":{unicode:["1f1ee-1f1f3"],isCanonical:!1},":flag_im:":{unicode:["1f1ee-1f1f2"],isCanonical:!0},":im:":{unicode:["1f1ee-1f1f2"],isCanonical:!1},":flag_il:":{unicode:["1f1ee-1f1f1"],isCanonical:!0},":il:":{unicode:["1f1ee-1f1f1"],isCanonical:!1},":flag_ie:":{unicode:["1f1ee-1f1ea"],isCanonical:!0},":ie:":{unicode:["1f1ee-1f1ea"],isCanonical:!1},":flag_id:":{unicode:["1f1ee-1f1e9"],isCanonical:!0},":indonesia:":{unicode:["1f1ee-1f1e9"],isCanonical:!1},":flag_ic:":{unicode:["1f1ee-1f1e8"],isCanonical:!0},":ic:":{unicode:["1f1ee-1f1e8"],isCanonical:!1},":flag_hu:":{unicode:["1f1ed-1f1fa"],isCanonical:!0},":hu:":{unicode:["1f1ed-1f1fa"],isCanonical:!1},":flag_ht:":{unicode:["1f1ed-1f1f9"],isCanonical:!0},":ht:":{unicode:["1f1ed-1f1f9"],isCanonical:!1},":flag_hr:":{unicode:["1f1ed-1f1f7"],isCanonical:!0},":hr:":{unicode:["1f1ed-1f1f7"],isCanonical:!1},":flag_hn:":{unicode:["1f1ed-1f1f3"],isCanonical:!0},":hn:":{unicode:["1f1ed-1f1f3"],isCanonical:!1},":flag_hm:":{unicode:["1f1ed-1f1f2"],isCanonical:!0},":hm:":{unicode:["1f1ed-1f1f2"],isCanonical:!1},":flag_hk:":{unicode:["1f1ed-1f1f0"],isCanonical:!0},":hk:":{unicode:["1f1ed-1f1f0"],isCanonical:!1},":flag_gy:":{unicode:["1f1ec-1f1fe"],isCanonical:!0},":gy:":{unicode:["1f1ec-1f1fe"],isCanonical:!1},":flag_gw:":{unicode:["1f1ec-1f1fc"],isCanonical:!0},":gw:":{unicode:["1f1ec-1f1fc"],isCanonical:!1},":flag_gu:":{unicode:["1f1ec-1f1fa"],isCanonical:!0},":gu:":{unicode:["1f1ec-1f1fa"],isCanonical:!1},":flag_gt:":{unicode:["1f1ec-1f1f9"],isCanonical:!0},":gt:":{unicode:["1f1ec-1f1f9"],isCanonical:!1},":flag_gs:":{unicode:["1f1ec-1f1f8"],isCanonical:!0},":gs:":{unicode:["1f1ec-1f1f8"],isCanonical:!1},":flag_gr:":{unicode:["1f1ec-1f1f7"],isCanonical:!0},":gr:":{unicode:["1f1ec-1f1f7"],isCanonical:!1},":flag_gq:":{unicode:["1f1ec-1f1f6"],isCanonical:!0},":gq:":{unicode:["1f1ec-1f1f6"],isCanonical:!1},":flag_gp:":{unicode:["1f1ec-1f1f5"],isCanonical:!0},":gp:":{unicode:["1f1ec-1f1f5"],isCanonical:!1},":flag_gn:":{unicode:["1f1ec-1f1f3"],isCanonical:!0},":gn:":{unicode:["1f1ec-1f1f3"],isCanonical:!1},":flag_gm:":{unicode:["1f1ec-1f1f2"],isCanonical:!0},":gm:":{unicode:["1f1ec-1f1f2"],isCanonical:!1},":flag_gl:":{unicode:["1f1ec-1f1f1"],isCanonical:!0},":gl:":{unicode:["1f1ec-1f1f1"],isCanonical:!1},":flag_gi:":{unicode:["1f1ec-1f1ee"],isCanonical:!0},":gi:":{unicode:["1f1ec-1f1ee"],isCanonical:!1},":flag_gh:":{unicode:["1f1ec-1f1ed"],isCanonical:!0},":gh:":{unicode:["1f1ec-1f1ed"],isCanonical:!1},":flag_gg:":{unicode:["1f1ec-1f1ec"],isCanonical:!0},":gg:":{unicode:["1f1ec-1f1ec"],isCanonical:!1},":flag_gf:":{unicode:["1f1ec-1f1eb"],isCanonical:!0},":gf:":{unicode:["1f1ec-1f1eb"],isCanonical:!1},":flag_ge:":{unicode:["1f1ec-1f1ea"],isCanonical:!0},":ge:":{unicode:["1f1ec-1f1ea"],isCanonical:!1},":flag_gd:":{unicode:["1f1ec-1f1e9"],isCanonical:!0},":gd:":{unicode:["1f1ec-1f1e9"],isCanonical:!1},":flag_gb:":{unicode:["1f1ec-1f1e7"],isCanonical:!0},":gb:":{unicode:["1f1ec-1f1e7"],isCanonical:!1},":flag_ga:":{unicode:["1f1ec-1f1e6"],isCanonical:!0},":ga:":{unicode:["1f1ec-1f1e6"],isCanonical:!1},":flag_fr:":{unicode:["1f1eb-1f1f7"],isCanonical:!0},":fr:":{unicode:["1f1eb-1f1f7"],isCanonical:!1},":flag_fo:":{unicode:["1f1eb-1f1f4"],isCanonical:!0},":fo:":{unicode:["1f1eb-1f1f4"],isCanonical:!1},":flag_fm:":{unicode:["1f1eb-1f1f2"],isCanonical:!0},":fm:":{unicode:["1f1eb-1f1f2"],isCanonical:!1},":flag_fk:":{unicode:["1f1eb-1f1f0"],isCanonical:!0},":fk:":{unicode:["1f1eb-1f1f0"],isCanonical:!1},":flag_fj:":{unicode:["1f1eb-1f1ef"],isCanonical:!0},":fj:":{unicode:["1f1eb-1f1ef"],isCanonical:!1},":flag_fi:":{unicode:["1f1eb-1f1ee"],isCanonical:!0},":fi:":{unicode:["1f1eb-1f1ee"],isCanonical:!1},":flag_eu:":{unicode:["1f1ea-1f1fa"],isCanonical:!0},":eu:":{unicode:["1f1ea-1f1fa"],isCanonical:!1},":flag_et:":{unicode:["1f1ea-1f1f9"],isCanonical:!0},":et:":{unicode:["1f1ea-1f1f9"],isCanonical:!1},":flag_es:":{unicode:["1f1ea-1f1f8"],isCanonical:!0},":es:":{unicode:["1f1ea-1f1f8"],isCanonical:!1},":flag_er:":{unicode:["1f1ea-1f1f7"],isCanonical:!0},":er:":{unicode:["1f1ea-1f1f7"],isCanonical:!1},":flag_eh:":{unicode:["1f1ea-1f1ed"],isCanonical:!0},":eh:":{unicode:["1f1ea-1f1ed"],isCanonical:!1},":flag_eg:":{unicode:["1f1ea-1f1ec"],isCanonical:!0},":eg:":{unicode:["1f1ea-1f1ec"],isCanonical:!1},":flag_ee:":{unicode:["1f1ea-1f1ea"],isCanonical:!0},":ee:":{unicode:["1f1ea-1f1ea"],isCanonical:!1},":flag_ec:":{unicode:["1f1ea-1f1e8"],isCanonical:!0},":ec:":{unicode:["1f1ea-1f1e8"],isCanonical:!1},":flag_ea:":{unicode:["1f1ea-1f1e6"],isCanonical:!0},":ea:":{unicode:["1f1ea-1f1e6"],isCanonical:!1},":flag_dz:":{unicode:["1f1e9-1f1ff"],isCanonical:!0},":dz:":{unicode:["1f1e9-1f1ff"],isCanonical:!1},":flag_do:":{unicode:["1f1e9-1f1f4"],isCanonical:!0},":do:":{unicode:["1f1e9-1f1f4"],isCanonical:!1},":flag_dm:":{unicode:["1f1e9-1f1f2"],isCanonical:!0},":dm:":{unicode:["1f1e9-1f1f2"],isCanonical:!1},":flag_dk:":{unicode:["1f1e9-1f1f0"],isCanonical:!0},":dk:":{unicode:["1f1e9-1f1f0"],isCanonical:!1},":flag_dj:":{unicode:["1f1e9-1f1ef"],isCanonical:!0},":dj:":{unicode:["1f1e9-1f1ef"],isCanonical:!1},":flag_dg:":{unicode:["1f1e9-1f1ec"],isCanonical:!0},":dg:":{unicode:["1f1e9-1f1ec"],isCanonical:!1},":flag_de:":{unicode:["1f1e9-1f1ea"],isCanonical:!0},":de:":{unicode:["1f1e9-1f1ea"],isCanonical:!1},":flag_cz:":{unicode:["1f1e8-1f1ff"],isCanonical:!0},":cz:":{unicode:["1f1e8-1f1ff"],isCanonical:!1},":flag_cy:":{unicode:["1f1e8-1f1fe"],isCanonical:!0},":cy:":{unicode:["1f1e8-1f1fe"],isCanonical:!1},":flag_cx:":{unicode:["1f1e8-1f1fd"],isCanonical:!0},":cx:":{unicode:["1f1e8-1f1fd"],isCanonical:!1},":flag_cw:":{unicode:["1f1e8-1f1fc"],isCanonical:!0},":cw:":{unicode:["1f1e8-1f1fc"],isCanonical:!1},":flag_cv:":{unicode:["1f1e8-1f1fb"],isCanonical:!0},":cv:":{unicode:["1f1e8-1f1fb"],isCanonical:!1},":flag_cu:":{unicode:["1f1e8-1f1fa"],isCanonical:!0},":cu:":{unicode:["1f1e8-1f1fa"],isCanonical:!1},":flag_cr:":{unicode:["1f1e8-1f1f7"],isCanonical:!0},":cr:":{unicode:["1f1e8-1f1f7"],isCanonical:!1},":flag_cp:":{unicode:["1f1e8-1f1f5"],isCanonical:!0},":cp:":{unicode:["1f1e8-1f1f5"],isCanonical:!1},":flag_co:":{unicode:["1f1e8-1f1f4"],isCanonical:!0},":co:":{unicode:["1f1e8-1f1f4"],isCanonical:!1},":flag_cn:":{unicode:["1f1e8-1f1f3"],isCanonical:!0},":cn:":{unicode:["1f1e8-1f1f3"],isCanonical:!1},":flag_cm:":{unicode:["1f1e8-1f1f2"],isCanonical:!0},":cm:":{unicode:["1f1e8-1f1f2"],isCanonical:!1},":flag_cl:":{unicode:["1f1e8-1f1f1"],isCanonical:!0},":chile:":{unicode:["1f1e8-1f1f1"],isCanonical:!1},":flag_ck:":{unicode:["1f1e8-1f1f0"],isCanonical:!0},":ck:":{unicode:["1f1e8-1f1f0"],isCanonical:!1},":flag_ci:":{unicode:["1f1e8-1f1ee"],isCanonical:!0},":ci:":{unicode:["1f1e8-1f1ee"],isCanonical:!1},":flag_ch:":{unicode:["1f1e8-1f1ed"],isCanonical:!0},":ch:":{unicode:["1f1e8-1f1ed"],isCanonical:!1},":flag_cg:":{unicode:["1f1e8-1f1ec"],isCanonical:!0},":cg:":{unicode:["1f1e8-1f1ec"],isCanonical:!1},":flag_cf:":{unicode:["1f1e8-1f1eb"],isCanonical:!0},":cf:":{unicode:["1f1e8-1f1eb"],isCanonical:!1},":flag_cd:":{unicode:["1f1e8-1f1e9"],isCanonical:!0},":congo:":{unicode:["1f1e8-1f1e9"],isCanonical:!1},":flag_cc:":{unicode:["1f1e8-1f1e8"],isCanonical:!0},":cc:":{unicode:["1f1e8-1f1e8"],isCanonical:!1},":flag_ca:":{unicode:["1f1e8-1f1e6"],isCanonical:!0},":ca:":{unicode:["1f1e8-1f1e6"],isCanonical:!1},":flag_bz:":{unicode:["1f1e7-1f1ff"],isCanonical:!0},":bz:":{unicode:["1f1e7-1f1ff"],isCanonical:!1},":flag_by:":{unicode:["1f1e7-1f1fe"],isCanonical:!0},":by:":{unicode:["1f1e7-1f1fe"],isCanonical:!1},":flag_bw:":{unicode:["1f1e7-1f1fc"],isCanonical:!0},":bw:":{unicode:["1f1e7-1f1fc"],isCanonical:!1},":flag_bv:":{unicode:["1f1e7-1f1fb"],isCanonical:!0},":bv:":{unicode:["1f1e7-1f1fb"],isCanonical:!1},":flag_bt:":{unicode:["1f1e7-1f1f9"],isCanonical:!0},":bt:":{unicode:["1f1e7-1f1f9"],isCanonical:!1},":flag_bs:":{unicode:["1f1e7-1f1f8"],isCanonical:!0},":bs:":{unicode:["1f1e7-1f1f8"],isCanonical:!1},":flag_br:":{unicode:["1f1e7-1f1f7"],isCanonical:!0},":br:":{unicode:["1f1e7-1f1f7"],isCanonical:!1},":flag_bq:":{unicode:["1f1e7-1f1f6"],isCanonical:!0},":bq:":{unicode:["1f1e7-1f1f6"],isCanonical:!1},":flag_bo:":{unicode:["1f1e7-1f1f4"],isCanonical:!0},":bo:":{unicode:["1f1e7-1f1f4"],isCanonical:!1},":flag_bn:":{unicode:["1f1e7-1f1f3"],isCanonical:!0},":bn:":{unicode:["1f1e7-1f1f3"],isCanonical:!1},":flag_bm:":{unicode:["1f1e7-1f1f2"],isCanonical:!0},":bm:":{unicode:["1f1e7-1f1f2"],isCanonical:!1},":flag_bl:":{unicode:["1f1e7-1f1f1"],isCanonical:!0},":bl:":{unicode:["1f1e7-1f1f1"],isCanonical:!1},":flag_bj:":{unicode:["1f1e7-1f1ef"],isCanonical:!0},":bj:":{unicode:["1f1e7-1f1ef"],isCanonical:!1},":flag_bi:":{unicode:["1f1e7-1f1ee"],isCanonical:!0},":bi:":{unicode:["1f1e7-1f1ee"],isCanonical:!1},":flag_bh:":{unicode:["1f1e7-1f1ed"],isCanonical:!0},":bh:":{unicode:["1f1e7-1f1ed"],isCanonical:!1},":flag_bg:":{unicode:["1f1e7-1f1ec"],isCanonical:!0},":bg:":{unicode:["1f1e7-1f1ec"],isCanonical:!1},":flag_bf:":{unicode:["1f1e7-1f1eb"],isCanonical:!0},":bf:":{unicode:["1f1e7-1f1eb"],isCanonical:!1},":flag_be:":{unicode:["1f1e7-1f1ea"],isCanonical:!0},":be:":{unicode:["1f1e7-1f1ea"],isCanonical:!1},":flag_bd:":{unicode:["1f1e7-1f1e9"],isCanonical:!0},":bd:":{unicode:["1f1e7-1f1e9"],isCanonical:!1},":flag_bb:":{unicode:["1f1e7-1f1e7"],isCanonical:!0},":bb:":{unicode:["1f1e7-1f1e7"],isCanonical:!1},":flag_ba:":{unicode:["1f1e7-1f1e6"],isCanonical:!0},":ba:":{unicode:["1f1e7-1f1e6"],isCanonical:!1},":flag_az:":{unicode:["1f1e6-1f1ff"],isCanonical:!0},":az:":{unicode:["1f1e6-1f1ff"],isCanonical:!1},":flag_ax:":{unicode:["1f1e6-1f1fd"],isCanonical:!0},":ax:":{unicode:["1f1e6-1f1fd"],isCanonical:!1},":flag_aw:":{unicode:["1f1e6-1f1fc"],isCanonical:!0},":aw:":{unicode:["1f1e6-1f1fc"],isCanonical:!1},":flag_au:":{unicode:["1f1e6-1f1fa"],isCanonical:!0},":au:":{unicode:["1f1e6-1f1fa"],isCanonical:!1},":flag_at:":{unicode:["1f1e6-1f1f9"],isCanonical:!0},":at:":{unicode:["1f1e6-1f1f9"],isCanonical:!1},":flag_as:":{unicode:["1f1e6-1f1f8"],isCanonical:!0},":as:":{unicode:["1f1e6-1f1f8"],isCanonical:!1},":flag_ar:":{unicode:["1f1e6-1f1f7"],isCanonical:!0},":ar:":{unicode:["1f1e6-1f1f7"],isCanonical:!1},":flag_aq:":{unicode:["1f1e6-1f1f6"],isCanonical:!0},":aq:":{unicode:["1f1e6-1f1f6"],isCanonical:!1},":flag_ao:":{unicode:["1f1e6-1f1f4"],isCanonical:!0},":ao:":{unicode:["1f1e6-1f1f4"],isCanonical:!1},":flag_am:":{unicode:["1f1e6-1f1f2"],isCanonical:!0},":am:":{unicode:["1f1e6-1f1f2"],isCanonical:!1},":flag_al:":{unicode:["1f1e6-1f1f1"],isCanonical:!0},":al:":{unicode:["1f1e6-1f1f1"],isCanonical:!1},":flag_ai:":{unicode:["1f1e6-1f1ee"],isCanonical:!0},":ai:":{unicode:["1f1e6-1f1ee"],isCanonical:!1},":flag_ag:":{unicode:["1f1e6-1f1ec"],isCanonical:!0},":ag:":{unicode:["1f1e6-1f1ec"],isCanonical:!1},":flag_af:":{unicode:["1f1e6-1f1eb"],isCanonical:!0},":af:":{unicode:["1f1e6-1f1eb"],isCanonical:!1},":flag_ae:":{unicode:["1f1e6-1f1ea"],isCanonical:!0},":ae:":{unicode:["1f1e6-1f1ea"],isCanonical:!1},":flag_ad:":{unicode:["1f1e6-1f1e9"],isCanonical:!0},":ad:":{unicode:["1f1e6-1f1e9"],isCanonical:!1},":flag_ac:":{unicode:["1f1e6-1f1e8"],isCanonical:!0},":ac:":{unicode:["1f1e6-1f1e8"],isCanonical:!1},":mahjong:":{unicode:["1f004-fe0f","1f004"],isCanonical:!0},":parking:":{unicode:["1f17f-fe0f","1f17f"],isCanonical:!0},":sa:":{unicode:["1f202-fe0f","1f202"],isCanonical:!0},":u7121:":{unicode:["1f21a-fe0f","1f21a"],isCanonical:!0},":u6307:":{unicode:["1f22f-fe0f","1f22f"],isCanonical:!0},":u6708:":{unicode:["1f237-fe0f","1f237"],isCanonical:!0},":film_frames:":{unicode:["1f39e-fe0f","1f39e"],isCanonical:!0},":tickets:":{unicode:["1f39f-fe0f","1f39f"],isCanonical:!0},":admission_tickets:":{unicode:["1f39f-fe0f","1f39f"],isCanonical:!1},":lifter:":{unicode:["1f3cb-fe0f","1f3cb"],isCanonical:!0},":weight_lifter:":{unicode:["1f3cb-fe0f","1f3cb"],isCanonical:!1},":golfer:":{unicode:["1f3cc-fe0f","1f3cc"],isCanonical:!0},":motorcycle:":{unicode:["1f3cd-fe0f","1f3cd"],isCanonical:!0},":racing_motorcycle:":{unicode:["1f3cd-fe0f","1f3cd"],isCanonical:!1},":race_car:":{unicode:["1f3ce-fe0f","1f3ce"],isCanonical:!0},":racing_car:":{unicode:["1f3ce-fe0f","1f3ce"],isCanonical:!1},":military_medal:":{unicode:["1f396-fe0f","1f396"],isCanonical:!0},":reminder_ribbon:":{unicode:["1f397-fe0f","1f397"],isCanonical:!0},":hot_pepper:":{unicode:["1f336-fe0f","1f336"],isCanonical:!0},":cloud_rain:":{unicode:["1f327-fe0f","1f327"],isCanonical:!0},":cloud_with_rain:":{unicode:["1f327-fe0f","1f327"],isCanonical:!1},":cloud_snow:":{unicode:["1f328-fe0f","1f328"],isCanonical:!0},":cloud_with_snow:":{unicode:["1f328-fe0f","1f328"],isCanonical:!1},":cloud_lightning:":{unicode:["1f329-fe0f","1f329"],isCanonical:!0},":cloud_with_lightning:":{unicode:["1f329-fe0f","1f329"],isCanonical:!1},":cloud_tornado:":{unicode:["1f32a-fe0f","1f32a"],isCanonical:!0},":cloud_with_tornado:":{unicode:["1f32a-fe0f","1f32a"],isCanonical:!1},":fog:":{unicode:["1f32b-fe0f","1f32b"],isCanonical:!0},":wind_blowing_face:":{unicode:["1f32c-fe0f","1f32c"],isCanonical:!0},":chipmunk:":{unicode:["1f43f-fe0f","1f43f"],isCanonical:!0},":spider:":{unicode:["1f577-fe0f","1f577"],isCanonical:!0},":spider_web:":{unicode:["1f578-fe0f","1f578"],isCanonical:!0},":thermometer:":{unicode:["1f321-fe0f","1f321"],isCanonical:!0},":microphone2:":{unicode:["1f399-fe0f","1f399"],isCanonical:!0},":studio_microphone:":{unicode:["1f399-fe0f","1f399"],isCanonical:!1},":level_slider:":{unicode:["1f39a-fe0f","1f39a"],isCanonical:!0},":control_knobs:":{unicode:["1f39b-fe0f","1f39b"],isCanonical:!0},":flag_white:":{unicode:["1f3f3-fe0f","1f3f3"],isCanonical:!0},":waving_white_flag:":{unicode:["1f3f3-fe0f","1f3f3"],isCanonical:!1},":rosette:":{unicode:["1f3f5-fe0f","1f3f5"],isCanonical:!0},":label:":{unicode:["1f3f7-fe0f","1f3f7"],isCanonical:!0},":projector:":{unicode:["1f4fd-fe0f","1f4fd"],isCanonical:!0},":film_projector:":{unicode:["1f4fd-fe0f","1f4fd"],isCanonical:!1},":om_symbol:":{unicode:["1f549-fe0f","1f549"],isCanonical:!0},":dove:":{unicode:["1f54a-fe0f","1f54a"],isCanonical:!0},":dove_of_peace:":{unicode:["1f54a-fe0f","1f54a"],isCanonical:!1},":candle:":{unicode:["1f56f-fe0f","1f56f"],isCanonical:!0},":clock:":{unicode:["1f570-fe0f","1f570"],isCanonical:!0},":mantlepiece_clock:":{unicode:["1f570-fe0f","1f570"],isCanonical:!1},":hole:":{unicode:["1f573-fe0f","1f573"],isCanonical:!0},":dark_sunglasses:":{unicode:["1f576-fe0f","1f576"],isCanonical:!0},":joystick:":{unicode:["1f579-fe0f","1f579"],isCanonical:!0},":paperclips:":{unicode:["1f587-fe0f","1f587"],isCanonical:!0},":linked_paperclips:":{unicode:["1f587-fe0f","1f587"],isCanonical:!1},":pen_ballpoint:":{unicode:["1f58a-fe0f","1f58a"],isCanonical:!0},":lower_left_ballpoint_pen:":{unicode:["1f58a-fe0f","1f58a"],isCanonical:!1},":pen_fountain:":{unicode:["1f58b-fe0f","1f58b"],isCanonical:!0},":lower_left_fountain_pen:":{unicode:["1f58b-fe0f","1f58b"],isCanonical:!1},":paintbrush:":{unicode:["1f58c-fe0f","1f58c"],isCanonical:!0},":lower_left_paintbrush:":{unicode:["1f58c-fe0f","1f58c"],isCanonical:!1},":crayon:":{unicode:["1f58d-fe0f","1f58d"],isCanonical:!0},":lower_left_crayon:":{unicode:["1f58d-fe0f","1f58d"],isCanonical:!1},":desktop:":{unicode:["1f5a5-fe0f","1f5a5"],isCanonical:!0},":desktop_computer:":{unicode:["1f5a5-fe0f","1f5a5"],isCanonical:!1},":printer:":{unicode:["1f5a8-fe0f","1f5a8"],isCanonical:!0},":trackball:":{unicode:["1f5b2-fe0f","1f5b2"],isCanonical:!0},":frame_photo:":{unicode:["1f5bc-fe0f","1f5bc"],isCanonical:!0},":frame_with_picture:":{unicode:["1f5bc-fe0f","1f5bc"],isCanonical:!1},":dividers:":{unicode:["1f5c2-fe0f","1f5c2"],isCanonical:!0},":card_index_dividers:":{unicode:["1f5c2-fe0f","1f5c2"],isCanonical:!1},":card_box:":{unicode:["1f5c3-fe0f","1f5c3"],isCanonical:!0},":card_file_box:":{unicode:["1f5c3-fe0f","1f5c3"],isCanonical:!1},":file_cabinet:":{unicode:["1f5c4-fe0f","1f5c4"],isCanonical:!0},":wastebasket:":{unicode:["1f5d1-fe0f","1f5d1"],isCanonical:!0},":notepad_spiral:":{unicode:["1f5d2-fe0f","1f5d2"],isCanonical:!0},":spiral_note_pad:":{unicode:["1f5d2-fe0f","1f5d2"],isCanonical:!1},":calendar_spiral:":{unicode:["1f5d3-fe0f","1f5d3"],isCanonical:!0},":spiral_calendar_pad:":{unicode:["1f5d3-fe0f","1f5d3"],isCanonical:!1},":compression:":{unicode:["1f5dc-fe0f","1f5dc"],isCanonical:!0},":key2:":{unicode:["1f5dd-fe0f","1f5dd"],isCanonical:!0},":old_key:":{unicode:["1f5dd-fe0f","1f5dd"],isCanonical:!1},":newspaper2:":{unicode:["1f5de-fe0f","1f5de"],isCanonical:!0},":rolled_up_newspaper:":{unicode:["1f5de-fe0f","1f5de"],isCanonical:!1},":dagger:":{unicode:["1f5e1-fe0f","1f5e1"],isCanonical:!0},":dagger_knife:":{unicode:["1f5e1-fe0f","1f5e1"],isCanonical:!1},":speaking_head:":{unicode:["1f5e3-fe0f","1f5e3"],isCanonical:!0},":speaking_head_in_silhouette:":{unicode:["1f5e3-fe0f","1f5e3"],isCanonical:!1},":anger_right:":{unicode:["1f5ef-fe0f","1f5ef"],isCanonical:!0},":right_anger_bubble:":{unicode:["1f5ef-fe0f","1f5ef"],isCanonical:!1},":ballot_box:":{unicode:["1f5f3-fe0f","1f5f3"],isCanonical:!0},":ballot_box_with_ballot:":{unicode:["1f5f3-fe0f","1f5f3"],isCanonical:!1},":map:":{unicode:["1f5fa-fe0f","1f5fa"],isCanonical:!0},":world_map:":{unicode:["1f5fa-fe0f","1f5fa"],isCanonical:!1},":tools:":{unicode:["1f6e0-fe0f","1f6e0"],isCanonical:!0},":hammer_and_wrench:":{unicode:["1f6e0-fe0f","1f6e0"],isCanonical:!1},":shield:":{unicode:["1f6e1-fe0f","1f6e1"],isCanonical:!0},":oil:":{unicode:["1f6e2-fe0f","1f6e2"],isCanonical:!0},":oil_drum:":{unicode:["1f6e2-fe0f","1f6e2"],isCanonical:!1},":satellite_orbital:":{unicode:["1f6f0-fe0f","1f6f0"],isCanonical:!0},":fork_knife_plate:":{unicode:["1f37d-fe0f","1f37d"],isCanonical:!0},":fork_and_knife_with_plate:":{unicode:["1f37d-fe0f","1f37d"],isCanonical:!1},":eye:":{unicode:["1f441-fe0f","1f441"],isCanonical:!0},":levitate:":{unicode:["1f574-fe0f","1f574"],isCanonical:!0},":man_in_business_suit_levitating:":{unicode:["1f574-fe0f","1f574"],isCanonical:!1},":spy:":{unicode:["1f575-fe0f","1f575"],isCanonical:!0},":sleuth_or_spy:":{unicode:["1f575-fe0f","1f575"],isCanonical:!1},":hand_splayed:":{unicode:["1f590-fe0f","1f590"],isCanonical:!0},":raised_hand_with_fingers_splayed:":{unicode:["1f590-fe0f","1f590"],isCanonical:!1},":mountain_snow:":{unicode:["1f3d4-fe0f","1f3d4"],isCanonical:!0},":snow_capped_mountain:":{unicode:["1f3d4-fe0f","1f3d4"],isCanonical:!1},":camping:":{unicode:["1f3d5-fe0f","1f3d5"],isCanonical:!0},":beach:":{unicode:["1f3d6-fe0f","1f3d6"],isCanonical:!0},":beach_with_umbrella:":{unicode:["1f3d6-fe0f","1f3d6"],isCanonical:!1},":construction_site:":{unicode:["1f3d7-fe0f","1f3d7"],isCanonical:!0},":building_construction:":{unicode:["1f3d7-fe0f","1f3d7"],isCanonical:!1},":homes:":{unicode:["1f3d8-fe0f","1f3d8"],isCanonical:!0},":house_buildings:":{unicode:["1f3d8-fe0f","1f3d8"],isCanonical:!1},":cityscape:":{unicode:["1f3d9-fe0f","1f3d9"],isCanonical:!0},":house_abandoned:":{unicode:["1f3da-fe0f","1f3da"],isCanonical:!0},":derelict_house_building:":{unicode:["1f3da-fe0f","1f3da"],isCanonical:!1},":classical_building:":{unicode:["1f3db-fe0f","1f3db"],isCanonical:!0},":desert:":{unicode:["1f3dc-fe0f","1f3dc"],isCanonical:!0},":island:":{unicode:["1f3dd-fe0f","1f3dd"],isCanonical:!0},":desert_island:":{unicode:["1f3dd-fe0f","1f3dd"],isCanonical:!1},":park:":{unicode:["1f3de-fe0f","1f3de"],isCanonical:!0},":national_park:":{unicode:["1f3de-fe0f","1f3de"],isCanonical:!1},":stadium:":{unicode:["1f3df-fe0f","1f3df"],isCanonical:!0},":couch:":{unicode:["1f6cb-fe0f","1f6cb"],isCanonical:!0},":couch_and_lamp:":{unicode:["1f6cb-fe0f","1f6cb"],isCanonical:!1},":shopping_bags:":{unicode:["1f6cd-fe0f","1f6cd"],isCanonical:!0},":bellhop:":{unicode:["1f6ce-fe0f","1f6ce"],isCanonical:!0},":bellhop_bell:":{unicode:["1f6ce-fe0f","1f6ce"],isCanonical:!1},":bed:":{unicode:["1f6cf-fe0f","1f6cf"],isCanonical:!0},":motorway:":{unicode:["1f6e3-fe0f","1f6e3"],isCanonical:!0},":railway_track:":{unicode:["1f6e4-fe0f","1f6e4"],isCanonical:!0},":railroad_track:":{unicode:["1f6e4-fe0f","1f6e4"],isCanonical:!1},":motorboat:":{unicode:["1f6e5-fe0f","1f6e5"],isCanonical:!0},":airplane_small:":{unicode:["1f6e9-fe0f","1f6e9"],isCanonical:!0},":small_airplane:":{unicode:["1f6e9-fe0f","1f6e9"],isCanonical:!1},":cruise_ship:":{unicode:["1f6f3-fe0f","1f6f3"],isCanonical:!0},":passenger_ship:":{unicode:["1f6f3-fe0f","1f6f3"],isCanonical:!1},":white_sun_small_cloud:":{unicode:["1f324-fe0f","1f324"],isCanonical:!0},":white_sun_with_small_cloud:":{unicode:["1f324-fe0f","1f324"],isCanonical:!1},":white_sun_cloud:":{unicode:["1f325-fe0f","1f325"],isCanonical:!0},":white_sun_behind_cloud:":{unicode:["1f325-fe0f","1f325"],isCanonical:!1},":white_sun_rain_cloud:":{unicode:["1f326-fe0f","1f326"],isCanonical:!0},":white_sun_behind_cloud_with_rain:":{unicode:["1f326-fe0f","1f326"],isCanonical:!1},":mouse_three_button:":{unicode:["1f5b1-fe0f","1f5b1"],isCanonical:!0},":three_button_mouse:":{unicode:["1f5b1-fe0f","1f5b1"],isCanonical:!1},":point_up_tone1:":{unicode:["261d-1f3fb"],isCanonical:!0},":point_up_tone2:":{unicode:["261d-1f3fc"],isCanonical:!0},":point_up_tone3:":{unicode:["261d-1f3fd"],isCanonical:!0},":point_up_tone4:":{unicode:["261d-1f3fe"],isCanonical:!0},":point_up_tone5:":{unicode:["261d-1f3ff"],isCanonical:!0},":v_tone1:":{unicode:["270c-1f3fb"],isCanonical:!0},":v_tone2:":{unicode:["270c-1f3fc"],isCanonical:!0},":v_tone3:":{unicode:["270c-1f3fd"],isCanonical:!0},":v_tone4:":{unicode:["270c-1f3fe"],isCanonical:!0},":v_tone5:":{unicode:["270c-1f3ff"],isCanonical:!0},":fist_tone1:":{unicode:["270a-1f3fb"],isCanonical:!0},":fist_tone2:":{unicode:["270a-1f3fc"],isCanonical:!0},":fist_tone3:":{unicode:["270a-1f3fd"],isCanonical:!0},":fist_tone4:":{unicode:["270a-1f3fe"],isCanonical:!0},":fist_tone5:":{unicode:["270a-1f3ff"],isCanonical:!0},":raised_hand_tone1:":{unicode:["270b-1f3fb"],isCanonical:!0},":raised_hand_tone2:":{unicode:["270b-1f3fc"],isCanonical:!0},":raised_hand_tone3:":{unicode:["270b-1f3fd"],isCanonical:!0},":raised_hand_tone4:":{unicode:["270b-1f3fe"],isCanonical:!0},":raised_hand_tone5:":{unicode:["270b-1f3ff"],isCanonical:!0},":writing_hand_tone1:":{unicode:["270d-1f3fb"],isCanonical:!0},":writing_hand_tone2:":{unicode:["270d-1f3fc"],isCanonical:!0},":writing_hand_tone3:":{unicode:["270d-1f3fd"],isCanonical:!0},":writing_hand_tone4:":{unicode:["270d-1f3fe"],isCanonical:!0},":writing_hand_tone5:":{unicode:["270d-1f3ff"],isCanonical:!0},":basketball_player_tone1:":{unicode:["26f9-1f3fb"],isCanonical:!0},":person_with_ball_tone1:":{unicode:["26f9-1f3fb"],isCanonical:!1},":basketball_player_tone2:":{unicode:["26f9-1f3fc"],isCanonical:!0},":person_with_ball_tone2:":{unicode:["26f9-1f3fc"],isCanonical:!1},":basketball_player_tone3:":{unicode:["26f9-1f3fd"],isCanonical:!0},":person_with_ball_tone3:":{unicode:["26f9-1f3fd"],isCanonical:!1},":basketball_player_tone4:":{unicode:["26f9-1f3fe"],isCanonical:!0},":person_with_ball_tone4:":{unicode:["26f9-1f3fe"],isCanonical:!1},":basketball_player_tone5:":{unicode:["26f9-1f3ff"],isCanonical:!0},":person_with_ball_tone5:":{unicode:["26f9-1f3ff"],isCanonical:!1},":copyright:":{unicode:["00a9-fe0f","00a9"],isCanonical:!0},":registered:":{unicode:["00ae-fe0f","00ae"],isCanonical:!0},":bangbang:":{unicode:["203c-fe0f","203c"],isCanonical:!0},":interrobang:":{unicode:["2049-fe0f","2049"],isCanonical:!0},":tm:":{unicode:["2122-fe0f","2122"],isCanonical:!0},":information_source:":{unicode:["2139-fe0f","2139"],isCanonical:!0},":left_right_arrow:":{unicode:["2194-fe0f","2194"],isCanonical:!0},":arrow_up_down:":{unicode:["2195-fe0f","2195"],isCanonical:!0},":arrow_upper_left:":{unicode:["2196-fe0f","2196"],isCanonical:!0},":arrow_upper_right:":{unicode:["2197-fe0f","2197"],isCanonical:!0},":arrow_lower_right:":{unicode:["2198-fe0f","2198"],isCanonical:!0},":arrow_lower_left:":{unicode:["2199-fe0f","2199"],isCanonical:!0},":leftwards_arrow_with_hook:":{unicode:["21a9-fe0f","21a9"],isCanonical:!0},":arrow_right_hook:":{unicode:["21aa-fe0f","21aa"],isCanonical:!0},":watch:":{unicode:["231a-fe0f","231a"],isCanonical:!0},":hourglass:":{unicode:["231b-fe0f","231b"],isCanonical:!0},":m:":{unicode:["24c2-fe0f","24c2"],isCanonical:!0},":black_small_square:":{unicode:["25aa-fe0f","25aa"],isCanonical:!0},":white_small_square:":{unicode:["25ab-fe0f","25ab"],isCanonical:!0},":arrow_forward:":{unicode:["25b6-fe0f","25b6"],isCanonical:!0},":arrow_backward:":{unicode:["25c0-fe0f","25c0"],isCanonical:!0},":white_medium_square:":{unicode:["25fb-fe0f","25fb"],isCanonical:!0},":black_medium_square:":{unicode:["25fc-fe0f","25fc"],isCanonical:!0},":white_medium_small_square:":{unicode:["25fd-fe0f","25fd"],isCanonical:!0},":black_medium_small_square:":{unicode:["25fe-fe0f","25fe"],isCanonical:!0},":sunny:":{unicode:["2600-fe0f","2600"],
    isCanonical:!0},":cloud:":{unicode:["2601-fe0f","2601"],isCanonical:!0},":telephone:":{unicode:["260e-fe0f","260e"],isCanonical:!0},":ballot_box_with_check:":{unicode:["2611-fe0f","2611"],isCanonical:!0},":umbrella:":{unicode:["2614-fe0f","2614"],isCanonical:!0},":coffee:":{unicode:["2615-fe0f","2615"],isCanonical:!0},":point_up:":{unicode:["261d-fe0f","261d"],isCanonical:!0},":relaxed:":{unicode:["263a-fe0f","263a"],isCanonical:!0},":aries:":{unicode:["2648-fe0f","2648"],isCanonical:!0},":taurus:":{unicode:["2649-fe0f","2649"],isCanonical:!0},":gemini:":{unicode:["264a-fe0f","264a"],isCanonical:!0},":cancer:":{unicode:["264b-fe0f","264b"],isCanonical:!0},":leo:":{unicode:["264c-fe0f","264c"],isCanonical:!0},":virgo:":{unicode:["264d-fe0f","264d"],isCanonical:!0},":libra:":{unicode:["264e-fe0f","264e"],isCanonical:!0},":scorpius:":{unicode:["264f-fe0f","264f"],isCanonical:!0},":sagittarius:":{unicode:["2650-fe0f","2650"],isCanonical:!0},":capricorn:":{unicode:["2651-fe0f","2651"],isCanonical:!0},":aquarius:":{unicode:["2652-fe0f","2652"],isCanonical:!0},":pisces:":{unicode:["2653-fe0f","2653"],isCanonical:!0},":spades:":{unicode:["2660-fe0f","2660"],isCanonical:!0},":clubs:":{unicode:["2663-fe0f","2663"],isCanonical:!0},":hearts:":{unicode:["2665-fe0f","2665"],isCanonical:!0},":diamonds:":{unicode:["2666-fe0f","2666"],isCanonical:!0},":hotsprings:":{unicode:["2668-fe0f","2668"],isCanonical:!0},":recycle:":{unicode:["267b-fe0f","267b"],isCanonical:!0},":wheelchair:":{unicode:["267f-fe0f","267f"],isCanonical:!0},":anchor:":{unicode:["2693-fe0f","2693"],isCanonical:!0},":warning:":{unicode:["26a0-fe0f","26a0"],isCanonical:!0},":zap:":{unicode:["26a1-fe0f","26a1"],isCanonical:!0},":white_circle:":{unicode:["26aa-fe0f","26aa"],isCanonical:!0},":black_circle:":{unicode:["26ab-fe0f","26ab"],isCanonical:!0},":soccer:":{unicode:["26bd-fe0f","26bd"],isCanonical:!0},":baseball:":{unicode:["26be-fe0f","26be"],isCanonical:!0},":snowman:":{unicode:["26c4-fe0f","26c4"],isCanonical:!0},":partly_sunny:":{unicode:["26c5-fe0f","26c5"],isCanonical:!0},":no_entry:":{unicode:["26d4-fe0f","26d4"],isCanonical:!0},":church:":{unicode:["26ea-fe0f","26ea"],isCanonical:!0},":fountain:":{unicode:["26f2-fe0f","26f2"],isCanonical:!0},":golf:":{unicode:["26f3-fe0f","26f3"],isCanonical:!0},":sailboat:":{unicode:["26f5-fe0f","26f5"],isCanonical:!0},":tent:":{unicode:["26fa-fe0f","26fa"],isCanonical:!0},":fuelpump:":{unicode:["26fd-fe0f","26fd"],isCanonical:!0},":scissors:":{unicode:["2702-fe0f","2702"],isCanonical:!0},":airplane:":{unicode:["2708-fe0f","2708"],isCanonical:!0},":envelope:":{unicode:["2709-fe0f","2709"],isCanonical:!0},":v:":{unicode:["270c-fe0f","270c"],isCanonical:!0},":pencil2:":{unicode:["270f-fe0f","270f"],isCanonical:!0},":black_nib:":{unicode:["2712-fe0f","2712"],isCanonical:!0},":heavy_check_mark:":{unicode:["2714-fe0f","2714"],isCanonical:!0},":heavy_multiplication_x:":{unicode:["2716-fe0f","2716"],isCanonical:!0},":eight_spoked_asterisk:":{unicode:["2733-fe0f","2733"],isCanonical:!0},":eight_pointed_black_star:":{unicode:["2734-fe0f","2734"],isCanonical:!0},":snowflake:":{unicode:["2744-fe0f","2744"],isCanonical:!0},":sparkle:":{unicode:["2747-fe0f","2747"],isCanonical:!0},":exclamation:":{unicode:["2757-fe0f","2757"],isCanonical:!0},":heart:":{unicode:["2764-fe0f","2764"],isCanonical:!0},":arrow_right:":{unicode:["27a1-fe0f","27a1"],isCanonical:!0},":arrow_heading_up:":{unicode:["2934-fe0f","2934"],isCanonical:!0},":arrow_heading_down:":{unicode:["2935-fe0f","2935"],isCanonical:!0},":arrow_left:":{unicode:["2b05-fe0f","2b05"],isCanonical:!0},":arrow_up:":{unicode:["2b06-fe0f","2b06"],isCanonical:!0},":arrow_down:":{unicode:["2b07-fe0f","2b07"],isCanonical:!0},":black_large_square:":{unicode:["2b1b-fe0f","2b1b"],isCanonical:!0},":white_large_square:":{unicode:["2b1c-fe0f","2b1c"],isCanonical:!0},":star:":{unicode:["2b50-fe0f","2b50"],isCanonical:!0},":o:":{unicode:["2b55-fe0f","2b55"],isCanonical:!0},":wavy_dash:":{unicode:["3030-fe0f","3030"],isCanonical:!0},":part_alternation_mark:":{unicode:["303d-fe0f","303d"],isCanonical:!0},":congratulations:":{unicode:["3297-fe0f","3297"],isCanonical:!0},":secret:":{unicode:["3299-fe0f","3299"],isCanonical:!0},":cross:":{unicode:["271d-fe0f","271d"],isCanonical:!0},":latin_cross:":{unicode:["271d-fe0f","271d"],isCanonical:!1},":keyboard:":{unicode:["2328-fe0f","2328"],isCanonical:!0},":writing_hand:":{unicode:["270d-fe0f","270d"],isCanonical:!0},":track_next:":{unicode:["23ed-fe0f","23ed"],isCanonical:!0},":next_track:":{unicode:["23ed-fe0f","23ed"],isCanonical:!1},":track_previous:":{unicode:["23ee-fe0f","23ee"],isCanonical:!0},":previous_track:":{unicode:["23ee-fe0f","23ee"],isCanonical:!1},":play_pause:":{unicode:["23ef-fe0f","23ef"],isCanonical:!0},":stopwatch:":{unicode:["23f1-fe0f","23f1"],isCanonical:!0},":timer:":{unicode:["23f2-fe0f","23f2"],isCanonical:!0},":timer_clock:":{unicode:["23f2-fe0f","23f2"],isCanonical:!1},":pause_button:":{unicode:["23f8-fe0f","23f8"],isCanonical:!0},":double_vertical_bar:":{unicode:["23f8-fe0f","23f8"],isCanonical:!1},":stop_button:":{unicode:["23f9-fe0f","23f9"],isCanonical:!0},":record_button:":{unicode:["23fa-fe0f","23fa"],isCanonical:!0},":umbrella2:":{unicode:["2602-fe0f","2602"],isCanonical:!0},":snowman2:":{unicode:["2603-fe0f","2603"],isCanonical:!0},":comet:":{unicode:["2604-fe0f","2604"],isCanonical:!0},":shamrock:":{unicode:["2618-fe0f","2618"],isCanonical:!0},":skull_crossbones:":{unicode:["2620-fe0f","2620"],isCanonical:!0},":skull_and_crossbones:":{unicode:["2620-fe0f","2620"],isCanonical:!1},":radioactive:":{unicode:["2622-fe0f","2622"],isCanonical:!0},":radioactive_sign:":{unicode:["2622-fe0f","2622"],isCanonical:!1},":biohazard:":{unicode:["2623-fe0f","2623"],isCanonical:!0},":biohazard_sign:":{unicode:["2623-fe0f","2623"],isCanonical:!1},":orthodox_cross:":{unicode:["2626-fe0f","2626"],isCanonical:!0},":star_and_crescent:":{unicode:["262a-fe0f","262a"],isCanonical:!0},":peace:":{unicode:["262e-fe0f","262e"],isCanonical:!0},":peace_symbol:":{unicode:["262e-fe0f","262e"],isCanonical:!1},":yin_yang:":{unicode:["262f-fe0f","262f"],isCanonical:!0},":wheel_of_dharma:":{unicode:["2638-fe0f","2638"],isCanonical:!0},":frowning2:":{unicode:["2639-fe0f","2639"],isCanonical:!0},":white_frowning_face:":{unicode:["2639-fe0f","2639"],isCanonical:!1},":hammer_pick:":{unicode:["2692-fe0f","2692"],isCanonical:!0},":hammer_and_pick:":{unicode:["2692-fe0f","2692"],isCanonical:!1},":crossed_swords:":{unicode:["2694-fe0f","2694"],isCanonical:!0},":scales:":{unicode:["2696-fe0f","2696"],isCanonical:!0},":alembic:":{unicode:["2697-fe0f","2697"],isCanonical:!0},":gear:":{unicode:["2699-fe0f","2699"],isCanonical:!0},":atom:":{unicode:["269b-fe0f","269b"],isCanonical:!0},":atom_symbol:":{unicode:["269b-fe0f","269b"],isCanonical:!1},":fleur-de-lis:":{unicode:["269c-fe0f","269c"],isCanonical:!0},":coffin:":{unicode:["26b0-fe0f","26b0"],isCanonical:!0},":urn:":{unicode:["26b1-fe0f","26b1"],isCanonical:!0},":funeral_urn:":{unicode:["26b1-fe0f","26b1"],isCanonical:!1},":thunder_cloud_rain:":{unicode:["26c8-fe0f","26c8"],isCanonical:!0},":thunder_cloud_and_rain:":{unicode:["26c8-fe0f","26c8"],isCanonical:!1},":pick:":{unicode:["26cf-fe0f","26cf"],isCanonical:!0},":helmet_with_cross:":{unicode:["26d1-fe0f","26d1"],isCanonical:!0},":helmet_with_white_cross:":{unicode:["26d1-fe0f","26d1"],isCanonical:!1},":chains:":{unicode:["26d3-fe0f","26d3"],isCanonical:!0},":shinto_shrine:":{unicode:["26e9-fe0f","26e9"],isCanonical:!0},":mountain:":{unicode:["26f0-fe0f","26f0"],isCanonical:!0},":beach_umbrella:":{unicode:["26f1-fe0f","26f1"],isCanonical:!0},":umbrella_on_ground:":{unicode:["26f1-fe0f","26f1"],isCanonical:!1},":ferry:":{unicode:["26f4-fe0f","26f4"],isCanonical:!0},":skier:":{unicode:["26f7-fe0f","26f7"],isCanonical:!0},":ice_skate:":{unicode:["26f8-fe0f","26f8"],isCanonical:!0},":basketball_player:":{unicode:["26f9-fe0f","26f9"],isCanonical:!0},":person_with_ball:":{unicode:["26f9-fe0f","26f9"],isCanonical:!1},":star_of_david:":{unicode:["2721-fe0f","2721"],isCanonical:!0},":heart_exclamation:":{unicode:["2763-fe0f","2763"],isCanonical:!0},":heavy_heart_exclamation_mark_ornament:":{unicode:["2763-fe0f","2763"],isCanonical:!1},":black_joker:":{unicode:["1f0cf"],isCanonical:!0},":a:":{unicode:["1f170"],isCanonical:!0},":b:":{unicode:["1f171"],isCanonical:!0},":o2:":{unicode:["1f17e"],isCanonical:!0},":ab:":{unicode:["1f18e"],isCanonical:!0},":cl:":{unicode:["1f191"],isCanonical:!0},":cool:":{unicode:["1f192"],isCanonical:!0},":free:":{unicode:["1f193"],isCanonical:!0},":id:":{unicode:["1f194"],isCanonical:!0},":new:":{unicode:["1f195"],isCanonical:!0},":ng:":{unicode:["1f196"],isCanonical:!0},":ok:":{unicode:["1f197"],isCanonical:!0},":sos:":{unicode:["1f198"],isCanonical:!0},":up:":{unicode:["1f199"],isCanonical:!0},":vs:":{unicode:["1f19a"],isCanonical:!0},":koko:":{unicode:["1f201"],isCanonical:!0},":u7981:":{unicode:["1f232"],isCanonical:!0},":u7a7a:":{unicode:["1f233"],isCanonical:!0},":u5408:":{unicode:["1f234"],isCanonical:!0},":u6e80:":{unicode:["1f235"],isCanonical:!0},":u6709:":{unicode:["1f236"],isCanonical:!0},":u7533:":{unicode:["1f238"],isCanonical:!0},":u5272:":{unicode:["1f239"],isCanonical:!0},":u55b6:":{unicode:["1f23a"],isCanonical:!0},":ideograph_advantage:":{unicode:["1f250"],isCanonical:!0},":accept:":{unicode:["1f251"],isCanonical:!0},":cyclone:":{unicode:["1f300"],isCanonical:!0},":foggy:":{unicode:["1f301"],isCanonical:!0},":closed_umbrella:":{unicode:["1f302"],isCanonical:!0},":night_with_stars:":{unicode:["1f303"],isCanonical:!0},":sunrise_over_mountains:":{unicode:["1f304"],isCanonical:!0},":sunrise:":{unicode:["1f305"],isCanonical:!0},":city_dusk:":{unicode:["1f306"],isCanonical:!0},":city_sunset:":{unicode:["1f307"],isCanonical:!0},":city_sunrise:":{unicode:["1f307"],isCanonical:!1},":rainbow:":{unicode:["1f308"],isCanonical:!0},":bridge_at_night:":{unicode:["1f309"],isCanonical:!0},":ocean:":{unicode:["1f30a"],isCanonical:!0},":volcano:":{unicode:["1f30b"],isCanonical:!0},":milky_way:":{unicode:["1f30c"],isCanonical:!0},":earth_asia:":{unicode:["1f30f"],isCanonical:!0},":new_moon:":{unicode:["1f311"],isCanonical:!0},":first_quarter_moon:":{unicode:["1f313"],isCanonical:!0},":waxing_gibbous_moon:":{unicode:["1f314"],isCanonical:!0},":full_moon:":{unicode:["1f315"],isCanonical:!0},":crescent_moon:":{unicode:["1f319"],isCanonical:!0},":first_quarter_moon_with_face:":{unicode:["1f31b"],isCanonical:!0},":star2:":{unicode:["1f31f"],isCanonical:!0},":stars:":{unicode:["1f320"],isCanonical:!0},":chestnut:":{unicode:["1f330"],isCanonical:!0},":seedling:":{unicode:["1f331"],isCanonical:!0},":palm_tree:":{unicode:["1f334"],isCanonical:!0},":cactus:":{unicode:["1f335"],isCanonical:!0},":tulip:":{unicode:["1f337"],isCanonical:!0},":cherry_blossom:":{unicode:["1f338"],isCanonical:!0},":rose:":{unicode:["1f339"],isCanonical:!0},":hibiscus:":{unicode:["1f33a"],isCanonical:!0},":sunflower:":{unicode:["1f33b"],isCanonical:!0},":blossom:":{unicode:["1f33c"],isCanonical:!0},":corn:":{unicode:["1f33d"],isCanonical:!0},":ear_of_rice:":{unicode:["1f33e"],isCanonical:!0},":herb:":{unicode:["1f33f"],isCanonical:!0},":four_leaf_clover:":{unicode:["1f340"],isCanonical:!0},":maple_leaf:":{unicode:["1f341"],isCanonical:!0},":fallen_leaf:":{unicode:["1f342"],isCanonical:!0},":leaves:":{unicode:["1f343"],isCanonical:!0},":mushroom:":{unicode:["1f344"],isCanonical:!0},":tomato:":{unicode:["1f345"],isCanonical:!0},":eggplant:":{unicode:["1f346"],isCanonical:!0},":grapes:":{unicode:["1f347"],isCanonical:!0},":melon:":{unicode:["1f348"],isCanonical:!0},":watermelon:":{unicode:["1f349"],isCanonical:!0},":tangerine:":{unicode:["1f34a"],isCanonical:!0},":banana:":{unicode:["1f34c"],isCanonical:!0},":pineapple:":{unicode:["1f34d"],isCanonical:!0},":apple:":{unicode:["1f34e"],isCanonical:!0},":green_apple:":{unicode:["1f34f"],isCanonical:!0},":peach:":{unicode:["1f351"],isCanonical:!0},":cherries:":{unicode:["1f352"],isCanonical:!0},":strawberry:":{unicode:["1f353"],isCanonical:!0},":hamburger:":{unicode:["1f354"],isCanonical:!0},":pizza:":{unicode:["1f355"],isCanonical:!0},":meat_on_bone:":{unicode:["1f356"],isCanonical:!0},":poultry_leg:":{unicode:["1f357"],isCanonical:!0},":rice_cracker:":{unicode:["1f358"],isCanonical:!0},":rice_ball:":{unicode:["1f359"],isCanonical:!0},":rice:":{unicode:["1f35a"],isCanonical:!0},":curry:":{unicode:["1f35b"],isCanonical:!0},":ramen:":{unicode:["1f35c"],isCanonical:!0},":spaghetti:":{unicode:["1f35d"],isCanonical:!0},":bread:":{unicode:["1f35e"],isCanonical:!0},":fries:":{unicode:["1f35f"],isCanonical:!0},":sweet_potato:":{unicode:["1f360"],isCanonical:!0},":dango:":{unicode:["1f361"],isCanonical:!0},":oden:":{unicode:["1f362"],isCanonical:!0},":sushi:":{unicode:["1f363"],isCanonical:!0},":fried_shrimp:":{unicode:["1f364"],isCanonical:!0},":fish_cake:":{unicode:["1f365"],isCanonical:!0},":icecream:":{unicode:["1f366"],isCanonical:!0},":shaved_ice:":{unicode:["1f367"],isCanonical:!0},":ice_cream:":{unicode:["1f368"],isCanonical:!0},":doughnut:":{unicode:["1f369"],isCanonical:!0},":cookie:":{unicode:["1f36a"],isCanonical:!0},":chocolate_bar:":{unicode:["1f36b"],isCanonical:!0},":candy:":{unicode:["1f36c"],isCanonical:!0},":lollipop:":{unicode:["1f36d"],isCanonical:!0},":custard:":{unicode:["1f36e"],isCanonical:!0},":honey_pot:":{unicode:["1f36f"],isCanonical:!0},":cake:":{unicode:["1f370"],isCanonical:!0},":bento:":{unicode:["1f371"],isCanonical:!0},":stew:":{unicode:["1f372"],isCanonical:!0},":egg:":{unicode:["1f373"],isCanonical:!0},":fork_and_knife:":{unicode:["1f374"],isCanonical:!0},":tea:":{unicode:["1f375"],isCanonical:!0},":sake:":{unicode:["1f376"],isCanonical:!0},":wine_glass:":{unicode:["1f377"],isCanonical:!0},":cocktail:":{unicode:["1f378"],isCanonical:!0},":tropical_drink:":{unicode:["1f379"],isCanonical:!0},":beer:":{unicode:["1f37a"],isCanonical:!0},":beers:":{unicode:["1f37b"],isCanonical:!0},":ribbon:":{unicode:["1f380"],isCanonical:!0},":gift:":{unicode:["1f381"],isCanonical:!0},":birthday:":{unicode:["1f382"],isCanonical:!0},":jack_o_lantern:":{unicode:["1f383"],isCanonical:!0},":christmas_tree:":{unicode:["1f384"],isCanonical:!0},":santa:":{unicode:["1f385"],isCanonical:!0},":fireworks:":{unicode:["1f386"],isCanonical:!0},":sparkler:":{unicode:["1f387"],isCanonical:!0},":balloon:":{unicode:["1f388"],isCanonical:!0},":tada:":{unicode:["1f389"],isCanonical:!0},":confetti_ball:":{unicode:["1f38a"],isCanonical:!0},":tanabata_tree:":{unicode:["1f38b"],isCanonical:!0},":crossed_flags:":{unicode:["1f38c"],isCanonical:!0},":bamboo:":{unicode:["1f38d"],isCanonical:!0},":dolls:":{unicode:["1f38e"],isCanonical:!0},":flags:":{unicode:["1f38f"],isCanonical:!0},":wind_chime:":{unicode:["1f390"],isCanonical:!0},":rice_scene:":{unicode:["1f391"],isCanonical:!0},":school_satchel:":{unicode:["1f392"],isCanonical:!0},":mortar_board:":{unicode:["1f393"],isCanonical:!0},":carousel_horse:":{unicode:["1f3a0"],isCanonical:!0},":ferris_wheel:":{unicode:["1f3a1"],isCanonical:!0},":roller_coaster:":{unicode:["1f3a2"],isCanonical:!0},":fishing_pole_and_fish:":{unicode:["1f3a3"],isCanonical:!0},":microphone:":{unicode:["1f3a4"],isCanonical:!0},":movie_camera:":{unicode:["1f3a5"],isCanonical:!0},":cinema:":{unicode:["1f3a6"],isCanonical:!0},":headphones:":{unicode:["1f3a7"],isCanonical:!0},":art:":{unicode:["1f3a8"],isCanonical:!0},":tophat:":{unicode:["1f3a9"],isCanonical:!0},":circus_tent:":{unicode:["1f3aa"],isCanonical:!0},":ticket:":{unicode:["1f3ab"],isCanonical:!0},":clapper:":{unicode:["1f3ac"],isCanonical:!0},":performing_arts:":{unicode:["1f3ad"],isCanonical:!0},":video_game:":{unicode:["1f3ae"],isCanonical:!0},":dart:":{unicode:["1f3af"],isCanonical:!0},":slot_machine:":{unicode:["1f3b0"],isCanonical:!0},":8ball:":{unicode:["1f3b1"],isCanonical:!0},":game_die:":{unicode:["1f3b2"],isCanonical:!0},":bowling:":{unicode:["1f3b3"],isCanonical:!0},":flower_playing_cards:":{unicode:["1f3b4"],isCanonical:!0},":musical_note:":{unicode:["1f3b5"],isCanonical:!0},":notes:":{unicode:["1f3b6"],isCanonical:!0},":saxophone:":{unicode:["1f3b7"],isCanonical:!0},":guitar:":{unicode:["1f3b8"],isCanonical:!0},":musical_keyboard:":{unicode:["1f3b9"],isCanonical:!0},":trumpet:":{unicode:["1f3ba"],isCanonical:!0},":violin:":{unicode:["1f3bb"],isCanonical:!0},":musical_score:":{unicode:["1f3bc"],isCanonical:!0},":running_shirt_with_sash:":{unicode:["1f3bd"],isCanonical:!0},":tennis:":{unicode:["1f3be"],isCanonical:!0},":ski:":{unicode:["1f3bf"],isCanonical:!0},":basketball:":{unicode:["1f3c0"],isCanonical:!0},":checkered_flag:":{unicode:["1f3c1"],isCanonical:!0},":snowboarder:":{unicode:["1f3c2"],isCanonical:!0},":runner:":{unicode:["1f3c3"],isCanonical:!0},":surfer:":{unicode:["1f3c4"],isCanonical:!0},":trophy:":{unicode:["1f3c6"],isCanonical:!0},":football:":{unicode:["1f3c8"],isCanonical:!0},":swimmer:":{unicode:["1f3ca"],isCanonical:!0},":house:":{unicode:["1f3e0"],isCanonical:!0},":house_with_garden:":{unicode:["1f3e1"],isCanonical:!0},":office:":{unicode:["1f3e2"],isCanonical:!0},":post_office:":{unicode:["1f3e3"],isCanonical:!0},":hospital:":{unicode:["1f3e5"],isCanonical:!0},":bank:":{unicode:["1f3e6"],isCanonical:!0},":atm:":{unicode:["1f3e7"],isCanonical:!0},":hotel:":{unicode:["1f3e8"],isCanonical:!0},":love_hotel:":{unicode:["1f3e9"],isCanonical:!0},":convenience_store:":{unicode:["1f3ea"],isCanonical:!0},":school:":{unicode:["1f3eb"],isCanonical:!0},":department_store:":{unicode:["1f3ec"],isCanonical:!0},":factory:":{unicode:["1f3ed"],isCanonical:!0},":izakaya_lantern:":{unicode:["1f3ee"],isCanonical:!0},":japanese_castle:":{unicode:["1f3ef"],isCanonical:!0},":european_castle:":{unicode:["1f3f0"],isCanonical:!0},":snail:":{unicode:["1f40c"],isCanonical:!0},":snake:":{unicode:["1f40d"],isCanonical:!0},":racehorse:":{unicode:["1f40e"],isCanonical:!0},":sheep:":{unicode:["1f411"],isCanonical:!0},":monkey:":{unicode:["1f412"],isCanonical:!0},":chicken:":{unicode:["1f414"],isCanonical:!0},":boar:":{unicode:["1f417"],isCanonical:!0},":elephant:":{unicode:["1f418"],isCanonical:!0},":octopus:":{unicode:["1f419"],isCanonical:!0},":shell:":{unicode:["1f41a"],isCanonical:!0},":bug:":{unicode:["1f41b"],isCanonical:!0},":ant:":{unicode:["1f41c"],isCanonical:!0},":bee:":{unicode:["1f41d"],isCanonical:!0},":beetle:":{unicode:["1f41e"],isCanonical:!0},":fish:":{unicode:["1f41f"],isCanonical:!0},":tropical_fish:":{unicode:["1f420"],isCanonical:!0},":blowfish:":{unicode:["1f421"],isCanonical:!0},":turtle:":{unicode:["1f422"],isCanonical:!0},":hatching_chick:":{unicode:["1f423"],isCanonical:!0},":baby_chick:":{unicode:["1f424"],isCanonical:!0},":hatched_chick:":{unicode:["1f425"],isCanonical:!0},":bird:":{unicode:["1f426"],isCanonical:!0},":penguin:":{unicode:["1f427"],isCanonical:!0},":koala:":{unicode:["1f428"],isCanonical:!0},":poodle:":{unicode:["1f429"],isCanonical:!0},":camel:":{unicode:["1f42b"],isCanonical:!0},":dolphin:":{unicode:["1f42c"],isCanonical:!0},":mouse:":{unicode:["1f42d"],isCanonical:!0},":cow:":{unicode:["1f42e"],isCanonical:!0},":tiger:":{unicode:["1f42f"],isCanonical:!0},":rabbit:":{unicode:["1f430"],isCanonical:!0},":cat:":{unicode:["1f431"],isCanonical:!0},":dragon_face:":{unicode:["1f432"],isCanonical:!0},":whale:":{unicode:["1f433"],isCanonical:!0},":horse:":{unicode:["1f434"],isCanonical:!0},":monkey_face:":{unicode:["1f435"],isCanonical:!0},":dog:":{unicode:["1f436"],isCanonical:!0},":pig:":{unicode:["1f437"],isCanonical:!0},":frog:":{unicode:["1f438"],isCanonical:!0},":hamster:":{unicode:["1f439"],isCanonical:!0},":wolf:":{unicode:["1f43a"],isCanonical:!0},":bear:":{unicode:["1f43b"],isCanonical:!0},":panda_face:":{unicode:["1f43c"],isCanonical:!0},":pig_nose:":{unicode:["1f43d"],isCanonical:!0},":feet:":{unicode:["1f43e"],isCanonical:!0},":paw_prints:":{unicode:["1f43e"],isCanonical:!1},":eyes:":{unicode:["1f440"],isCanonical:!0},":ear:":{unicode:["1f442"],isCanonical:!0},":nose:":{unicode:["1f443"],isCanonical:!0},":lips:":{unicode:["1f444"],isCanonical:!0},":tongue:":{unicode:["1f445"],isCanonical:!0},":point_up_2:":{unicode:["1f446"],isCanonical:!0},":point_down:":{unicode:["1f447"],isCanonical:!0},":point_left:":{unicode:["1f448"],isCanonical:!0},":point_right:":{unicode:["1f449"],isCanonical:!0},":punch:":{unicode:["1f44a"],isCanonical:!0},":wave:":{unicode:["1f44b"],isCanonical:!0},":ok_hand:":{unicode:["1f44c"],isCanonical:!0},":thumbsup:":{unicode:["1f44d"],isCanonical:!0},":+1:":{unicode:["1f44d"],isCanonical:!1},":thumbsdown:":{unicode:["1f44e"],isCanonical:!0},":-1:":{unicode:["1f44e"],isCanonical:!1},":clap:":{unicode:["1f44f"],isCanonical:!0},":open_hands:":{unicode:["1f450"],isCanonical:!0},":crown:":{unicode:["1f451"],isCanonical:!0},":womans_hat:":{unicode:["1f452"],isCanonical:!0},":eyeglasses:":{unicode:["1f453"],isCanonical:!0},":necktie:":{unicode:["1f454"],isCanonical:!0},":shirt:":{unicode:["1f455"],isCanonical:!0},":jeans:":{unicode:["1f456"],isCanonical:!0},":dress:":{unicode:["1f457"],isCanonical:!0},":kimono:":{unicode:["1f458"],isCanonical:!0},":bikini:":{unicode:["1f459"],isCanonical:!0},":womans_clothes:":{unicode:["1f45a"],isCanonical:!0},":purse:":{unicode:["1f45b"],isCanonical:!0},":handbag:":{unicode:["1f45c"],isCanonical:!0},":pouch:":{unicode:["1f45d"],isCanonical:!0},":mans_shoe:":{unicode:["1f45e"],isCanonical:!0},":athletic_shoe:":{unicode:["1f45f"],isCanonical:!0},":high_heel:":{unicode:["1f460"],isCanonical:!0},":sandal:":{unicode:["1f461"],isCanonical:!0},":boot:":{unicode:["1f462"],isCanonical:!0},":footprints:":{unicode:["1f463"],isCanonical:!0},":bust_in_silhouette:":{unicode:["1f464"],isCanonical:!0},":boy:":{unicode:["1f466"],isCanonical:!0},":girl:":{unicode:["1f467"],isCanonical:!0},":man:":{unicode:["1f468"],isCanonical:!0},":woman:":{unicode:["1f469"],isCanonical:!0},":family:":{unicode:["1f46a"],isCanonical:!0},":couple:":{unicode:["1f46b"],isCanonical:!0},":cop:":{unicode:["1f46e"],isCanonical:!0},":dancers:":{unicode:["1f46f"],isCanonical:!0},":bride_with_veil:":{unicode:["1f470"],isCanonical:!0},":person_with_blond_hair:":{unicode:["1f471"],isCanonical:!0},":man_with_gua_pi_mao:":{unicode:["1f472"],isCanonical:!0},":man_with_turban:":{unicode:["1f473"],isCanonical:!0},":older_man:":{unicode:["1f474"],isCanonical:!0},":older_woman:":{unicode:["1f475"],isCanonical:!0},":grandma:":{unicode:["1f475"],isCanonical:!1},":baby:":{unicode:["1f476"],isCanonical:!0},":construction_worker:":{unicode:["1f477"],isCanonical:!0},":princess:":{unicode:["1f478"],isCanonical:!0},":japanese_ogre:":{unicode:["1f479"],isCanonical:!0},":japanese_goblin:":{unicode:["1f47a"],isCanonical:!0},":ghost:":{unicode:["1f47b"],isCanonical:!0},":angel:":{unicode:["1f47c"],isCanonical:!0},":alien:":{unicode:["1f47d"],isCanonical:!0},":space_invader:":{unicode:["1f47e"],isCanonical:!0},":imp:":{unicode:["1f47f"],isCanonical:!0},":skull:":{unicode:["1f480"],isCanonical:!0},":skeleton:":{unicode:["1f480"],isCanonical:!1},":card_index:":{unicode:["1f4c7"],isCanonical:!0},":information_desk_person:":{unicode:["1f481"],isCanonical:!0},":guardsman:":{unicode:["1f482"],isCanonical:!0},":dancer:":{unicode:["1f483"],isCanonical:!0},":lipstick:":{unicode:["1f484"],isCanonical:!0},":nail_care:":{unicode:["1f485"],isCanonical:!0},":ledger:":{unicode:["1f4d2"],isCanonical:!0},":massage:":{unicode:["1f486"],isCanonical:!0},":notebook:":{unicode:["1f4d3"],isCanonical:!0},":haircut:":{unicode:["1f487"],isCanonical:!0},":notebook_with_decorative_cover:":{unicode:["1f4d4"],isCanonical:!0},":barber:":{unicode:["1f488"],isCanonical:!0},":closed_book:":{unicode:["1f4d5"],isCanonical:!0},":syringe:":{unicode:["1f489"],isCanonical:!0},":book:":{unicode:["1f4d6"],isCanonical:!0},":pill:":{unicode:["1f48a"],isCanonical:!0},":green_book:":{unicode:["1f4d7"],isCanonical:!0},":kiss:":{unicode:["1f48b"],isCanonical:!0},":blue_book:":{unicode:["1f4d8"],isCanonical:!0},":love_letter:":{unicode:["1f48c"],isCanonical:!0},":orange_book:":{unicode:["1f4d9"],isCanonical:!0},":ring:":{unicode:["1f48d"],isCanonical:!0},":books:":{unicode:["1f4da"],isCanonical:!0},":gem:":{unicode:["1f48e"],isCanonical:!0},":name_badge:":{unicode:["1f4db"],isCanonical:!0},":couplekiss:":{unicode:["1f48f"],isCanonical:!0},":scroll:":{unicode:["1f4dc"],isCanonical:!0},":bouquet:":{unicode:["1f490"],isCanonical:!0},":pencil:":{unicode:["1f4dd"],isCanonical:!0},":couple_with_heart:":{unicode:["1f491"],isCanonical:!0},":telephone_receiver:":{unicode:["1f4de"],isCanonical:!0},":wedding:":{unicode:["1f492"],isCanonical:!0},":pager:":{unicode:["1f4df"],isCanonical:!0},":fax:":{unicode:["1f4e0"],isCanonical:!0},":heartbeat:":{unicode:["1f493"],isCanonical:!0},":satellite:":{unicode:["1f4e1"],isCanonical:!0},":loudspeaker:":{unicode:["1f4e2"],isCanonical:!0},":broken_heart:":{unicode:["1f494"],isCanonical:!0},":mega:":{unicode:["1f4e3"],isCanonical:!0},":outbox_tray:":{unicode:["1f4e4"],isCanonical:!0},":two_hearts:":{unicode:["1f495"],isCanonical:!0},":inbox_tray:":{unicode:["1f4e5"],isCanonical:!0},":package:":{unicode:["1f4e6"],isCanonical:!0},":sparkling_heart:":{unicode:["1f496"],isCanonical:!0},":e-mail:":{unicode:["1f4e7"],isCanonical:!0},":email:":{unicode:["1f4e7"],isCanonical:!1},":incoming_envelope:":{unicode:["1f4e8"],isCanonical:!0},":heartpulse:":{unicode:["1f497"],isCanonical:!0},":envelope_with_arrow:":{unicode:["1f4e9"],isCanonical:!0},":mailbox_closed:":{unicode:["1f4ea"],isCanonical:!0},":cupid:":{unicode:["1f498"],isCanonical:!0},":mailbox:":{unicode:["1f4eb"],isCanonical:!0},":postbox:":{unicode:["1f4ee"],isCanonical:!0},":blue_heart:":{unicode:["1f499"],isCanonical:!0},":newspaper:":{unicode:["1f4f0"],isCanonical:!0},":iphone:":{unicode:["1f4f1"],isCanonical:!0},":green_heart:":{unicode:["1f49a"],isCanonical:!0},":calling:":{unicode:["1f4f2"],isCanonical:!0},":vibration_mode:":{unicode:["1f4f3"],isCanonical:!0},":yellow_heart:":{unicode:["1f49b"],isCanonical:!0},":mobile_phone_off:":{unicode:["1f4f4"],isCanonical:!0},":signal_strength:":{unicode:["1f4f6"],isCanonical:!0},":purple_heart:":{unicode:["1f49c"],isCanonical:!0},":camera:":{unicode:["1f4f7"],isCanonical:!0},":video_camera:":{unicode:["1f4f9"],isCanonical:!0},":gift_heart:":{unicode:["1f49d"],isCanonical:!0},":tv:":{unicode:["1f4fa"],isCanonical:!0},":radio:":{unicode:["1f4fb"],isCanonical:!0},":revolving_hearts:":{unicode:["1f49e"],isCanonical:!0},":vhs:":{unicode:["1f4fc"],isCanonical:!0},":arrows_clockwise:":{unicode:["1f503"],isCanonical:!0},":heart_decoration:":{unicode:["1f49f"],isCanonical:!0},":loud_sound:":{unicode:["1f50a"],isCanonical:!0},":battery:":{unicode:["1f50b"],isCanonical:!0},":diamond_shape_with_a_dot_inside:":{unicode:["1f4a0"],isCanonical:!0},":electric_plug:":{unicode:["1f50c"],isCanonical:!0},":mag:":{unicode:["1f50d"],isCanonical:!0},":bulb:":{unicode:["1f4a1"],isCanonical:!0},":mag_right:":{unicode:["1f50e"],isCanonical:!0},":lock_with_ink_pen:":{unicode:["1f50f"],isCanonical:!0},":anger:":{unicode:["1f4a2"],isCanonical:!0},":closed_lock_with_key:":{unicode:["1f510"],isCanonical:!0},":key:":{unicode:["1f511"],isCanonical:!0},":bomb:":{unicode:["1f4a3"],isCanonical:!0},":lock:":{unicode:["1f512"],isCanonical:!0},":unlock:":{unicode:["1f513"],isCanonical:!0},":zzz:":{unicode:["1f4a4"],isCanonical:!0},":bell:":{unicode:["1f514"],isCanonical:!0},":bookmark:":{unicode:["1f516"],isCanonical:!0},":boom:":{unicode:["1f4a5"],isCanonical:!0},":link:":{unicode:["1f517"],isCanonical:!0},":radio_button:":{unicode:["1f518"],isCanonical:!0},":sweat_drops:":{unicode:["1f4a6"],isCanonical:!0},":back:":{unicode:["1f519"],isCanonical:!0},":end:":{unicode:["1f51a"],isCanonical:!0},":droplet:":{unicode:["1f4a7"],isCanonical:!0},":on:":{unicode:["1f51b"],isCanonical:!0},":soon:":{unicode:["1f51c"],isCanonical:!0},":dash:":{unicode:["1f4a8"],isCanonical:!0},":top:":{unicode:["1f51d"],isCanonical:!0},":underage:":{unicode:["1f51e"],isCanonical:!0},":poop:":{unicode:["1f4a9"],isCanonical:!0},":shit:":{unicode:["1f4a9"],isCanonical:!1},":hankey:":{unicode:["1f4a9"],isCanonical:!1},":poo:":{unicode:["1f4a9"],isCanonical:!1},":ten:":{unicode:["1f51f"],isCanonical:!0},":muscle:":{unicode:["1f4aa"],isCanonical:!0},":capital_abcd:":{unicode:["1f520"],isCanonical:!0},":abcd:":{unicode:["1f521"],isCanonical:!0},":dizzy:":{unicode:["1f4ab"],isCanonical:!0},":1234:":{unicode:["1f522"],isCanonical:!0},":symbols:":{unicode:["1f523"],isCanonical:!0},":speech_balloon:":{unicode:["1f4ac"],isCanonical:!0},":abc:":{unicode:["1f524"],isCanonical:!0},":fire:":{unicode:["1f525"],isCanonical:!0},":flame:":{unicode:["1f525"],isCanonical:!1},":white_flower:":{unicode:["1f4ae"],isCanonical:!0},":flashlight:":{unicode:["1f526"],isCanonical:!0},":wrench:":{unicode:["1f527"],isCanonical:!0},":100:":{unicode:["1f4af"],isCanonical:!0},":hammer:":{unicode:["1f528"],isCanonical:!0},":nut_and_bolt:":{unicode:["1f529"],isCanonical:!0},":moneybag:":{unicode:["1f4b0"],isCanonical:!0},":knife:":{unicode:["1f52a"],isCanonical:!0},":gun:":{unicode:["1f52b"],isCanonical:!0},":currency_exchange:":{unicode:["1f4b1"],isCanonical:!0},":crystal_ball:":{unicode:["1f52e"],isCanonical:!0},":heavy_dollar_sign:":{unicode:["1f4b2"],isCanonical:!0},":six_pointed_star:":{unicode:["1f52f"],isCanonical:!0},":credit_card:":{unicode:["1f4b3"],isCanonical:!0},":beginner:":{unicode:["1f530"],isCanonical:!0},":trident:":{unicode:["1f531"],isCanonical:!0},":yen:":{unicode:["1f4b4"],isCanonical:!0},":black_square_button:":{unicode:["1f532"],isCanonical:!0},":white_square_button:":{unicode:["1f533"],isCanonical:!0},":dollar:":{unicode:["1f4b5"],isCanonical:!0},":red_circle:":{unicode:["1f534"],isCanonical:!0},":large_blue_circle:":{unicode:["1f535"],isCanonical:!0},":money_with_wings:":{unicode:["1f4b8"],isCanonical:!0},":large_orange_diamond:":{unicode:["1f536"],isCanonical:!0},":large_blue_diamond:":{unicode:["1f537"],isCanonical:!0},":chart:":{unicode:["1f4b9"],isCanonical:!0},":small_orange_diamond:":{unicode:["1f538"],isCanonical:!0},":small_blue_diamond:":{unicode:["1f539"],isCanonical:!0},":seat:":{unicode:["1f4ba"],isCanonical:!0},":small_red_triangle:":{unicode:["1f53a"],isCanonical:!0},":small_red_triangle_down:":{unicode:["1f53b"],isCanonical:!0},":computer:":{unicode:["1f4bb"],isCanonical:!0},":arrow_up_small:":{unicode:["1f53c"],isCanonical:!0},":briefcase:":{unicode:["1f4bc"],isCanonical:!0},":arrow_down_small:":{unicode:["1f53d"],isCanonical:!0},":clock1:":{unicode:["1f550"],isCanonical:!0},":minidisc:":{unicode:["1f4bd"],isCanonical:!0},":clock2:":{unicode:["1f551"],isCanonical:!0},":floppy_disk:":{unicode:["1f4be"],isCanonical:!0},":clock3:":{unicode:["1f552"],isCanonical:!0},":cd:":{unicode:["1f4bf"],isCanonical:!0},":clock4:":{unicode:["1f553"],isCanonical:!0},":dvd:":{unicode:["1f4c0"],isCanonical:!0},":clock5:":{unicode:["1f554"],isCanonical:!0},":clock6:":{unicode:["1f555"],isCanonical:!0},":file_folder:":{unicode:["1f4c1"],isCanonical:!0},":clock7:":{unicode:["1f556"],isCanonical:!0},":clock8:":{unicode:["1f557"],isCanonical:!0},":open_file_folder:":{unicode:["1f4c2"],isCanonical:!0},":clock9:":{unicode:["1f558"],isCanonical:!0},":clock10:":{unicode:["1f559"],isCanonical:!0},":page_with_curl:":{unicode:["1f4c3"],isCanonical:!0},":clock11:":{unicode:["1f55a"],isCanonical:!0},":clock12:":{unicode:["1f55b"],isCanonical:!0},":page_facing_up:":{unicode:["1f4c4"],isCanonical:!0},":mount_fuji:":{unicode:["1f5fb"],isCanonical:!0},":tokyo_tower:":{unicode:["1f5fc"],isCanonical:!0},":date:":{unicode:["1f4c5"],isCanonical:!0},":statue_of_liberty:":{unicode:["1f5fd"],isCanonical:!0},":japan:":{unicode:["1f5fe"],isCanonical:!0},":calendar:":{unicode:["1f4c6"],isCanonical:!0},":moyai:":{unicode:["1f5ff"],isCanonical:!0},":grin:":{unicode:["1f601"],isCanonical:!0},":joy:":{unicode:["1f602"],isCanonical:!0},":smiley:":{unicode:["1f603"],isCanonical:!0},":chart_with_upwards_trend:":{unicode:["1f4c8"],isCanonical:!0},":smile:":{unicode:["1f604"],isCanonical:!0},":sweat_smile:":{unicode:["1f605"],isCanonical:!0},":chart_with_downwards_trend:":{
    unicode:["1f4c9"],isCanonical:!0},":laughing:":{unicode:["1f606"],isCanonical:!0},":satisfied:":{unicode:["1f606"],isCanonical:!1},":wink:":{unicode:["1f609"],isCanonical:!0},":bar_chart:":{unicode:["1f4ca"],isCanonical:!0},":blush:":{unicode:["1f60a"],isCanonical:!0},":yum:":{unicode:["1f60b"],isCanonical:!0},":clipboard:":{unicode:["1f4cb"],isCanonical:!0},":relieved:":{unicode:["1f60c"],isCanonical:!0},":heart_eyes:":{unicode:["1f60d"],isCanonical:!0},":pushpin:":{unicode:["1f4cc"],isCanonical:!0},":smirk:":{unicode:["1f60f"],isCanonical:!0},":unamused:":{unicode:["1f612"],isCanonical:!0},":round_pushpin:":{unicode:["1f4cd"],isCanonical:!0},":sweat:":{unicode:["1f613"],isCanonical:!0},":pensive:":{unicode:["1f614"],isCanonical:!0},":paperclip:":{unicode:["1f4ce"],isCanonical:!0},":confounded:":{unicode:["1f616"],isCanonical:!0},":kissing_heart:":{unicode:["1f618"],isCanonical:!0},":straight_ruler:":{unicode:["1f4cf"],isCanonical:!0},":kissing_closed_eyes:":{unicode:["1f61a"],isCanonical:!0},":stuck_out_tongue_winking_eye:":{unicode:["1f61c"],isCanonical:!0},":triangular_ruler:":{unicode:["1f4d0"],isCanonical:!0},":stuck_out_tongue_closed_eyes:":{unicode:["1f61d"],isCanonical:!0},":disappointed:":{unicode:["1f61e"],isCanonical:!0},":bookmark_tabs:":{unicode:["1f4d1"],isCanonical:!0},":angry:":{unicode:["1f620"],isCanonical:!0},":rage:":{unicode:["1f621"],isCanonical:!0},":cry:":{unicode:["1f622"],isCanonical:!0},":persevere:":{unicode:["1f623"],isCanonical:!0},":triumph:":{unicode:["1f624"],isCanonical:!0},":disappointed_relieved:":{unicode:["1f625"],isCanonical:!0},":fearful:":{unicode:["1f628"],isCanonical:!0},":weary:":{unicode:["1f629"],isCanonical:!0},":sleepy:":{unicode:["1f62a"],isCanonical:!0},":tired_face:":{unicode:["1f62b"],isCanonical:!0},":sob:":{unicode:["1f62d"],isCanonical:!0},":cold_sweat:":{unicode:["1f630"],isCanonical:!0},":scream:":{unicode:["1f631"],isCanonical:!0},":astonished:":{unicode:["1f632"],isCanonical:!0},":flushed:":{unicode:["1f633"],isCanonical:!0},":dizzy_face:":{unicode:["1f635"],isCanonical:!0},":mask:":{unicode:["1f637"],isCanonical:!0},":smile_cat:":{unicode:["1f638"],isCanonical:!0},":joy_cat:":{unicode:["1f639"],isCanonical:!0},":smiley_cat:":{unicode:["1f63a"],isCanonical:!0},":heart_eyes_cat:":{unicode:["1f63b"],isCanonical:!0},":smirk_cat:":{unicode:["1f63c"],isCanonical:!0},":kissing_cat:":{unicode:["1f63d"],isCanonical:!0},":pouting_cat:":{unicode:["1f63e"],isCanonical:!0},":crying_cat_face:":{unicode:["1f63f"],isCanonical:!0},":scream_cat:":{unicode:["1f640"],isCanonical:!0},":no_good:":{unicode:["1f645"],isCanonical:!0},":ok_woman:":{unicode:["1f646"],isCanonical:!0},":bow:":{unicode:["1f647"],isCanonical:!0},":see_no_evil:":{unicode:["1f648"],isCanonical:!0},":hear_no_evil:":{unicode:["1f649"],isCanonical:!0},":speak_no_evil:":{unicode:["1f64a"],isCanonical:!0},":raising_hand:":{unicode:["1f64b"],isCanonical:!0},":raised_hands:":{unicode:["1f64c"],isCanonical:!0},":person_frowning:":{unicode:["1f64d"],isCanonical:!0},":person_with_pouting_face:":{unicode:["1f64e"],isCanonical:!0},":pray:":{unicode:["1f64f"],isCanonical:!0},":rocket:":{unicode:["1f680"],isCanonical:!0},":railway_car:":{unicode:["1f683"],isCanonical:!0},":bullettrain_side:":{unicode:["1f684"],isCanonical:!0},":bullettrain_front:":{unicode:["1f685"],isCanonical:!0},":metro:":{unicode:["1f687"],isCanonical:!0},":station:":{unicode:["1f689"],isCanonical:!0},":bus:":{unicode:["1f68c"],isCanonical:!0},":busstop:":{unicode:["1f68f"],isCanonical:!0},":ambulance:":{unicode:["1f691"],isCanonical:!0},":fire_engine:":{unicode:["1f692"],isCanonical:!0},":police_car:":{unicode:["1f693"],isCanonical:!0},":taxi:":{unicode:["1f695"],isCanonical:!0},":red_car:":{unicode:["1f697"],isCanonical:!0},":blue_car:":{unicode:["1f699"],isCanonical:!0},":truck:":{unicode:["1f69a"],isCanonical:!0},":ship:":{unicode:["1f6a2"],isCanonical:!0},":speedboat:":{unicode:["1f6a4"],isCanonical:!0},":traffic_light:":{unicode:["1f6a5"],isCanonical:!0},":construction:":{unicode:["1f6a7"],isCanonical:!0},":rotating_light:":{unicode:["1f6a8"],isCanonical:!0},":triangular_flag_on_post:":{unicode:["1f6a9"],isCanonical:!0},":door:":{unicode:["1f6aa"],isCanonical:!0},":no_entry_sign:":{unicode:["1f6ab"],isCanonical:!0},":smoking:":{unicode:["1f6ac"],isCanonical:!0},":no_smoking:":{unicode:["1f6ad"],isCanonical:!0},":bike:":{unicode:["1f6b2"],isCanonical:!0},":walking:":{unicode:["1f6b6"],isCanonical:!0},":mens:":{unicode:["1f6b9"],isCanonical:!0},":womens:":{unicode:["1f6ba"],isCanonical:!0},":restroom:":{unicode:["1f6bb"],isCanonical:!0},":baby_symbol:":{unicode:["1f6bc"],isCanonical:!0},":toilet:":{unicode:["1f6bd"],isCanonical:!0},":wc:":{unicode:["1f6be"],isCanonical:!0},":bath:":{unicode:["1f6c0"],isCanonical:!0},":metal:":{unicode:["1f918"],isCanonical:!0},":sign_of_the_horns:":{unicode:["1f918"],isCanonical:!1},":grinning:":{unicode:["1f600"],isCanonical:!0},":innocent:":{unicode:["1f607"],isCanonical:!0},":smiling_imp:":{unicode:["1f608"],isCanonical:!0},":sunglasses:":{unicode:["1f60e"],isCanonical:!0},":neutral_face:":{unicode:["1f610"],isCanonical:!0},":expressionless:":{unicode:["1f611"],isCanonical:!0},":confused:":{unicode:["1f615"],isCanonical:!0},":kissing:":{unicode:["1f617"],isCanonical:!0},":kissing_smiling_eyes:":{unicode:["1f619"],isCanonical:!0},":stuck_out_tongue:":{unicode:["1f61b"],isCanonical:!0},":worried:":{unicode:["1f61f"],isCanonical:!0},":frowning:":{unicode:["1f626"],isCanonical:!0},":anguished:":{unicode:["1f627"],isCanonical:!0},":grimacing:":{unicode:["1f62c"],isCanonical:!0},":open_mouth:":{unicode:["1f62e"],isCanonical:!0},":hushed:":{unicode:["1f62f"],isCanonical:!0},":sleeping:":{unicode:["1f634"],isCanonical:!0},":no_mouth:":{unicode:["1f636"],isCanonical:!0},":helicopter:":{unicode:["1f681"],isCanonical:!0},":steam_locomotive:":{unicode:["1f682"],isCanonical:!0},":train2:":{unicode:["1f686"],isCanonical:!0},":light_rail:":{unicode:["1f688"],isCanonical:!0},":tram:":{unicode:["1f68a"],isCanonical:!0},":oncoming_bus:":{unicode:["1f68d"],isCanonical:!0},":trolleybus:":{unicode:["1f68e"],isCanonical:!0},":minibus:":{unicode:["1f690"],isCanonical:!0},":oncoming_police_car:":{unicode:["1f694"],isCanonical:!0},":oncoming_taxi:":{unicode:["1f696"],isCanonical:!0},":oncoming_automobile:":{unicode:["1f698"],isCanonical:!0},":articulated_lorry:":{unicode:["1f69b"],isCanonical:!0},":tractor:":{unicode:["1f69c"],isCanonical:!0},":monorail:":{unicode:["1f69d"],isCanonical:!0},":mountain_railway:":{unicode:["1f69e"],isCanonical:!0},":suspension_railway:":{unicode:["1f69f"],isCanonical:!0},":mountain_cableway:":{unicode:["1f6a0"],isCanonical:!0},":aerial_tramway:":{unicode:["1f6a1"],isCanonical:!0},":rowboat:":{unicode:["1f6a3"],isCanonical:!0},":vertical_traffic_light:":{unicode:["1f6a6"],isCanonical:!0},":put_litter_in_its_place:":{unicode:["1f6ae"],isCanonical:!0},":do_not_litter:":{unicode:["1f6af"],isCanonical:!0},":potable_water:":{unicode:["1f6b0"],isCanonical:!0},":non-potable_water:":{unicode:["1f6b1"],isCanonical:!0},":no_bicycles:":{unicode:["1f6b3"],isCanonical:!0},":bicyclist:":{unicode:["1f6b4"],isCanonical:!0},":mountain_bicyclist:":{unicode:["1f6b5"],isCanonical:!0},":no_pedestrians:":{unicode:["1f6b7"],isCanonical:!0},":children_crossing:":{unicode:["1f6b8"],isCanonical:!0},":shower:":{unicode:["1f6bf"],isCanonical:!0},":bathtub:":{unicode:["1f6c1"],isCanonical:!0},":passport_control:":{unicode:["1f6c2"],isCanonical:!0},":customs:":{unicode:["1f6c3"],isCanonical:!0},":baggage_claim:":{unicode:["1f6c4"],isCanonical:!0},":left_luggage:":{unicode:["1f6c5"],isCanonical:!0},":earth_africa:":{unicode:["1f30d"],isCanonical:!0},":earth_americas:":{unicode:["1f30e"],isCanonical:!0},":globe_with_meridians:":{unicode:["1f310"],isCanonical:!0},":waxing_crescent_moon:":{unicode:["1f312"],isCanonical:!0},":waning_gibbous_moon:":{unicode:["1f316"],isCanonical:!0},":last_quarter_moon:":{unicode:["1f317"],isCanonical:!0},":waning_crescent_moon:":{unicode:["1f318"],isCanonical:!0},":new_moon_with_face:":{unicode:["1f31a"],isCanonical:!0},":last_quarter_moon_with_face:":{unicode:["1f31c"],isCanonical:!0},":full_moon_with_face:":{unicode:["1f31d"],isCanonical:!0},":sun_with_face:":{unicode:["1f31e"],isCanonical:!0},":evergreen_tree:":{unicode:["1f332"],isCanonical:!0},":deciduous_tree:":{unicode:["1f333"],isCanonical:!0},":lemon:":{unicode:["1f34b"],isCanonical:!0},":pear:":{unicode:["1f350"],isCanonical:!0},":baby_bottle:":{unicode:["1f37c"],isCanonical:!0},":horse_racing:":{unicode:["1f3c7"],isCanonical:!0},":rugby_football:":{unicode:["1f3c9"],isCanonical:!0},":european_post_office:":{unicode:["1f3e4"],isCanonical:!0},":rat:":{unicode:["1f400"],isCanonical:!0},":mouse2:":{unicode:["1f401"],isCanonical:!0},":ox:":{unicode:["1f402"],isCanonical:!0},":water_buffalo:":{unicode:["1f403"],isCanonical:!0},":cow2:":{unicode:["1f404"],isCanonical:!0},":tiger2:":{unicode:["1f405"],isCanonical:!0},":leopard:":{unicode:["1f406"],isCanonical:!0},":rabbit2:":{unicode:["1f407"],isCanonical:!0},":cat2:":{unicode:["1f408"],isCanonical:!0},":dragon:":{unicode:["1f409"],isCanonical:!0},":crocodile:":{unicode:["1f40a"],isCanonical:!0},":whale2:":{unicode:["1f40b"],isCanonical:!0},":ram:":{unicode:["1f40f"],isCanonical:!0},":goat:":{unicode:["1f410"],isCanonical:!0},":rooster:":{unicode:["1f413"],isCanonical:!0},":dog2:":{unicode:["1f415"],isCanonical:!0},":pig2:":{unicode:["1f416"],isCanonical:!0},":dromedary_camel:":{unicode:["1f42a"],isCanonical:!0},":busts_in_silhouette:":{unicode:["1f465"],isCanonical:!0},":two_men_holding_hands:":{unicode:["1f46c"],isCanonical:!0},":two_women_holding_hands:":{unicode:["1f46d"],isCanonical:!0},":thought_balloon:":{unicode:["1f4ad"],isCanonical:!0},":euro:":{unicode:["1f4b6"],isCanonical:!0},":pound:":{unicode:["1f4b7"],isCanonical:!0},":mailbox_with_mail:":{unicode:["1f4ec"],isCanonical:!0},":mailbox_with_no_mail:":{unicode:["1f4ed"],isCanonical:!0},":postal_horn:":{unicode:["1f4ef"],isCanonical:!0},":no_mobile_phones:":{unicode:["1f4f5"],isCanonical:!0},":twisted_rightwards_arrows:":{unicode:["1f500"],isCanonical:!0},":repeat:":{unicode:["1f501"],isCanonical:!0},":repeat_one:":{unicode:["1f502"],isCanonical:!0},":arrows_counterclockwise:":{unicode:["1f504"],isCanonical:!0},":low_brightness:":{unicode:["1f505"],isCanonical:!0},":high_brightness:":{unicode:["1f506"],isCanonical:!0},":mute:":{unicode:["1f507"],isCanonical:!0},":sound:":{unicode:["1f509"],isCanonical:!0},":no_bell:":{unicode:["1f515"],isCanonical:!0},":microscope:":{unicode:["1f52c"],isCanonical:!0},":telescope:":{unicode:["1f52d"],isCanonical:!0},":clock130:":{unicode:["1f55c"],isCanonical:!0},":clock230:":{unicode:["1f55d"],isCanonical:!0},":clock330:":{unicode:["1f55e"],isCanonical:!0},":clock430:":{unicode:["1f55f"],isCanonical:!0},":clock530:":{unicode:["1f560"],isCanonical:!0},":clock630:":{unicode:["1f561"],isCanonical:!0},":clock730:":{unicode:["1f562"],isCanonical:!0},":clock830:":{unicode:["1f563"],isCanonical:!0},":clock930:":{unicode:["1f564"],isCanonical:!0},":clock1030:":{unicode:["1f565"],isCanonical:!0},":clock1130:":{unicode:["1f566"],isCanonical:!0},":clock1230:":{unicode:["1f567"],isCanonical:!0},":speaker:":{unicode:["1f508"],isCanonical:!0},":train:":{unicode:["1f68b"],isCanonical:!0},":medal:":{unicode:["1f3c5"],isCanonical:!0},":sports_medal:":{unicode:["1f3c5"],isCanonical:!1},":flag_black:":{unicode:["1f3f4"],isCanonical:!0},":waving_black_flag:":{unicode:["1f3f4"],isCanonical:!1},":camera_with_flash:":{unicode:["1f4f8"],isCanonical:!0},":sleeping_accommodation:":{unicode:["1f6cc"],isCanonical:!0},":middle_finger:":{unicode:["1f595"],isCanonical:!0},":reversed_hand_with_middle_finger_extended:":{unicode:["1f595"],isCanonical:!1},":vulcan:":{unicode:["1f596"],isCanonical:!0},":raised_hand_with_part_between_middle_and_ring_fingers:":{unicode:["1f596"],isCanonical:!1},":slight_frown:":{unicode:["1f641"],isCanonical:!0},":slightly_frowning_face:":{unicode:["1f641"],isCanonical:!1},":slight_smile:":{unicode:["1f642"],isCanonical:!0},":slightly_smiling_face:":{unicode:["1f642"],isCanonical:!1},":airplane_departure:":{unicode:["1f6eb"],isCanonical:!0},":airplane_arriving:":{unicode:["1f6ec"],isCanonical:!0},":tone1:":{unicode:["1f3fb"],isCanonical:!0},":tone2:":{unicode:["1f3fc"],isCanonical:!0},":tone3:":{unicode:["1f3fd"],isCanonical:!0},":tone4:":{unicode:["1f3fe"],isCanonical:!0},":tone5:":{unicode:["1f3ff"],isCanonical:!0},":upside_down:":{unicode:["1f643"],isCanonical:!0},":upside_down_face:":{unicode:["1f643"],isCanonical:!1},":money_mouth:":{unicode:["1f911"],isCanonical:!0},":money_mouth_face:":{unicode:["1f911"],isCanonical:!1},":nerd:":{unicode:["1f913"],isCanonical:!0},":nerd_face:":{unicode:["1f913"],isCanonical:!1},":hugging:":{unicode:["1f917"],isCanonical:!0},":hugging_face:":{unicode:["1f917"],isCanonical:!1},":rolling_eyes:":{unicode:["1f644"],isCanonical:!0},":face_with_rolling_eyes:":{unicode:["1f644"],isCanonical:!1},":thinking:":{unicode:["1f914"],isCanonical:!0},":thinking_face:":{unicode:["1f914"],isCanonical:!1},":zipper_mouth:":{unicode:["1f910"],isCanonical:!0},":zipper_mouth_face:":{unicode:["1f910"],isCanonical:!1},":thermometer_face:":{unicode:["1f912"],isCanonical:!0},":face_with_thermometer:":{unicode:["1f912"],isCanonical:!1},":head_bandage:":{unicode:["1f915"],isCanonical:!0},":face_with_head_bandage:":{unicode:["1f915"],isCanonical:!1},":robot:":{unicode:["1f916"],isCanonical:!0},":robot_face:":{unicode:["1f916"],isCanonical:!1},":lion_face:":{unicode:["1f981"],isCanonical:!0},":lion:":{unicode:["1f981"],isCanonical:!1},":unicorn:":{unicode:["1f984"],isCanonical:!0},":unicorn_face:":{unicode:["1f984"],isCanonical:!1},":scorpion:":{unicode:["1f982"],isCanonical:!0},":crab:":{unicode:["1f980"],isCanonical:!0},":turkey:":{unicode:["1f983"],isCanonical:!0},":cheese:":{unicode:["1f9c0"],isCanonical:!0},":cheese_wedge:":{unicode:["1f9c0"],isCanonical:!1},":hotdog:":{unicode:["1f32d"],isCanonical:!0},":hot_dog:":{unicode:["1f32d"],isCanonical:!1},":taco:":{unicode:["1f32e"],isCanonical:!0},":burrito:":{unicode:["1f32f"],isCanonical:!0},":popcorn:":{unicode:["1f37f"],isCanonical:!0},":champagne:":{unicode:["1f37e"],isCanonical:!0},":bottle_with_popping_cork:":{unicode:["1f37e"],isCanonical:!1},":bow_and_arrow:":{unicode:["1f3f9"],isCanonical:!0},":archery:":{unicode:["1f3f9"],isCanonical:!1},":amphora:":{unicode:["1f3fa"],isCanonical:!0},":place_of_worship:":{unicode:["1f6d0"],isCanonical:!0},":worship_symbol:":{unicode:["1f6d0"],isCanonical:!1},":kaaba:":{unicode:["1f54b"],isCanonical:!0},":mosque:":{unicode:["1f54c"],isCanonical:!0},":synagogue:":{unicode:["1f54d"],isCanonical:!0},":menorah:":{unicode:["1f54e"],isCanonical:!0},":prayer_beads:":{unicode:["1f4ff"],isCanonical:!0},":cricket:":{unicode:["1f3cf"],isCanonical:!0},":cricket_bat_ball:":{unicode:["1f3cf"],isCanonical:!1},":volleyball:":{unicode:["1f3d0"],isCanonical:!0},":field_hockey:":{unicode:["1f3d1"],isCanonical:!0},":hockey:":{unicode:["1f3d2"],isCanonical:!0},":ping_pong:":{unicode:["1f3d3"],isCanonical:!0},":table_tennis:":{unicode:["1f3d3"],isCanonical:!1},":badminton:":{unicode:["1f3f8"],isCanonical:!0},":fast_forward:":{unicode:["23e9"],isCanonical:!0},":rewind:":{unicode:["23ea"],isCanonical:!0},":arrow_double_up:":{unicode:["23eb"],isCanonical:!0},":arrow_double_down:":{unicode:["23ec"],isCanonical:!0},":alarm_clock:":{unicode:["23f0"],isCanonical:!0},":hourglass_flowing_sand:":{unicode:["23f3"],isCanonical:!0},":ophiuchus:":{unicode:["26ce"],isCanonical:!0},":white_check_mark:":{unicode:["2705"],isCanonical:!0},":fist:":{unicode:["270a"],isCanonical:!0},":raised_hand:":{unicode:["270b"],isCanonical:!0},":sparkles:":{unicode:["2728"],isCanonical:!0},":x:":{unicode:["274c"],isCanonical:!0},":negative_squared_cross_mark:":{unicode:["274e"],isCanonical:!0},":question:":{unicode:["2753"],isCanonical:!0},":grey_question:":{unicode:["2754"],isCanonical:!0},":grey_exclamation:":{unicode:["2755"],isCanonical:!0},":heavy_plus_sign:":{unicode:["2795"],isCanonical:!0},":heavy_minus_sign:":{unicode:["2796"],isCanonical:!0},":heavy_division_sign:":{unicode:["2797"],isCanonical:!0},":curly_loop:":{unicode:["27b0"],isCanonical:!0},":loop:":{unicode:["27bf"],isCanonical:!0}};var b,c=[];for(b in a.emojioneList)a.emojioneList.hasOwnProperty(b)&&c.push(b.replace(/[+]/g,"\\$&"));a.shortnames=c.join("|"),a.asciiList={"<3":"2764","</3":"1f494",":')":"1f602",":'-)":"1f602",":D":"1f603",":-D":"1f603","=D":"1f603",":)":"1f642",":-)":"1f642","=]":"1f642","=)":"1f642",":]":"1f642","':)":"1f605","':-)":"1f605","'=)":"1f605","':D":"1f605","':-D":"1f605","'=D":"1f605",">:)":"1f606",">;)":"1f606",">:-)":"1f606",">=)":"1f606",";)":"1f609",";-)":"1f609","*-)":"1f609","*)":"1f609",";-]":"1f609",";]":"1f609",";D":"1f609",";^)":"1f609","':(":"1f613","':-(":"1f613","'=(":"1f613",":*":"1f618",":-*":"1f618","=*":"1f618",":^*":"1f618",">:P":"1f61c","X-P":"1f61c","x-p":"1f61c",">:[":"1f61e",":-(":"1f61e",":(":"1f61e",":-[":"1f61e",":[":"1f61e","=(":"1f61e",">:(":"1f620",">:-(":"1f620",":@":"1f620",":'(":"1f622",":'-(":"1f622",";(":"1f622",";-(":"1f622",">.<":"1f623","D:":"1f628",":$":"1f633","=$":"1f633","#-)":"1f635","#)":"1f635","%-)":"1f635","%)":"1f635","X)":"1f635","X-)":"1f635","*\\0/*":"1f646","\\0/":"1f646","*\\O/*":"1f646","\\O/":"1f646","O:-)":"1f607","0:-3":"1f607","0:3":"1f607","0:-)":"1f607","0:)":"1f607","0;^)":"1f607","O:)":"1f607","O;-)":"1f607","O=)":"1f607","0;-)":"1f607","O:-3":"1f607","O:3":"1f607","B-)":"1f60e","B)":"1f60e","8)":"1f60e","8-)":"1f60e","B-D":"1f60e","8-D":"1f60e","-_-":"1f611","-__-":"1f611","-___-":"1f611",">:\\":"1f615",">:/":"1f615",":-/":"1f615",":-.":"1f615",":/":"1f615",":\\":"1f615","=/":"1f615","=\\":"1f615",":L":"1f615","=L":"1f615",":P":"1f61b",":-P":"1f61b","=P":"1f61b",":-p":"1f61b",":p":"1f61b","=p":"1f61b",":-Þ":"1f61b",":Þ":"1f61b",":þ":"1f61b",":-þ":"1f61b",":-b":"1f61b",":b":"1f61b","d:":"1f61b",":-O":"1f62e",":O":"1f62e",":-o":"1f62e",":o":"1f62e",O_O:"1f62e",">:O":"1f62e",":-X":"1f636",":X":"1f636",":-#":"1f636",":#":"1f636","=X":"1f636","=x":"1f636",":x":"1f636",":-x":"1f636","=#":"1f636"},a.asciiRegexp="(\\<3|&lt;3|\\<\\/3|&lt;\\/3|\\:'\\)|\\:'\\-\\)|\\:D|\\:\\-D|\\=D|\\:\\)|\\:\\-\\)|\\=\\]|\\=\\)|\\:\\]|'\\:\\)|'\\:\\-\\)|'\\=\\)|'\\:D|'\\:\\-D|'\\=D|\\>\\:\\)|&gt;\\:\\)|\\>;\\)|&gt;;\\)|\\>\\:\\-\\)|&gt;\\:\\-\\)|\\>\\=\\)|&gt;\\=\\)|;\\)|;\\-\\)|\\*\\-\\)|\\*\\)|;\\-\\]|;\\]|;D|;\\^\\)|'\\:\\(|'\\:\\-\\(|'\\=\\(|\\:\\*|\\:\\-\\*|\\=\\*|\\:\\^\\*|\\>\\:P|&gt;\\:P|X\\-P|x\\-p|\\>\\:\\[|&gt;\\:\\[|\\:\\-\\(|\\:\\(|\\:\\-\\[|\\:\\[|\\=\\(|\\>\\:\\(|&gt;\\:\\(|\\>\\:\\-\\(|&gt;\\:\\-\\(|\\:@|\\:'\\(|\\:'\\-\\(|;\\(|;\\-\\(|\\>\\.\\<|&gt;\\.&lt;|D\\:|\\:\\$|\\=\\$|#\\-\\)|#\\)|%\\-\\)|%\\)|X\\)|X\\-\\)|\\*\\\\0\\/\\*|\\\\0\\/|\\*\\\\O\\/\\*|\\\\O\\/|O\\:\\-\\)|0\\:\\-3|0\\:3|0\\:\\-\\)|0\\:\\)|0;\\^\\)|O\\:\\-\\)|O\\:\\)|O;\\-\\)|O\\=\\)|0;\\-\\)|O\\:\\-3|O\\:3|B\\-\\)|B\\)|8\\)|8\\-\\)|B\\-D|8\\-D|\\-_\\-|\\-__\\-|\\-___\\-|\\>\\:\\\\|&gt;\\:\\\\|\\>\\:\\/|&gt;\\:\\/|\\:\\-\\/|\\:\\-\\.|\\:\\/|\\:\\\\|\\=\\/|\\=\\\\|\\:L|\\=L|\\:P|\\:\\-P|\\=P|\\:\\-p|\\:p|\\=p|\\:\\-Þ|\\:\\-&THORN;|\\:Þ|\\:&THORN;|\\:þ|\\:&thorn;|\\:\\-þ|\\:\\-&thorn;|\\:\\-b|\\:b|d\\:|\\:\\-O|\\:O|\\:\\-o|\\:o|O_O|\\>\\:O|&gt;\\:O|\\:\\-X|\\:X|\\:\\-#|\\:#|\\=X|\\=x|\\:x|\\:\\-x|\\=#)",a.unicodeRegexp="(\\uD83D\\uDC69\\u200D\\u2764\\uFE0F\\u200D\\uD83D\\uDC8B\\u200D\\uD83D\\uDC69|\\uD83D\\uDC68\\u200D\\u2764\\uFE0F\\u200D\\uD83D\\uDC8B\\u200D\\uD83D\\uDC68|\\uD83D\\uDC68\\u200D\\uD83D\\uDC68\\u200D\\uD83D\\uDC67\\u200D\\uD83D\\uDC66|\\uD83D\\uDC68\\u200D\\uD83D\\uDC68\\u200D\\uD83D\\uDC67\\u200D\\uD83D\\uDC67|\\uD83D\\uDC68\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC66\\u200D\\uD83D\\uDC66|\\uD83D\\uDC68\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC67\\u200D\\uD83D\\uDC66|\\uD83D\\uDC68\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC67\\u200D\\uD83D\\uDC67|\\uD83D\\uDC69\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC66\\u200D\\uD83D\\uDC66|\\uD83D\\uDC69\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC67\\u200D\\uD83D\\uDC66|\\uD83D\\uDC69\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC67\\u200D\\uD83D\\uDC67|\\uD83D\\uDC68\\u200D\\uD83D\\uDC68\\u200D\\uD83D\\uDC66\\u200D\\uD83D\\uDC66|\\uD83D\\uDC68\\u200D\\u2764\\uFE0F\\u200D\\uD83D\\uDC68|\\uD83D\\uDC68\\u200D\\uD83D\\uDC68\\u200D\\uD83D\\uDC67|\\uD83D\\uDC68\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC67|\\uD83D\\uDC69\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC66|\\uD83D\\uDC69\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC67|\\uD83D\\uDC69\\u200D\\u2764\\uFE0F\\u200D\\uD83D\\uDC69|\\uD83D\\uDC68\\u200D\\uD83D\\uDC68\\u200D\\uD83D\\uDC66|\\uD83D\\uDC41\\u200D\\uD83D\\uDDE8|\\uD83C\\uDDE6\\uD83C\\uDDE9|\\uD83C\\uDDE6\\uD83C\\uDDEA|\\uD83C\\uDDE6\\uD83C\\uDDEB|\\uD83C\\uDDE6\\uD83C\\uDDEC|\\uD83C\\uDDE6\\uD83C\\uDDEE|\\uD83C\\uDDE6\\uD83C\\uDDF1|\\uD83C\\uDDE6\\uD83C\\uDDF2|\\uD83C\\uDDE6\\uD83C\\uDDF4|\\uD83C\\uDDE6\\uD83C\\uDDF6|\\uD83C\\uDDE6\\uD83C\\uDDF7|\\uD83C\\uDDE6\\uD83C\\uDDF8|\\uD83E\\uDD18\\uD83C\\uDFFF|\\uD83E\\uDD18\\uD83C\\uDFFE|\\uD83E\\uDD18\\uD83C\\uDFFD|\\uD83E\\uDD18\\uD83C\\uDFFC|\\uD83E\\uDD18\\uD83C\\uDFFB|\\uD83D\\uDEC0\\uD83C\\uDFFF|\\uD83D\\uDEC0\\uD83C\\uDFFE|\\uD83D\\uDEC0\\uD83C\\uDFFD|\\uD83D\\uDEC0\\uD83C\\uDFFC|\\uD83D\\uDEC0\\uD83C\\uDFFB|\\uD83D\\uDEB6\\uD83C\\uDFFF|\\uD83D\\uDEB6\\uD83C\\uDFFE|\\uD83D\\uDEB6\\uD83C\\uDFFD|\\uD83D\\uDEB6\\uD83C\\uDFFC|\\uD83D\\uDEB6\\uD83C\\uDFFB|\\uD83D\\uDEB5\\uD83C\\uDFFF|\\uD83D\\uDEB5\\uD83C\\uDFFE|\\uD83D\\uDEB5\\uD83C\\uDFFD|\\uD83D\\uDEB5\\uD83C\\uDFFC|\\uD83D\\uDEB5\\uD83C\\uDFFB|\\uD83D\\uDEB4\\uD83C\\uDFFF|\\uD83D\\uDEB4\\uD83C\\uDFFE|\\uD83D\\uDEB4\\uD83C\\uDFFD|\\uD83D\\uDEB4\\uD83C\\uDFFC|\\uD83D\\uDEB4\\uD83C\\uDFFB|\\uD83D\\uDEA3\\uD83C\\uDFFF|\\uD83D\\uDEA3\\uD83C\\uDFFE|\\uD83D\\uDEA3\\uD83C\\uDFFD|\\uD83D\\uDEA3\\uD83C\\uDFFC|\\uD83D\\uDEA3\\uD83C\\uDFFB|\\uD83D\\uDE4F\\uD83C\\uDFFF|\\uD83D\\uDE4F\\uD83C\\uDFFE|\\uD83D\\uDE4F\\uD83C\\uDFFD|\\uD83D\\uDE4F\\uD83C\\uDFFC|\\uD83D\\uDE4F\\uD83C\\uDFFB|\\uD83D\\uDE4E\\uD83C\\uDFFF|\\uD83D\\uDE4E\\uD83C\\uDFFE|\\uD83D\\uDE4E\\uD83C\\uDFFD|\\uD83D\\uDE4E\\uD83C\\uDFFC|\\uD83D\\uDE4E\\uD83C\\uDFFB|\\uD83D\\uDE4D\\uD83C\\uDFFF|\\uD83D\\uDE4D\\uD83C\\uDFFE|\\uD83D\\uDE4D\\uD83C\\uDFFD|\\uD83D\\uDE4D\\uD83C\\uDFFC|\\uD83D\\uDE4D\\uD83C\\uDFFB|\\uD83D\\uDE4C\\uD83C\\uDFFF|\\uD83D\\uDE4C\\uD83C\\uDFFE|\\uD83D\\uDE4C\\uD83C\\uDFFD|\\uD83D\\uDE4C\\uD83C\\uDFFC|\\uD83D\\uDE4C\\uD83C\\uDFFB|\\uD83D\\uDE4B\\uD83C\\uDFFF|\\uD83D\\uDE4B\\uD83C\\uDFFE|\\uD83D\\uDE4B\\uD83C\\uDFFD|\\uD83D\\uDE4B\\uD83C\\uDFFC|\\uD83D\\uDE4B\\uD83C\\uDFFB|\\uD83D\\uDE47\\uD83C\\uDFFF|\\uD83D\\uDE47\\uD83C\\uDFFE|\\uD83D\\uDE47\\uD83C\\uDFFD|\\uD83D\\uDE47\\uD83C\\uDFFC|\\uD83D\\uDE47\\uD83C\\uDFFB|\\uD83D\\uDE46\\uD83C\\uDFFF|\\uD83D\\uDE46\\uD83C\\uDFFE|\\uD83D\\uDE46\\uD83C\\uDFFD|\\uD83D\\uDE46\\uD83C\\uDFFC|\\uD83D\\uDE46\\uD83C\\uDFFB|\\uD83D\\uDE45\\uD83C\\uDFFF|\\uD83D\\uDE45\\uD83C\\uDFFE|\\uD83D\\uDE45\\uD83C\\uDFFD|\\uD83D\\uDE45\\uD83C\\uDFFC|\\uD83D\\uDE45\\uD83C\\uDFFB|\\uD83D\\uDD96\\uD83C\\uDFFF|\\uD83D\\uDD96\\uD83C\\uDFFE|\\uD83D\\uDD96\\uD83C\\uDFFD|\\uD83D\\uDD96\\uD83C\\uDFFC|\\uD83D\\uDD96\\uD83C\\uDFFB|\\uD83D\\uDD95\\uD83C\\uDFFF|\\uD83D\\uDD95\\uD83C\\uDFFE|\\uD83D\\uDD95\\uD83C\\uDFFD|\\uD83D\\uDD95\\uD83C\\uDFFC|\\uD83D\\uDD95\\uD83C\\uDFFB|\\uD83D\\uDD90\\uD83C\\uDFFF|\\uD83D\\uDD90\\uD83C\\uDFFE|\\uD83D\\uDD90\\uD83C\\uDFFD|\\uD83D\\uDD90\\uD83C\\uDFFC|\\uD83D\\uDD90\\uD83C\\uDFFB|\\uD83D\\uDD75\\uD83C\\uDFFF|\\uD83D\\uDD75\\uD83C\\uDFFE|\\uD83D\\uDD75\\uD83C\\uDFFD|\\uD83D\\uDD75\\uD83C\\uDFFC|\\uD83D\\uDD75\\uD83C\\uDFFB|\\uD83D\\uDCAA\\uD83C\\uDFFF|\\uD83D\\uDCAA\\uD83C\\uDFFE|\\uD83D\\uDCAA\\uD83C\\uDFFD|\\uD83D\\uDCAA\\uD83C\\uDFFC|\\uD83D\\uDCAA\\uD83C\\uDFFB|\\uD83D\\uDC87\\uD83C\\uDFFF|\\uD83D\\uDC87\\uD83C\\uDFFE|\\uD83D\\uDC87\\uD83C\\uDFFD|\\uD83D\\uDC87\\uD83C\\uDFFC|\\uD83D\\uDC87\\uD83C\\uDFFB|\\uD83D\\uDC86\\uD83C\\uDFFF|\\uD83D\\uDC86\\uD83C\\uDFFE|\\uD83D\\uDC86\\uD83C\\uDFFD|\\uD83D\\uDC86\\uD83C\\uDFFC|\\uD83D\\uDC86\\uD83C\\uDFFB|\\uD83D\\uDC85\\uD83C\\uDFFF|\\uD83D\\uDC85\\uD83C\\uDFFE|\\uD83D\\uDC85\\uD83C\\uDFFD|\\uD83D\\uDC85\\uD83C\\uDFFC|\\uD83D\\uDC85\\uD83C\\uDFFB|\\uD83D\\uDC83\\uD83C\\uDFFF|\\uD83D\\uDC83\\uD83C\\uDFFE|\\uD83D\\uDC83\\uD83C\\uDFFD|\\uD83D\\uDC83\\uD83C\\uDFFC|\\uD83D\\uDC83\\uD83C\\uDFFB|\\uD83D\\uDC82\\uD83C\\uDFFF|\\uD83D\\uDC82\\uD83C\\uDFFE|\\uD83D\\uDC82\\uD83C\\uDFFD|\\uD83D\\uDC82\\uD83C\\uDFFC|\\uD83D\\uDC82\\uD83C\\uDFFB|\\uD83D\\uDC81\\uD83C\\uDFFF|\\uD83D\\uDC81\\uD83C\\uDFFE|\\uD83D\\uDC81\\uD83C\\uDFFD|\\uD83D\\uDC81\\uD83C\\uDFFC|\\uD83D\\uDC81\\uD83C\\uDFFB|\\uD83D\\uDC7C\\uD83C\\uDFFF|\\uD83D\\uDC7C\\uD83C\\uDFFE|\\uD83D\\uDC7C\\uD83C\\uDFFD|\\uD83D\\uDC7C\\uD83C\\uDFFC|\\uD83D\\uDC7C\\uD83C\\uDFFB|\\uD83D\\uDC78\\uD83C\\uDFFF|\\uD83D\\uDC78\\uD83C\\uDFFE|\\uD83D\\uDC78\\uD83C\\uDFFD|\\uD83D\\uDC78\\uD83C\\uDFFC|\\uD83D\\uDC78\\uD83C\\uDFFB|\\uD83D\\uDC77\\uD83C\\uDFFF|\\uD83D\\uDC77\\uD83C\\uDFFE|\\uD83D\\uDC77\\uD83C\\uDFFD|\\uD83D\\uDC77\\uD83C\\uDFFC|\\uD83D\\uDC77\\uD83C\\uDFFB|\\uD83D\\uDC76\\uD83C\\uDFFF|\\uD83D\\uDC76\\uD83C\\uDFFE|\\uD83D\\uDC76\\uD83C\\uDFFD|\\uD83D\\uDC76\\uD83C\\uDFFC|\\uD83D\\uDC76\\uD83C\\uDFFB|\\uD83D\\uDC75\\uD83C\\uDFFF|\\uD83D\\uDC75\\uD83C\\uDFFE|\\uD83D\\uDC75\\uD83C\\uDFFD|\\uD83D\\uDC75\\uD83C\\uDFFC|\\uD83D\\uDC75\\uD83C\\uDFFB|\\uD83D\\uDC74\\uD83C\\uDFFF|\\uD83D\\uDC74\\uD83C\\uDFFE|\\uD83D\\uDC74\\uD83C\\uDFFD|\\uD83D\\uDC74\\uD83C\\uDFFC|\\uD83D\\uDC74\\uD83C\\uDFFB|\\uD83D\\uDC73\\uD83C\\uDFFF|\\uD83D\\uDC73\\uD83C\\uDFFE|\\uD83D\\uDC73\\uD83C\\uDFFD|\\uD83D\\uDC73\\uD83C\\uDFFC|\\uD83D\\uDC73\\uD83C\\uDFFB|\\uD83D\\uDC72\\uD83C\\uDFFF|\\uD83D\\uDC72\\uD83C\\uDFFE|\\uD83D\\uDC72\\uD83C\\uDFFD|\\uD83D\\uDC72\\uD83C\\uDFFC|\\uD83D\\uDC72\\uD83C\\uDFFB|\\uD83D\\uDC71\\uD83C\\uDFFF|\\uD83D\\uDC71\\uD83C\\uDFFE|\\uD83D\\uDC71\\uD83C\\uDFFD|\\uD83D\\uDC71\\uD83C\\uDFFC|\\uD83D\\uDC71\\uD83C\\uDFFB|\\uD83D\\uDC70\\uD83C\\uDFFF|\\uD83D\\uDC70\\uD83C\\uDFFE|\\uD83D\\uDC70\\uD83C\\uDFFD|\\uD83D\\uDC70\\uD83C\\uDFFC|\\uD83D\\uDC70\\uD83C\\uDFFB|\\uD83D\\uDC6E\\uD83C\\uDFFF|\\uD83D\\uDC6E\\uD83C\\uDFFE|\\uD83D\\uDC6E\\uD83C\\uDFFD|\\uD83D\\uDC6E\\uD83C\\uDFFC|\\uD83D\\uDC6E\\uD83C\\uDFFB|\\uD83D\\uDC69\\uD83C\\uDFFF|\\uD83D\\uDC69\\uD83C\\uDFFE|\\uD83D\\uDC69\\uD83C\\uDFFD|\\uD83D\\uDC69\\uD83C\\uDFFC|\\uD83D\\uDC69\\uD83C\\uDFFB|\\uD83D\\uDC68\\uD83C\\uDFFF|\\uD83D\\uDC68\\uD83C\\uDFFE|\\uD83D\\uDC68\\uD83C\\uDFFD|\\uD83D\\uDC68\\uD83C\\uDFFC|\\uD83D\\uDC68\\uD83C\\uDFFB|\\uD83D\\uDC67\\uD83C\\uDFFF|\\uD83D\\uDC67\\uD83C\\uDFFE|\\uD83D\\uDC67\\uD83C\\uDFFD|\\uD83D\\uDC67\\uD83C\\uDFFC|\\uD83D\\uDC67\\uD83C\\uDFFB|\\uD83D\\uDC66\\uD83C\\uDFFF|\\uD83D\\uDC66\\uD83C\\uDFFE|\\uD83D\\uDC66\\uD83C\\uDFFD|\\uD83D\\uDC66\\uD83C\\uDFFC|\\uD83D\\uDC66\\uD83C\\uDFFB|\\uD83D\\uDC50\\uD83C\\uDFFF|\\uD83D\\uDC50\\uD83C\\uDFFE|\\uD83D\\uDC50\\uD83C\\uDFFD|\\uD83D\\uDC50\\uD83C\\uDFFC|\\uD83D\\uDC50\\uD83C\\uDFFB|\\uD83D\\uDC4F\\uD83C\\uDFFF|\\uD83D\\uDC4F\\uD83C\\uDFFE|\\uD83D\\uDC4F\\uD83C\\uDFFD|\\uD83D\\uDC4F\\uD83C\\uDFFC|\\uD83D\\uDC4F\\uD83C\\uDFFB|\\uD83D\\uDC4E\\uD83C\\uDFFF|\\uD83D\\uDC4E\\uD83C\\uDFFE|\\uD83D\\uDC4E\\uD83C\\uDFFD|\\uD83D\\uDC4E\\uD83C\\uDFFC|\\uD83D\\uDC4E\\uD83C\\uDFFB|\\uD83D\\uDC4D\\uD83C\\uDFFF|\\uD83D\\uDC4D\\uD83C\\uDFFE|\\uD83D\\uDC4D\\uD83C\\uDFFD|\\uD83D\\uDC4D\\uD83C\\uDFFC|\\uD83D\\uDC4D\\uD83C\\uDFFB|\\uD83D\\uDC4C\\uD83C\\uDFFF|\\uD83D\\uDC4C\\uD83C\\uDFFE|\\uD83D\\uDC4C\\uD83C\\uDFFD|\\uD83D\\uDC4C\\uD83C\\uDFFC|\\uD83D\\uDC4C\\uD83C\\uDFFB|\\uD83D\\uDC4B\\uD83C\\uDFFF|\\uD83D\\uDC4B\\uD83C\\uDFFE|\\uD83D\\uDC4B\\uD83C\\uDFFD|\\uD83D\\uDC4B\\uD83C\\uDFFC|\\uD83D\\uDC4B\\uD83C\\uDFFB|\\uD83D\\uDC4A\\uD83C\\uDFFF|\\uD83D\\uDC4A\\uD83C\\uDFFE|\\uD83D\\uDC4A\\uD83C\\uDFFD|\\uD83D\\uDC4A\\uD83C\\uDFFC|\\uD83D\\uDC4A\\uD83C\\uDFFB|\\uD83D\\uDC49\\uD83C\\uDFFF|\\uD83D\\uDC49\\uD83C\\uDFFE|\\uD83D\\uDC49\\uD83C\\uDFFD|\\uD83D\\uDC49\\uD83C\\uDFFC|\\uD83D\\uDC49\\uD83C\\uDFFB|\\uD83D\\uDC48\\uD83C\\uDFFF|\\uD83D\\uDC48\\uD83C\\uDFFE|\\uD83D\\uDC48\\uD83C\\uDFFD|\\uD83D\\uDC48\\uD83C\\uDFFC|\\uD83D\\uDC48\\uD83C\\uDFFB|\\uD83D\\uDC47\\uD83C\\uDFFF|\\uD83D\\uDC47\\uD83C\\uDFFE|\\uD83D\\uDC47\\uD83C\\uDFFD|\\uD83D\\uDC47\\uD83C\\uDFFC|\\uD83D\\uDC47\\uD83C\\uDFFB|\\uD83D\\uDC46\\uD83C\\uDFFF|\\uD83D\\uDC46\\uD83C\\uDFFE|\\uD83D\\uDC46\\uD83C\\uDFFD|\\uD83D\\uDC46\\uD83C\\uDFFC|\\uD83D\\uDC46\\uD83C\\uDFFB|\\uD83D\\uDC43\\uD83C\\uDFFF|\\uD83D\\uDC43\\uD83C\\uDFFE|\\uD83D\\uDC43\\uD83C\\uDFFD|\\uD83D\\uDC43\\uD83C\\uDFFC|\\uD83D\\uDC43\\uD83C\\uDFFB|\\uD83D\\uDC42\\uD83C\\uDFFF|\\uD83D\\uDC42\\uD83C\\uDFFE|\\uD83D\\uDC42\\uD83C\\uDFFD|\\uD83D\\uDC42\\uD83C\\uDFFC|\\uD83D\\uDC42\\uD83C\\uDFFB|\\uD83C\\uDFCB\\uD83C\\uDFFF|\\uD83C\\uDFCB\\uD83C\\uDFFE|\\uD83C\\uDFCB\\uD83C\\uDFFD|\\uD83C\\uDFCB\\uD83C\\uDFFC|\\uD83C\\uDFCB\\uD83C\\uDFFB|\\uD83C\\uDFCA\\uD83C\\uDFFF|\\uD83C\\uDFCA\\uD83C\\uDFFE|\\uD83C\\uDFCA\\uD83C\\uDFFD|\\uD83C\\uDFCA\\uD83C\\uDFFC|\\uD83C\\uDFCA\\uD83C\\uDFFB|\\uD83C\\uDFC7\\uD83C\\uDFFF|\\uD83C\\uDFC7\\uD83C\\uDFFE|\\uD83C\\uDFC7\\uD83C\\uDFFD|\\uD83C\\uDFC7\\uD83C\\uDFFC|\\uD83C\\uDFC7\\uD83C\\uDFFB|\\uD83C\\uDFC4\\uD83C\\uDFFF|\\uD83C\\uDFC4\\uD83C\\uDFFE|\\uD83C\\uDFC4\\uD83C\\uDFFD|\\uD83C\\uDFC4\\uD83C\\uDFFC|\\uD83C\\uDFC4\\uD83C\\uDFFB|\\uD83C\\uDFC3\\uD83C\\uDFFF|\\uD83C\\uDFC3\\uD83C\\uDFFE|\\uD83C\\uDFC3\\uD83C\\uDFFD|\\uD83C\\uDFC3\\uD83C\\uDFFC|\\uD83C\\uDFC3\\uD83C\\uDFFB|\\uD83C\\uDF85\\uD83C\\uDFFF|\\uD83C\\uDF85\\uD83C\\uDFFE|\\uD83C\\uDF85\\uD83C\\uDFFD|\\uD83C\\uDF85\\uD83C\\uDFFC|\\uD83C\\uDF85\\uD83C\\uDFFB|\\uD83C\\uDDFF\\uD83C\\uDDFC|\\uD83C\\uDDFF\\uD83C\\uDDF2|\\uD83C\\uDDFF\\uD83C\\uDDE6|\\uD83C\\uDDFE\\uD83C\\uDDF9|\\uD83C\\uDDFE\\uD83C\\uDDEA|\\uD83C\\uDDFD\\uD83C\\uDDF0|\\uD83C\\uDDFC\\uD83C\\uDDF8|\\uD83C\\uDDFC\\uD83C\\uDDEB|\\uD83C\\uDDFB\\uD83C\\uDDFA|\\uD83C\\uDDFB\\uD83C\\uDDF3|\\uD83C\\uDDFB\\uD83C\\uDDEE|\\uD83C\\uDDFB\\uD83C\\uDDEC|\\uD83C\\uDDFB\\uD83C\\uDDEA|\\uD83C\\uDDFB\\uD83C\\uDDE8|\\uD83C\\uDDFB\\uD83C\\uDDE6|\\uD83C\\uDDFA\\uD83C\\uDDFF|\\uD83C\\uDDFA\\uD83C\\uDDFE|\\uD83C\\uDDFA\\uD83C\\uDDF8|\\uD83C\\uDDFA\\uD83C\\uDDF2|\\uD83C\\uDDFA\\uD83C\\uDDEC|\\uD83C\\uDDFA\\uD83C\\uDDE6|\\uD83C\\uDDF9\\uD83C\\uDDFF|\\uD83C\\uDDF9\\uD83C\\uDDFC|\\uD83C\\uDDF9\\uD83C\\uDDFB|\\uD83C\\uDDF9\\uD83C\\uDDF9|\\uD83C\\uDDF9\\uD83C\\uDDF7|\\uD83C\\uDDF9\\uD83C\\uDDF4|\\uD83C\\uDDF9\\uD83C\\uDDF3|\\uD83C\\uDDF9\\uD83C\\uDDF2|\\uD83C\\uDDF9\\uD83C\\uDDF1|\\uD83C\\uDDF9\\uD83C\\uDDF0|\\uD83C\\uDDF9\\uD83C\\uDDEF|\\uD83C\\uDDF9\\uD83C\\uDDED|\\uD83C\\uDDF9\\uD83C\\uDDEC|\\uD83C\\uDDF9\\uD83C\\uDDEB|\\uD83C\\uDDE6\\uD83C\\uDDE8|\\uD83C\\uDDF9\\uD83C\\uDDE8|\\uD83C\\uDDF9\\uD83C\\uDDE6|\\uD83C\\uDDF8\\uD83C\\uDDFF|\\uD83C\\uDDF8\\uD83C\\uDDFE|\\uD83C\\uDDF8\\uD83C\\uDDFD|\\uD83C\\uDDF8\\uD83C\\uDDFB|\\uD83C\\uDDF8\\uD83C\\uDDF9|\\uD83C\\uDDF8\\uD83C\\uDDF8|\\uD83C\\uDDF8\\uD83C\\uDDF7|\\uD83C\\uDDF8\\uD83C\\uDDF4|\\uD83C\\uDDF8\\uD83C\\uDDF3|\\uD83C\\uDDF8\\uD83C\\uDDF2|\\uD83C\\uDDF8\\uD83C\\uDDF1|\\uD83C\\uDDF8\\uD83C\\uDDF0|\\uD83C\\uDDF8\\uD83C\\uDDEF|\\uD83C\\uDDF8\\uD83C\\uDDEE|\\uD83C\\uDDF8\\uD83C\\uDDED|\\uD83C\\uDDF8\\uD83C\\uDDEC|\\uD83C\\uDDF8\\uD83C\\uDDEA|\\uD83C\\uDDF8\\uD83C\\uDDE9|\\uD83C\\uDDF8\\uD83C\\uDDE8|\\uD83C\\uDDF8\\uD83C\\uDDE7|\\uD83C\\uDDF8\\uD83C\\uDDE6|\\uD83C\\uDDF7\\uD83C\\uDDFC|\\uD83C\\uDDF7\\uD83C\\uDDFA|\\uD83C\\uDDF7\\uD83C\\uDDF8|\\uD83C\\uDDF7\\uD83C\\uDDF4|\\uD83C\\uDDF7\\uD83C\\uDDEA|\\uD83C\\uDDF6\\uD83C\\uDDE6|\\uD83C\\uDDF5\\uD83C\\uDDFE|\\uD83C\\uDDF5\\uD83C\\uDDFC|\\uD83C\\uDDF5\\uD83C\\uDDF9|\\uD83C\\uDDF5\\uD83C\\uDDF8|\\uD83C\\uDDF5\\uD83C\\uDDF7|\\uD83C\\uDDF5\\uD83C\\uDDF3|\\uD83C\\uDDF5\\uD83C\\uDDF2|\\uD83C\\uDDF5\\uD83C\\uDDF1|\\uD83C\\uDDF5\\uD83C\\uDDF0|\\uD83C\\uDDF5\\uD83C\\uDDED|\\uD83C\\uDDF5\\uD83C\\uDDEC|\\uD83C\\uDDF5\\uD83C\\uDDEB|\\uD83C\\uDDF5\\uD83C\\uDDEA|\\uD83C\\uDDF5\\uD83C\\uDDE6|\\uD83C\\uDDF4\\uD83C\\uDDF2|\\uD83C\\uDDF3\\uD83C\\uDDFF|\\uD83C\\uDDF3\\uD83C\\uDDFA|\\uD83C\\uDDF3\\uD83C\\uDDF7|\\uD83C\\uDDF3\\uD83C\\uDDF5|\\uD83C\\uDDF3\\uD83C\\uDDF4|\\uD83C\\uDDF3\\uD83C\\uDDF1|\\uD83C\\uDDF3\\uD83C\\uDDEE|\\uD83C\\uDDF3\\uD83C\\uDDEC|\\uD83C\\uDDF3\\uD83C\\uDDEB|\\uD83C\\uDDF3\\uD83C\\uDDEA|\\uD83C\\uDDF3\\uD83C\\uDDE8|\\uD83C\\uDDF3\\uD83C\\uDDE6|\\uD83C\\uDDF2\\uD83C\\uDDFF|\\uD83C\\uDDF2\\uD83C\\uDDFE|\\uD83C\\uDDF2\\uD83C\\uDDFD|\\uD83C\\uDDF2\\uD83C\\uDDFC|\\uD83C\\uDDF2\\uD83C\\uDDFB|\\uD83C\\uDDF2\\uD83C\\uDDFA|\\uD83C\\uDDF2\\uD83C\\uDDF9|\\uD83C\\uDDF2\\uD83C\\uDDF8|\\uD83C\\uDDF2\\uD83C\\uDDF7|\\uD83C\\uDDF2\\uD83C\\uDDF6|\\uD83C\\uDDF2\\uD83C\\uDDF5|\\uD83C\\uDDF2\\uD83C\\uDDF4|\\uD83C\\uDDF2\\uD83C\\uDDF3|\\uD83C\\uDDF2\\uD83C\\uDDF2|\\uD83C\\uDDF2\\uD83C\\uDDF1|\\uD83C\\uDDF2\\uD83C\\uDDF0|\\uD83C\\uDDF2\\uD83C\\uDDED|\\uD83C\\uDDF2\\uD83C\\uDDEC|\\uD83C\\uDDF2\\uD83C\\uDDEB|\\uD83C\\uDDF2\\uD83C\\uDDEA|\\uD83C\\uDDF2\\uD83C\\uDDE9|\\uD83C\\uDDF2\\uD83C\\uDDE8|\\uD83C\\uDDF2\\uD83C\\uDDE6|\\uD83C\\uDDF1\\uD83C\\uDDFE|\\uD83C\\uDDF1\\uD83C\\uDDFB|\\uD83C\\uDDF1\\uD83C\\uDDFA|\\uD83C\\uDDF1\\uD83C\\uDDF9|\\uD83C\\uDDF1\\uD83C\\uDDF8|\\uD83C\\uDDF1\\uD83C\\uDDF7|\\uD83C\\uDDF1\\uD83C\\uDDF0|\\uD83C\\uDDF1\\uD83C\\uDDEE|\\uD83C\\uDDF1\\uD83C\\uDDE8|\\uD83C\\uDDF1\\uD83C\\uDDE7|\\uD83C\\uDDF1\\uD83C\\uDDE6|\\uD83C\\uDDF0\\uD83C\\uDDFF|\\uD83C\\uDDF0\\uD83C\\uDDFE|\\uD83C\\uDDF0\\uD83C\\uDDFC|\\uD83C\\uDDF0\\uD83C\\uDDF7|\\uD83C\\uDDF0\\uD83C\\uDDF5|\\uD83C\\uDDF0\\uD83C\\uDDF3|\\uD83C\\uDDF0\\uD83C\\uDDF2|\\uD83C\\uDDF0\\uD83C\\uDDEE|\\uD83C\\uDDF0\\uD83C\\uDDED|\\uD83C\\uDDF0\\uD83C\\uDDEC|\\uD83C\\uDDF0\\uD83C\\uDDEA|\\uD83C\\uDDEF\\uD83C\\uDDF5|\\uD83C\\uDDEF\\uD83C\\uDDF4|\\uD83C\\uDDEF\\uD83C\\uDDF2|\\uD83C\\uDDEF\\uD83C\\uDDEA|\\uD83C\\uDDEE\\uD83C\\uDDF9|\\uD83C\\uDDEE\\uD83C\\uDDF8|\\uD83C\\uDDEE\\uD83C\\uDDF7|\\uD83C\\uDDEE\\uD83C\\uDDF6|\\uD83C\\uDDEE\\uD83C\\uDDF4|\\uD83C\\uDDEE\\uD83C\\uDDF3|\\uD83C\\uDDEE\\uD83C\\uDDF2|\\uD83C\\uDDEE\\uD83C\\uDDF1|\\uD83C\\uDDEE\\uD83C\\uDDEA|\\uD83C\\uDDEE\\uD83C\\uDDE9|\\uD83C\\uDDEE\\uD83C\\uDDE8|\\uD83C\\uDDED\\uD83C\\uDDFA|\\uD83C\\uDDED\\uD83C\\uDDF9|\\uD83C\\uDDED\\uD83C\\uDDF7|\\uD83C\\uDDED\\uD83C\\uDDF3|\\uD83C\\uDDED\\uD83C\\uDDF2|\\uD83C\\uDDED\\uD83C\\uDDF0|\\uD83C\\uDDEC\\uD83C\\uDDFE|\\uD83C\\uDDEC\\uD83C\\uDDFC|\\uD83C\\uDDEC\\uD83C\\uDDFA|\\uD83C\\uDDEC\\uD83C\\uDDF9|\\uD83C\\uDDEC\\uD83C\\uDDF8|\\uD83C\\uDDEC\\uD83C\\uDDF7|\\uD83C\\uDDEC\\uD83C\\uDDF6|\\uD83C\\uDDEC\\uD83C\\uDDF5|\\uD83C\\uDDEC\\uD83C\\uDDF3|\\uD83C\\uDDEC\\uD83C\\uDDF2|\\uD83C\\uDDEC\\uD83C\\uDDF1|\\uD83C\\uDDEC\\uD83C\\uDDEE|\\uD83C\\uDDEC\\uD83C\\uDDED|\\uD83C\\uDDEC\\uD83C\\uDDEC|\\uD83C\\uDDEC\\uD83C\\uDDEB|\\uD83C\\uDDEC\\uD83C\\uDDEA|\\uD83C\\uDDEC\\uD83C\\uDDE9|\\uD83C\\uDDEC\\uD83C\\uDDE7|\\uD83C\\uDDEC\\uD83C\\uDDE6|\\uD83C\\uDDEB\\uD83C\\uDDF7|\\uD83C\\uDDEB\\uD83C\\uDDF4|\\uD83C\\uDDEB\\uD83C\\uDDF2|\\uD83C\\uDDEB\\uD83C\\uDDF0|\\uD83C\\uDDEB\\uD83C\\uDDEF|\\uD83C\\uDDEB\\uD83C\\uDDEE|\\uD83C\\uDDEA\\uD83C\\uDDFA|\\uD83C\\uDDEA\\uD83C\\uDDF9|\\uD83C\\uDDEA\\uD83C\\uDDF8|\\uD83C\\uDDEA\\uD83C\\uDDF7|\\uD83C\\uDDEA\\uD83C\\uDDED|\\uD83C\\uDDEA\\uD83C\\uDDEC|\\uD83C\\uDDEA\\uD83C\\uDDEA|\\uD83C\\uDDEA\\uD83C\\uDDE8|\\uD83C\\uDDEA\\uD83C\\uDDE6|\\uD83C\\uDDE9\\uD83C\\uDDFF|\\uD83C\\uDDE9\\uD83C\\uDDF4|\\uD83C\\uDDE9\\uD83C\\uDDF2|\\uD83C\\uDDE9\\uD83C\\uDDF0|\\uD83C\\uDDE9\\uD83C\\uDDEF|\\uD83C\\uDDE9\\uD83C\\uDDEC|\\uD83C\\uDDE9\\uD83C\\uDDEA|\\uD83C\\uDDE8\\uD83C\\uDDFF|\\uD83C\\uDDE8\\uD83C\\uDDFE|\\uD83C\\uDDE8\\uD83C\\uDDFD|\\uD83C\\uDDE8\\uD83C\\uDDFC|\\uD83C\\uDDE8\\uD83C\\uDDFB|\\uD83C\\uDDE8\\uD83C\\uDDFA|\\uD83C\\uDDE8\\uD83C\\uDDF7|\\uD83C\\uDDE8\\uD83C\\uDDF5|\\uD83C\\uDDE8\\uD83C\\uDDF4|\\uD83C\\uDDE8\\uD83C\\uDDF3|\\uD83C\\uDDE8\\uD83C\\uDDF2|\\uD83C\\uDDE8\\uD83C\\uDDF1|\\uD83C\\uDDE8\\uD83C\\uDDF0|\\uD83C\\uDDE8\\uD83C\\uDDEE|\\uD83C\\uDDE8\\uD83C\\uDDED|\\uD83C\\uDDE8\\uD83C\\uDDEC|\\uD83C\\uDDE8\\uD83C\\uDDEB|\\uD83C\\uDDE8\\uD83C\\uDDE9|\\uD83C\\uDDE8\\uD83C\\uDDE8|\\uD83C\\uDDE8\\uD83C\\uDDE6|\\uD83C\\uDDE7\\uD83C\\uDDFF|\\uD83C\\uDDE7\\uD83C\\uDDFE|\\uD83C\\uDDE7\\uD83C\\uDDFC|\\uD83C\\uDDE7\\uD83C\\uDDFB|\\uD83C\\uDDE7\\uD83C\\uDDF9|\\uD83C\\uDDE7\\uD83C\\uDDF8|\\uD83C\\uDDE7\\uD83C\\uDDF7|\\uD83C\\uDDE7\\uD83C\\uDDF6|\\uD83C\\uDDE7\\uD83C\\uDDF4|\\uD83C\\uDDE7\\uD83C\\uDDF3|\\uD83C\\uDDE7\\uD83C\\uDDF2|\\uD83C\\uDDE7\\uD83C\\uDDF1|\\uD83C\\uDDE7\\uD83C\\uDDEF|\\uD83C\\uDDE7\\uD83C\\uDDEE|\\uD83C\\uDDE7\\uD83C\\uDDED|\\uD83C\\uDDE7\\uD83C\\uDDEC|\\uD83C\\uDDE7\\uD83C\\uDDEB|\\uD83C\\uDDE7\\uD83C\\uDDEA|\\uD83C\\uDDE7\\uD83C\\uDDE9|\\uD83C\\uDDE7\\uD83C\\uDDE7|\\uD83C\\uDDE7\\uD83C\\uDDE6|\\uD83C\\uDDE6\\uD83C\\uDDFF|\\uD83C\\uDDE6\\uD83C\\uDDFD|\\uD83C\\uDDE6\\uD83C\\uDDFC|\\uD83C\\uDDE6\\uD83C\\uDDFA|\\uD83C\\uDDE6\\uD83C\\uDDF9|\\uD83C\\uDDF9\\uD83C\\uDDE9|\\uD83D\\uDDE1\\uFE0F|\\u26F9\\uD83C\\uDFFF|\\u26F9\\uD83C\\uDFFE|\\u26F9\\uD83C\\uDFFD|\\u26F9\\uD83C\\uDFFC|\\u26F9\\uD83C\\uDFFB|\\u270D\\uD83C\\uDFFF|\\u270D\\uD83C\\uDFFE|\\u270D\\uD83C\\uDFFD|\\u270D\\uD83C\\uDFFC|\\u270D\\uD83C\\uDFFB|\\uD83C\\uDC04\\uFE0F|\\uD83C\\uDD7F\\uFE0F|\\uD83C\\uDE02\\uFE0F|\\uD83C\\uDE1A\\uFE0F|\\uD83C\\uDE2F\\uFE0F|\\uD83C\\uDE37\\uFE0F|\\uD83C\\uDF9E\\uFE0F|\\uD83C\\uDF9F\\uFE0F|\\uD83C\\uDFCB\\uFE0F|\\uD83C\\uDFCC\\uFE0F|\\uD83C\\uDFCD\\uFE0F|\\uD83C\\uDFCE\\uFE0F|\\uD83C\\uDF96\\uFE0F|\\uD83C\\uDF97\\uFE0F|\\uD83C\\uDF36\\uFE0F|\\uD83C\\uDF27\\uFE0F|\\uD83C\\uDF28\\uFE0F|\\uD83C\\uDF29\\uFE0F|\\uD83C\\uDF2A\\uFE0F|\\uD83C\\uDF2B\\uFE0F|\\uD83C\\uDF2C\\uFE0F|\\uD83D\\uDC3F\\uFE0F|\\uD83D\\uDD77\\uFE0F|\\uD83D\\uDD78\\uFE0F|\\uD83C\\uDF21\\uFE0F|\\uD83C\\uDF99\\uFE0F|\\uD83C\\uDF9A\\uFE0F|\\uD83C\\uDF9B\\uFE0F|\\uD83C\\uDFF3\\uFE0F|\\uD83C\\uDFF5\\uFE0F|\\uD83C\\uDFF7\\uFE0F|\\uD83D\\uDCFD\\uFE0F|\\uD83D\\uDD49\\uFE0F|\\uD83D\\uDD4A\\uFE0F|\\uD83D\\uDD6F\\uFE0F|\\uD83D\\uDD70\\uFE0F|\\uD83D\\uDD73\\uFE0F|\\uD83D\\uDD76\\uFE0F|\\uD83D\\uDD79\\uFE0F|\\uD83D\\uDD87\\uFE0F|\\uD83D\\uDD8A\\uFE0F|\\uD83D\\uDD8B\\uFE0F|\\uD83D\\uDD8C\\uFE0F|\\uD83D\\uDD8D\\uFE0F|\\uD83D\\uDDA5\\uFE0F|\\uD83D\\uDDA8\\uFE0F|\\uD83D\\uDDB2\\uFE0F|\\uD83D\\uDDBC\\uFE0F|\\uD83D\\uDDC2\\uFE0F|\\uD83D\\uDDC3\\uFE0F|\\uD83D\\uDDC4\\uFE0F|\\uD83D\\uDDD1\\uFE0F|\\uD83D\\uDDD2\\uFE0F|\\uD83D\\uDDD3\\uFE0F|\\uD83D\\uDDDC\\uFE0F|\\uD83D\\uDDDD\\uFE0F|\\uD83D\\uDDDE\\uFE0F|\\u270B\\uD83C\\uDFFF|\\uD83D\\uDDE3\\uFE0F|\\uD83D\\uDDEF\\uFE0F|\\uD83D\\uDDF3\\uFE0F|\\uD83D\\uDDFA\\uFE0F|\\uD83D\\uDEE0\\uFE0F|\\uD83D\\uDEE1\\uFE0F|\\uD83D\\uDEE2\\uFE0F|\\uD83D\\uDEF0\\uFE0F|\\uD83C\\uDF7D\\uFE0F|\\uD83D\\uDC41\\uFE0F|\\uD83D\\uDD74\\uFE0F|\\uD83D\\uDD75\\uFE0F|\\uD83D\\uDD90\\uFE0F|\\uD83C\\uDFD4\\uFE0F|\\uD83C\\uDFD5\\uFE0F|\\uD83C\\uDFD6\\uFE0F|\\uD83C\\uDFD7\\uFE0F|\\uD83C\\uDFD8\\uFE0F|\\uD83C\\uDFD9\\uFE0F|\\uD83C\\uDFDA\\uFE0F|\\uD83C\\uDFDB\\uFE0F|\\uD83C\\uDFDC\\uFE0F|\\uD83C\\uDFDD\\uFE0F|\\uD83C\\uDFDE\\uFE0F|\\uD83C\\uDFDF\\uFE0F|\\uD83D\\uDECB\\uFE0F|\\uD83D\\uDECD\\uFE0F|\\uD83D\\uDECE\\uFE0F|\\uD83D\\uDECF\\uFE0F|\\uD83D\\uDEE3\\uFE0F|\\uD83D\\uDEE4\\uFE0F|\\uD83D\\uDEE5\\uFE0F|\\uD83D\\uDEE9\\uFE0F|\\uD83D\\uDEF3\\uFE0F|\\uD83C\\uDF24\\uFE0F|\\uD83C\\uDF25\\uFE0F|\\uD83C\\uDF26\\uFE0F|\\uD83D\\uDDB1\\uFE0F|\\u261D\\uD83C\\uDFFB|\\u261D\\uD83C\\uDFFC|\\u261D\\uD83C\\uDFFD|\\u261D\\uD83C\\uDFFE|\\u261D\\uD83C\\uDFFF|\\u270C\\uD83C\\uDFFB|\\u270C\\uD83C\\uDFFC|\\u270C\\uD83C\\uDFFD|\\u270C\\uD83C\\uDFFE|\\u270C\\uD83C\\uDFFF|\\u270A\\uD83C\\uDFFB|\\u270A\\uD83C\\uDFFC|\\u270A\\uD83C\\uDFFD|\\u270A\\uD83C\\uDFFE|\\u270A\\uD83C\\uDFFF|\\u270B\\uD83C\\uDFFB|\\u270B\\uD83C\\uDFFC|\\u270B\\uD83C\\uDFFD|\\u270B\\uD83C\\uDFFE|4\\uFE0F\\u20E3|9\\uFE0F\\u20E3|0\\uFE0F\\u20E3|1\\uFE0F\\u20E3|2\\uFE0F\\u20E3|3\\uFE0F\\u20E3|#\\uFE0F\\u20E3|5\\uFE0F\\u20E3|6\\uFE0F\\u20E3|7\\uFE0F\\u20E3|8\\uFE0F\\u20E3|\\*\\uFE0F\\u20E3|\\u00A9\\uFE0F|\\u00AE\\uFE0F|\\u203C\\uFE0F|\\u2049\\uFE0F|\\u2122\\uFE0F|\\u2139\\uFE0F|\\u2194\\uFE0F|\\u2195\\uFE0F|\\u2196\\uFE0F|\\u2197\\uFE0F|\\u2198\\uFE0F|\\u2199\\uFE0F|\\u21A9\\uFE0F|\\u21AA\\uFE0F|\\u231A\\uFE0F|\\u231B\\uFE0F|\\u24C2\\uFE0F|\\u25AA\\uFE0F|\\u25AB\\uFE0F|\\u25B6\\uFE0F|\\u25C0\\uFE0F|\\u25FB\\uFE0F|\\u25FC\\uFE0F|\\u25FD\\uFE0F|\\u25FE\\uFE0F|\\u2600\\uFE0F|\\u2601\\uFE0F|\\u260E\\uFE0F|\\u2611\\uFE0F|\\u2614\\uFE0F|\\u2615\\uFE0F|\\u261D\\uFE0F|\\u263A\\uFE0F|\\u2648\\uFE0F|\\u2649\\uFE0F|\\u264A\\uFE0F|\\u264B\\uFE0F|\\u264C\\uFE0F|\\u264D\\uFE0F|\\u264E\\uFE0F|\\u264F\\uFE0F|\\u2650\\uFE0F|\\u2651\\uFE0F|\\u2652\\uFE0F|\\u2653\\uFE0F|\\u2660\\uFE0F|\\u2663\\uFE0F|\\u2665\\uFE0F|\\u2666\\uFE0F|\\u2668\\uFE0F|\\u267B\\uFE0F|\\u267F\\uFE0F|\\u2693\\uFE0F|\\u26A0\\uFE0F|\\u26A1\\uFE0F|\\u26AA\\uFE0F|\\u26AB\\uFE0F|\\u26BD\\uFE0F|\\u26BE\\uFE0F|\\u26C4\\uFE0F|\\u26C5\\uFE0F|\\u26D4\\uFE0F|\\u26EA\\uFE0F|\\u26F2\\uFE0F|\\u26F3\\uFE0F|\\u26F5\\uFE0F|\\u26FA\\uFE0F|\\u26FD\\uFE0F|\\u2702\\uFE0F|\\u2708\\uFE0F|\\u2709\\uFE0F|\\u270C\\uFE0F|\\u270F\\uFE0F|\\u2712\\uFE0F|\\u2714\\uFE0F|\\u2716\\uFE0F|\\u2733\\uFE0F|\\u2734\\uFE0F|\\u2744\\uFE0F|\\u2747\\uFE0F|\\u2757\\uFE0F|\\u2764\\uFE0F|\\u27A1\\uFE0F|\\u2934\\uFE0F|\\u2935\\uFE0F|\\u2B05\\uFE0F|\\u2B06\\uFE0F|\\u2B07\\uFE0F|\\u2B1B\\uFE0F|\\u2B1C\\uFE0F|\\u2B50\\uFE0F|\\u2B55\\uFE0F|\\u3030\\uFE0F|\\u303D\\uFE0F|\\u3297\\uFE0F|\\u3299\\uFE0F|\\u271D\\uFE0F|\\u2328\\uFE0F|\\u270D\\uFE0F|\\u23ED\\uFE0F|\\u23EE\\uFE0F|\\u23EF\\uFE0F|\\u23F1\\uFE0F|\\u23F2\\uFE0F|\\u23F8\\uFE0F|\\u23F9\\uFE0F|\\u23FA\\uFE0F|\\u2602\\uFE0F|\\u2603\\uFE0F|\\u2604\\uFE0F|\\u2618\\uFE0F|\\u2620\\uFE0F|\\u2622\\uFE0F|\\u2623\\uFE0F|\\u2626\\uFE0F|\\u262A\\uFE0F|\\u262E\\uFE0F|\\u262F\\uFE0F|\\u2638\\uFE0F|\\u2639\\uFE0F|\\u2692\\uFE0F|\\u2694\\uFE0F|\\u2696\\uFE0F|\\u2697\\uFE0F|\\u2699\\uFE0F|\\u269B\\uFE0F|\\u269C\\uFE0F|\\u26B0\\uFE0F|\\u26B1\\uFE0F|\\u26C8\\uFE0F|\\u26CF\\uFE0F|\\u26D1\\uFE0F|\\u26D3\\uFE0F|\\u26E9\\uFE0F|\\u26F0\\uFE0F|\\u26F1\\uFE0F|\\u26F4\\uFE0F|\\u26F7\\uFE0F|\\u26F8\\uFE0F|\\u26F9\\uFE0F|\\u2721\\uFE0F|\\u2763\\uFE0F|\\uD83C\\uDCCF|\\uD83C\\uDD70|\\uD83C\\uDD71|\\uD83C\\uDD7E|\\uD83C\\uDD8E|\\uD83C\\uDD91|\\uD83C\\uDD92|\\uD83C\\uDD93|\\uD83C\\uDD94|\\uD83C\\uDD95|\\uD83C\\uDD96|\\uD83C\\uDD97|\\uD83C\\uDD98|\\uD83C\\uDD99|\\uD83C\\uDD9A|\\uD83C\\uDE01|\\uD83C\\uDE32|\\uD83C\\uDE33|\\uD83C\\uDE34|\\uD83C\\uDE35|\\uD83C\\uDE36|\\uD83C\\uDE38|\\uD83C\\uDE39|\\uD83C\\uDE3A|\\uD83C\\uDE50|\\uD83C\\uDE51|\\uD83C\\uDF00|\\uD83C\\uDF01|\\uD83C\\uDF02|\\uD83C\\uDF03|\\uD83C\\uDF04|\\uD83C\\uDF05|\\uD83C\\uDF06|\\uD83C\\uDF07|\\uD83C\\uDF08|\\uD83C\\uDF09|\\uD83C\\uDF0A|\\uD83C\\uDF0B|\\uD83C\\uDF0C|\\uD83C\\uDF0F|\\uD83C\\uDF11|\\uD83C\\uDF13|\\uD83C\\uDF14|\\uD83C\\uDF15|\\uD83C\\uDF19|\\uD83C\\uDF1B|\\uD83C\\uDF1F|\\uD83C\\uDF20|\\uD83C\\uDF30|\\uD83C\\uDF31|\\uD83C\\uDF34|\\uD83C\\uDF35|\\uD83C\\uDF37|\\uD83C\\uDF38|\\uD83C\\uDF39|\\uD83C\\uDF3A|\\uD83C\\uDF3B|\\uD83C\\uDF3C|\\uD83C\\uDF3D|\\uD83C\\uDF3E|\\uD83C\\uDF3F|\\uD83C\\uDF40|\\uD83C\\uDF41|\\uD83C\\uDF42|\\uD83C\\uDF43|\\uD83C\\uDF44|\\uD83C\\uDF45|\\uD83C\\uDF46|\\uD83C\\uDF47|\\uD83C\\uDF48|\\uD83C\\uDF49|\\uD83C\\uDF4A|\\uD83C\\uDF4C|\\uD83C\\uDF4D|\\uD83C\\uDF4E|\\uD83C\\uDF4F|\\uD83C\\uDF51|\\uD83C\\uDF52|\\uD83C\\uDF53|\\uD83C\\uDF54|\\uD83C\\uDF55|\\uD83C\\uDF56|\\uD83C\\uDF57|\\uD83C\\uDF58|\\uD83C\\uDF59|\\uD83C\\uDF5A|\\uD83C\\uDF5B|\\uD83C\\uDF5C|\\uD83C\\uDF5D|\\uD83C\\uDF5E|\\uD83C\\uDF5F|\\uD83C\\uDF60|\\uD83C\\uDF61|\\uD83C\\uDF62|\\uD83C\\uDF63|\\uD83C\\uDF64|\\uD83C\\uDF65|\\uD83C\\uDF66|\\uD83C\\uDF67|\\uD83C\\uDF68|\\uD83C\\uDF69|\\uD83C\\uDF6A|\\uD83C\\uDF6B|\\uD83C\\uDF6C|\\uD83C\\uDF6D|\\uD83C\\uDF6E|\\uD83C\\uDF6F|\\uD83C\\uDF70|\\uD83C\\uDF71|\\uD83C\\uDF72|\\uD83C\\uDF73|\\uD83C\\uDF74|\\uD83C\\uDF75|\\uD83C\\uDF76|\\uD83C\\uDF77|\\uD83C\\uDF78|\\uD83C\\uDF79|\\uD83C\\uDF7A|\\uD83C\\uDF7B|\\uD83C\\uDF80|\\uD83C\\uDF81|\\uD83C\\uDF82|\\uD83C\\uDF83|\\uD83C\\uDF84|\\uD83C\\uDF85|\\uD83C\\uDF86|\\uD83C\\uDF87|\\uD83C\\uDF88|\\uD83C\\uDF89|\\uD83C\\uDF8A|\\uD83C\\uDF8B|\\uD83C\\uDF8C|\\uD83C\\uDF8D|\\uD83C\\uDF8E|\\uD83C\\uDF8F|\\uD83C\\uDF90|\\uD83C\\uDF91|\\uD83C\\uDF92|\\uD83C\\uDF93|\\uD83C\\uDFA0|\\uD83C\\uDFA1|\\uD83C\\uDFA2|\\uD83C\\uDFA3|\\uD83C\\uDFA4|\\uD83C\\uDFA5|\\uD83C\\uDFA6|\\uD83C\\uDFA7|\\uD83C\\uDFA8|\\uD83C\\uDFA9|\\uD83C\\uDFAA|\\uD83C\\uDFAB|\\uD83C\\uDFAC|\\uD83C\\uDFAD|\\uD83C\\uDFAE|\\uD83C\\uDFAF|\\uD83C\\uDFB0|\\uD83C\\uDFB1|\\uD83C\\uDFB2|\\uD83C\\uDFB3|\\uD83C\\uDFB4|\\uD83C\\uDFB5|\\uD83C\\uDFB6|\\uD83C\\uDFB7|\\uD83C\\uDFB8|\\uD83C\\uDFB9|\\uD83C\\uDFBA|\\uD83C\\uDFBB|\\uD83C\\uDFBC|\\uD83C\\uDFBD|\\uD83C\\uDFBE|\\uD83C\\uDFBF|\\uD83C\\uDFC0|\\uD83C\\uDFC1|\\uD83C\\uDFC2|\\uD83C\\uDFC3|\\uD83C\\uDFC4|\\uD83C\\uDFC6|\\uD83C\\uDFC8|\\uD83C\\uDFCA|\\uD83C\\uDFE0|\\uD83D\\uDDB1|\\uD83C\\uDFE2|\\uD83C\\uDFE3|\\uD83C\\uDFE5|\\uD83C\\uDFE6|\\uD83C\\uDFE7|\\uD83C\\uDFE8|\\uD83C\\uDFE9|\\uD83C\\uDFEA|\\uD83C\\uDFEB|\\uD83C\\uDFEC|\\uD83C\\uDFED|\\uD83C\\uDFEE|\\uD83C\\uDFEF|\\uD83C\\uDFF0|\\uD83D\\uDC0C|\\uD83D\\uDC0D|\\uD83D\\uDC0E|\\uD83D\\uDC11|\\uD83D\\uDC12|\\uD83D\\uDC14|\\uD83D\\uDC17|\\uD83D\\uDC18|\\uD83D\\uDC19|\\uD83D\\uDC1A|\\uD83D\\uDC1B|\\uD83D\\uDC1C|\\uD83D\\uDC1D|\\uD83D\\uDC1E|\\uD83D\\uDC1F|\\uD83D\\uDC20|\\uD83D\\uDC21|\\uD83D\\uDC22|\\uD83D\\uDC23|\\uD83D\\uDC24|\\uD83D\\uDC25|\\uD83D\\uDC26|\\uD83D\\uDC27|\\uD83D\\uDC28|\\uD83D\\uDC29|\\uD83D\\uDC2B|\\uD83D\\uDC2C|\\uD83D\\uDC2D|\\uD83D\\uDC2E|\\uD83D\\uDC2F|\\uD83D\\uDC30|\\uD83D\\uDC31|\\uD83D\\uDC32|\\uD83D\\uDC33|\\uD83D\\uDC34|\\uD83D\\uDC35|\\uD83D\\uDC36|\\uD83D\\uDC37|\\uD83D\\uDC38|\\uD83D\\uDC39|\\uD83D\\uDC3A|\\uD83D\\uDC3B|\\uD83D\\uDC3C|\\uD83D\\uDC3D|\\uD83D\\uDC3E|\\uD83D\\uDC40|\\uD83D\\uDC42|\\uD83D\\uDC43|\\uD83D\\uDC44|\\uD83D\\uDC45|\\uD83D\\uDC46|\\uD83D\\uDC47|\\uD83D\\uDC48|\\uD83D\\uDC49|\\uD83D\\uDC4A|\\uD83D\\uDC4B|\\uD83D\\uDC4C|\\uD83D\\uDC4D|\\uD83D\\uDC4E|\\uD83D\\uDC4F|\\uD83D\\uDC50|\\uD83D\\uDC51|\\uD83D\\uDC52|\\uD83D\\uDC53|\\uD83D\\uDC54|\\uD83D\\uDC55|\\uD83D\\uDC56|\\uD83D\\uDC57|\\uD83D\\uDC58|\\uD83D\\uDC59|\\uD83D\\uDC5A|\\uD83D\\uDC5B|\\uD83D\\uDC5C|\\uD83D\\uDC5D|\\uD83D\\uDC5E|\\uD83D\\uDC5F|\\uD83D\\uDC60|\\uD83D\\uDC61|\\uD83D\\uDC62|\\uD83D\\uDC63|\\uD83D\\uDC64|\\uD83D\\uDC66|\\uD83D\\uDC67|\\uD83D\\uDC68|\\uD83D\\uDC69|\\uD83D\\uDC6A|\\uD83D\\uDC6B|\\uD83D\\uDC6E|\\uD83D\\uDC6F|\\uD83D\\uDC70|\\uD83D\\uDC71|\\uD83D\\uDC72|\\uD83D\\uDC73|\\uD83D\\uDC74|\\uD83D\\uDC75|\\uD83D\\uDC76|\\uD83D\\uDC77|\\uD83D\\uDC78|\\uD83D\\uDC79|\\uD83D\\uDC7A|\\uD83D\\uDC7B|\\uD83D\\uDC7C|\\uD83D\\uDC7D|\\uD83D\\uDC7E|\\uD83D\\uDC7F|\\uD83D\\uDC80|\\uD83D\\uDCC7|\\uD83D\\uDC81|\\uD83D\\uDC82|\\uD83D\\uDC83|\\uD83D\\uDC84|\\uD83D\\uDC85|\\uD83D\\uDCD2|\\uD83D\\uDC86|\\uD83D\\uDCD3|\\uD83D\\uDC87|\\uD83D\\uDCD4|\\uD83D\\uDC88|\\uD83D\\uDCD5|\\uD83D\\uDC89|\\uD83D\\uDCD6|\\uD83D\\uDC8A|\\uD83D\\uDCD7|\\uD83D\\uDC8B|\\uD83D\\uDCD8|\\uD83D\\uDC8C|\\uD83D\\uDCD9|\\uD83D\\uDC8D|\\uD83D\\uDCDA|\\uD83D\\uDC8E|\\uD83D\\uDCDB|\\uD83D\\uDC8F|\\uD83D\\uDCDC|\\uD83D\\uDC90|\\uD83D\\uDCDD|\\uD83D\\uDC91|\\uD83D\\uDCDE|\\uD83D\\uDC92|\\uD83D\\uDCDF|\\uD83D\\uDCE0|\\uD83D\\uDC93|\\uD83D\\uDCE1|\\uD83D\\uDCE2|\\uD83D\\uDC94|\\uD83D\\uDCE3|\\uD83D\\uDCE4|\\uD83D\\uDC95|\\uD83D\\uDCE5|\\uD83D\\uDCE6|\\uD83D\\uDC96|\\uD83D\\uDCE7|\\uD83D\\uDCE8|\\uD83D\\uDC97|\\uD83D\\uDCE9|\\uD83D\\uDCEA|\\uD83D\\uDC98|\\uD83D\\uDCEB|\\uD83D\\uDCEE|\\uD83D\\uDC99|\\uD83D\\uDCF0|\\uD83D\\uDCF1|\\uD83D\\uDC9A|\\uD83D\\uDCF2|\\uD83D\\uDCF3|\\uD83D\\uDC9B|\\uD83D\\uDCF4|\\uD83D\\uDCF6|\\uD83D\\uDC9C|\\uD83D\\uDCF7|\\uD83D\\uDCF9|\\uD83D\\uDC9D|\\uD83D\\uDCFA|\\uD83D\\uDCFB|\\uD83D\\uDC9E|\\uD83D\\uDCFC|\\uD83D\\uDD03|\\uD83D\\uDC9F|\\uD83D\\uDD0A|\\uD83D\\uDD0B|\\uD83D\\uDCA0|\\uD83D\\uDD0C|\\uD83D\\uDD0D|\\uD83D\\uDCA1|\\uD83D\\uDD0E|\\uD83D\\uDD0F|\\uD83D\\uDCA2|\\uD83D\\uDD10|\\uD83D\\uDD11|\\uD83D\\uDCA3|\\uD83D\\uDD12|\\uD83D\\uDD13|\\uD83D\\uDCA4|\\uD83D\\uDD14|\\uD83D\\uDD16|\\uD83D\\uDCA5|\\uD83D\\uDD17|\\uD83D\\uDD18|\\uD83D\\uDCA6|\\uD83D\\uDD19|\\uD83D\\uDD1A|\\uD83D\\uDCA7|\\uD83D\\uDD1B|\\uD83D\\uDD1C|\\uD83D\\uDCA8|\\uD83D\\uDD1D|\\uD83D\\uDD1E|\\uD83D\\uDCA9|\\uD83D\\uDD1F|\\uD83D\\uDCAA|\\uD83D\\uDD20|\\uD83D\\uDD21|\\uD83D\\uDCAB|\\uD83D\\uDD22|\\uD83D\\uDD23|\\uD83D\\uDCAC|\\uD83D\\uDD24|\\uD83D\\uDD25|\\uD83D\\uDCAE|\\uD83D\\uDD26|\\uD83D\\uDD27|\\uD83D\\uDCAF|\\uD83D\\uDD28|\\uD83D\\uDD29|\\uD83D\\uDCB0|\\uD83D\\uDD2A|\\uD83D\\uDD2B|\\uD83D\\uDCB1|\\uD83D\\uDD2E|\\uD83D\\uDCB2|\\uD83D\\uDD2F|\\uD83D\\uDCB3|\\uD83D\\uDD30|\\uD83D\\uDD31|\\uD83D\\uDCB4|\\uD83D\\uDD32|\\uD83D\\uDD33|\\uD83D\\uDCB5|\\uD83D\\uDD34|\\uD83D\\uDD35|\\uD83D\\uDCB8|\\uD83D\\uDD36|\\uD83D\\uDD37|\\uD83D\\uDCB9|\\uD83D\\uDD38|\\uD83D\\uDD39|\\uD83D\\uDCBA|\\uD83D\\uDD3A|\\uD83D\\uDD3B|\\uD83D\\uDCBB|\\uD83D\\uDD3C|\\uD83D\\uDCBC|\\uD83D\\uDD3D|\\uD83D\\uDD50|\\uD83D\\uDCBD|\\uD83D\\uDD51|\\uD83D\\uDCBE|\\uD83D\\uDD52|\\uD83D\\uDCBF|\\uD83D\\uDD53|\\uD83D\\uDCC0|\\uD83D\\uDD54|\\uD83D\\uDD55|\\uD83D\\uDCC1|\\uD83D\\uDD56|\\uD83D\\uDD57|\\uD83D\\uDCC2|\\uD83D\\uDD58|\\uD83D\\uDD59|\\uD83D\\uDCC3|\\uD83D\\uDD5A|\\uD83D\\uDD5B|\\uD83D\\uDCC4|\\uD83D\\uDDFB|\\uD83D\\uDDFC|\\uD83D\\uDCC5|\\uD83D\\uDDFD|\\uD83D\\uDDFE|\\uD83D\\uDCC6|\\uD83D\\uDDFF|\\uD83D\\uDE01|\\uD83D\\uDE02|\\uD83D\\uDE03|\\uD83D\\uDCC8|\\uD83D\\uDE04|\\uD83D\\uDE05|\\uD83D\\uDCC9|\\uD83D\\uDE06|\\uD83D\\uDE09|\\uD83D\\uDCCA|\\uD83D\\uDE0A|\\uD83D\\uDE0B|\\uD83D\\uDCCB|\\uD83D\\uDE0C|\\uD83D\\uDE0D|\\uD83D\\uDCCC|\\uD83D\\uDE0F|\\uD83D\\uDE12|\\uD83D\\uDCCD|\\uD83D\\uDE13|\\uD83D\\uDE14|\\uD83D\\uDCCE|\\uD83D\\uDE16|\\uD83D\\uDE18|\\uD83D\\uDCCF|\\uD83D\\uDE1A|\\uD83D\\uDE1C|\\uD83D\\uDCD0|\\uD83D\\uDE1D|\\uD83D\\uDE1E|\\uD83D\\uDCD1|\\uD83D\\uDE20|\\uD83D\\uDE21|\\uD83D\\uDE22|\\uD83D\\uDE23|\\uD83D\\uDE24|\\uD83D\\uDE25|\\uD83D\\uDE28|\\uD83D\\uDE29|\\uD83D\\uDE2A|\\uD83D\\uDE2B|\\uD83D\\uDE2D|\\uD83D\\uDE30|\\uD83D\\uDE31|\\uD83D\\uDE32|\\uD83D\\uDE33|\\uD83D\\uDE35|\\uD83D\\uDE37|\\uD83D\\uDE38|\\uD83D\\uDE39|\\uD83D\\uDE3A|\\uD83D\\uDE3B|\\uD83D\\uDE3C|\\uD83D\\uDE3D|\\uD83D\\uDE3E|\\uD83D\\uDE3F|\\uD83D\\uDE40|\\uD83D\\uDE45|\\uD83D\\uDE46|\\uD83D\\uDE47|\\uD83D\\uDE48|\\uD83D\\uDE49|\\uD83D\\uDE4A|\\uD83D\\uDE4B|\\uD83D\\uDE4C|\\uD83D\\uDE4D|\\uD83D\\uDE4E|\\uD83D\\uDE4F|\\uD83D\\uDE80|\\uD83D\\uDE83|\\uD83D\\uDE84|\\uD83D\\uDE85|\\uD83D\\uDE87|\\uD83D\\uDE89|\\uD83D\\uDE8C|\\uD83D\\uDE8F|\\uD83D\\uDE91|\\uD83D\\uDE92|\\uD83D\\uDE93|\\uD83D\\uDE95|\\uD83D\\uDE97|\\uD83D\\uDE99|\\uD83D\\uDE9A|\\uD83D\\uDEA2|\\uD83D\\uDEA4|\\uD83D\\uDEA5|\\uD83D\\uDEA7|\\uD83D\\uDEA8|\\uD83D\\uDEA9|\\uD83D\\uDEAA|\\uD83D\\uDEAB|\\uD83D\\uDEAC|\\uD83D\\uDEAD|\\uD83D\\uDEB2|\\uD83D\\uDEB6|\\uD83D\\uDEB9|\\uD83D\\uDEBA|\\uD83D\\uDEBB|\\uD83D\\uDEBC|\\uD83D\\uDEBD|\\uD83D\\uDEBE|\\uD83D\\uDEC0|\\uD83E\\uDD18|\\uD83D\\uDE00|\\uD83D\\uDE07|\\uD83D\\uDE08|\\uD83D\\uDE0E|\\uD83D\\uDE10|\\uD83D\\uDE11|\\uD83D\\uDE15|\\uD83D\\uDE17|\\uD83D\\uDE19|\\uD83D\\uDE1B|\\uD83D\\uDE1F|\\uD83D\\uDE26|\\uD83D\\uDE27|\\uD83D\\uDE2C|\\uD83D\\uDE2E|\\uD83D\\uDE2F|\\uD83D\\uDE34|\\uD83D\\uDE36|\\uD83D\\uDE81|\\uD83D\\uDE82|\\uD83D\\uDE86|\\uD83D\\uDE88|\\uD83D\\uDE8A|\\uD83D\\uDE8D|\\uD83D\\uDE8E|\\uD83D\\uDE90|\\uD83D\\uDE94|\\uD83D\\uDE96|\\uD83D\\uDE98|\\uD83D\\uDE9B|\\uD83D\\uDE9C|\\uD83D\\uDE9D|\\uD83D\\uDE9E|\\uD83D\\uDE9F|\\uD83D\\uDEA0|\\uD83D\\uDEA1|\\uD83D\\uDEA3|\\uD83D\\uDEA6|\\uD83D\\uDEAE|\\uD83D\\uDEAF|\\uD83D\\uDEB0|\\uD83D\\uDEB1|\\uD83D\\uDEB3|\\uD83D\\uDEB4|\\uD83D\\uDEB5|\\uD83D\\uDEB7|\\uD83D\\uDEB8|\\uD83D\\uDEBF|\\uD83D\\uDEC1|\\uD83D\\uDEC2|\\uD83D\\uDEC3|\\uD83D\\uDEC4|\\uD83D\\uDEC5|\\uD83C\\uDF0D|\\uD83C\\uDF0E|\\uD83C\\uDF10|\\uD83C\\uDF12|\\uD83C\\uDF16|\\uD83C\\uDF17|\\uD83C\\uDF18|\\uD83C\\uDF1A|\\uD83C\\uDF1C|\\uD83C\\uDF1D|\\uD83C\\uDF1E|\\uD83C\\uDF32|\\uD83C\\uDF33|\\uD83C\\uDF4B|\\uD83C\\uDF50|\\uD83C\\uDF7C|\\uD83C\\uDFC7|\\uD83C\\uDFC9|\\uD83C\\uDFE4|\\uD83D\\uDC00|\\uD83D\\uDC01|\\uD83D\\uDC02|\\uD83D\\uDC03|\\uD83D\\uDC04|\\uD83D\\uDC05|\\uD83D\\uDC06|\\uD83D\\uDC07|\\uD83D\\uDC08|\\uD83D\\uDC09|\\uD83D\\uDC0A|\\uD83D\\uDC0B|\\uD83D\\uDC0F|\\uD83D\\uDC10|\\uD83D\\uDC13|\\uD83D\\uDC15|\\uD83D\\uDC16|\\uD83D\\uDC2A|\\uD83D\\uDC65|\\uD83D\\uDC6C|\\uD83D\\uDC6D|\\uD83D\\uDCAD|\\uD83D\\uDCB6|\\uD83D\\uDCB7|\\uD83D\\uDCEC|\\uD83D\\uDCED|\\uD83D\\uDCEF|\\uD83D\\uDCF5|\\uD83D\\uDD00|\\uD83D\\uDD01|\\uD83D\\uDD02|\\uD83D\\uDD04|\\uD83D\\uDD05|\\uD83D\\uDD06|\\uD83D\\uDD07|\\uD83D\\uDD09|\\uD83D\\uDD15|\\uD83D\\uDD2C|\\uD83D\\uDD2D|\\uD83D\\uDD5C|\\uD83D\\uDD5D|\\uD83D\\uDD5E|\\uD83D\\uDD5F|\\uD83D\\uDD60|\\uD83D\\uDD61|\\uD83D\\uDD62|\\uD83D\\uDD63|\\uD83D\\uDD64|\\uD83D\\uDD65|\\uD83D\\uDD66|\\uD83D\\uDD67|\\uD83D\\uDD08|\\uD83D\\uDE8B|\\uD83C\\uDFC5|\\uD83C\\uDFF4|\\uD83D\\uDCF8|\\uD83D\\uDECC|\\uD83D\\uDD95|\\uD83D\\uDD96|\\uD83D\\uDE41|\\uD83D\\uDE42|\\uD83D\\uDEEB|\\uD83D\\uDEEC|\\uD83C\\uDFFB|\\uD83C\\uDFFC|\\uD83C\\uDFFD|\\uD83C\\uDFFE|\\uD83C\\uDFFF|\\uD83D\\uDE43|\\uD83E\\uDD11|\\uD83E\\uDD13|\\uD83E\\uDD17|\\uD83D\\uDE44|\\uD83E\\uDD14|\\uD83E\\uDD10|\\uD83E\\uDD12|\\uD83E\\uDD15|\\uD83E\\uDD16|\\uD83E\\uDD81|\\uD83E\\uDD84|\\uD83E\\uDD82|\\uD83E\\uDD80|\\uD83E\\uDD83|\\uD83E\\uDDC0|\\uD83C\\uDF2D|\\uD83C\\uDF2E|\\uD83C\\uDF2F|\\uD83C\\uDF7F|\\uD83C\\uDF7E|\\uD83C\\uDFF9|\\uD83C\\uDFFA|\\uD83D\\uDED0|\\uD83D\\uDD4B|\\uD83D\\uDD4C|\\uD83D\\uDD4D|\\uD83D\\uDD4E|\\uD83D\\uDCFF|\\uD83C\\uDFCF|\\uD83C\\uDFD0|\\uD83C\\uDFD1|\\uD83C\\uDFD2|\\uD83C\\uDFD3|\\uD83C\\uDFF8|\\uD83C\\uDF26|\\uD83C\\uDF25|\\uD83C\\uDF24|\\uD83D\\uDEF3|\\uD83D\\uDEE9|\\uD83D\\uDEE5|\\uD83D\\uDEE4|\\uD83D\\uDEE3|\\uD83D\\uDECF|\\uD83D\\uDECE|\\uD83D\\uDECD|\\uD83D\\uDECB|\\uD83C\\uDFDF|\\uD83C\\uDFDE|\\uD83C\\uDFDD|\\uD83C\\uDFDC|\\uD83C\\uDFDB|\\uD83C\\uDFDA|\\uD83C\\uDFD9|\\uD83C\\uDFD8|\\uD83C\\uDFD7|\\uD83C\\uDFD6|\\uD83C\\uDFD5|\\uD83C\\uDFD4|\\uD83D\\uDD90|\\uD83D\\uDD75|\\uD83D\\uDD74|\\uD83D\\uDC41|\\uD83C\\uDF7D|\\uD83D\\uDEF0|\\uD83D\\uDEE2|\\uD83D\\uDEE1|\\uD83D\\uDEE0|\\uD83D\\uDDFA|\\uD83D\\uDDF3|\\uD83D\\uDDEF|\\uD83D\\uDDE3|\\uD83D\\uDDE1|\\uD83D\\uDDDE|\\uD83D\\uDDDD|\\uD83D\\uDDDC|\\uD83D\\uDDD3|\\uD83D\\uDDD2|\\uD83D\\uDDD1|\\uD83D\\uDDC4|\\uD83D\\uDDC3|\\uD83D\\uDDC2|\\uD83D\\uDDBC|\\uD83D\\uDDB2|\\uD83D\\uDDA8|\\uD83D\\uDDA5|\\uD83D\\uDD8D|\\uD83D\\uDD8C|\\uD83D\\uDD8B|\\uD83D\\uDD8A|\\uD83D\\uDD87|\\uD83D\\uDD79|\\uD83D\\uDD76|\\uD83D\\uDD73|\\uD83D\\uDD70|\\uD83D\\uDD6F|\\uD83D\\uDD4A|\\uD83D\\uDD49|\\uD83D\\uDCFD|\\uD83C\\uDFF7|\\uD83C\\uDFF5|\\uD83C\\uDFF3|\\uD83C\\uDF9B|\\uD83C\\uDF9A|\\uD83C\\uDF99|\\uD83C\\uDF21|\\uD83D\\uDD78|\\uD83D\\uDD77|\\uD83D\\uDC3F|\\uD83C\\uDF2C|\\uD83C\\uDF2B|\\uD83C\\uDF2A|\\uD83C\\uDF29|\\uD83C\\uDF28|\\uD83C\\uDF27|\\uD83C\\uDF36|\\uD83C\\uDF97|\\uD83C\\uDF96|\\uD83C\\uDFCE|\\uD83C\\uDFCD|\\uD83C\\uDFCC|\\uD83C\\uDFCB|\\uD83C\\uDF9F|\\uD83C\\uDF9E|\\uD83C\\uDE37|\\uD83C\\uDE2F|\\uD83C\\uDE1A|\\uD83C\\uDE02|\\uD83C\\uDD7F|\\uD83C\\uDC04|\\uD83C\\uDFE1|\\u2714|\\u2733|\\u2734|\\u2744|\\u2747|\\u2757|\\u2764|\\u27A1|\\u2934|\\u2935|\\u2B05|\\u2B06|\\u2B07|\\u2B1B|\\u2B1C|\\u2B50|\\u2B55|\\u3030|\\u303D|\\u3297|\\u3299|\\u2712|\\u270F|\\u270C|\\u2709|\\u2708|\\u2702|\\u26FD|\\u26FA|\\u26F5|\\u26F3|\\u26F2|\\u26EA|\\u26D4|\\u26C5|\\u26C4|\\u26BE|\\u26BD|\\u26AB|\\u26AA|\\u26A1|\\u26A0|\\u2693|\\u267F|\\u267B|\\u2668|\\u2666|\\u2665|\\u2663|\\u2660|\\u2653|\\u2652|\\u2651|\\u271D|\\u2650|\\u264F|\\u264E|\\u264D|\\u264C|\\u264B|\\u264A|\\u2649|\\u2648|\\u263A|\\u261D|\\u2615|\\u2614|\\u2611|\\u2328|\\u260E|\\u2601|\\u2600|\\u25FE|\\u25FD|\\u25FC|\\u25FB|\\u25C0|\\u25B6|\\u25AB|\\u25AA|\\u24C2|\\u2716|\\u231A|\\u21AA|\\u21A9|\\u2199|\\u2198|\\u2197|\\u2196|\\u2195|\\u2194|\\u2139|\\u2122|\\u270D|\\u2049|\\u203C|\\u00AE|\\u00A9|\\u27BF|\\u27B0|\\u2797|\\u2796|\\u2795|\\u2755|\\u2754|\\u2753|\\u274E|\\u274C|\\u2728|\\u270B|\\u270A|\\u2705|\\u26CE|\\u23F3|\\u23F0|\\u23EC|\\u23ED|\\u23EE|\\u23EF|\\u23F1|\\u23F2|\\u23F8|\\u23F9|\\u23FA|\\u2602|\\u2603|\\u2604|\\u2618|\\u2620|\\u2622|\\u2623|\\u2626|\\u262A|\\u262E|\\u262F|\\u2638|\\u2639|\\u2692|\\u2694|\\u2696|\\u2697|\\u2699|\\u269B|\\u269C|\\u26B0|\\u26B1|\\u26C8|\\u26CF|\\u26D1|\\u26D3|\\u26E9|\\u26F0|\\u26F1|\\u26F4|\\u26F7|\\u26F8|\\u26F9|\\u2721|\\u2763|\\u23EB|\\u23EA|\\u23E9|\\u231B)",
    a.jsEscapeMap={"👩‍❤️‍💋‍👩":"1f469-2764-1f48b-1f469","👨‍❤️‍💋‍👨":"1f468-2764-1f48b-1f468","👨‍👨‍👦‍👦":"1f468-1f468-1f466-1f466","👨‍👨‍👧‍👦":"1f468-1f468-1f467-1f466","👨‍👨‍👧‍👧":"1f468-1f468-1f467-1f467","👨‍👩‍👦‍👦":"1f468-1f469-1f466-1f466","👨‍👩‍👧‍👦":"1f468-1f469-1f467-1f466","👨‍👩‍👧‍👧":"1f468-1f469-1f467-1f467","👩‍👩‍👦‍👦":"1f469-1f469-1f466-1f466","👩‍👩‍👧‍👦":"1f469-1f469-1f467-1f466","👩‍👩‍👧‍👧":"1f469-1f469-1f467-1f467","👩‍❤️‍👩":"1f469-2764-1f469","👨‍❤️‍👨":"1f468-2764-1f468","👨‍👨‍👦":"1f468-1f468-1f466","👨‍👨‍👧":"1f468-1f468-1f467","👨‍👩‍👧":"1f468-1f469-1f467","👩‍👩‍👦":"1f469-1f469-1f466","👩‍👩‍👧":"1f469-1f469-1f467","👁‍🗨":"1f441-1f5e8","#️⃣":"0023-20e3","0️⃣":"0030-20e3","1️⃣":"0031-20e3","2️⃣":"0032-20e3","3️⃣":"0033-20e3","4️⃣":"0034-20e3","5️⃣":"0035-20e3","6️⃣":"0036-20e3","7️⃣":"0037-20e3","8️⃣":"0038-20e3","9️⃣":"0039-20e3","*️⃣":"002a-20e3","🤘🏿":"1f918-1f3ff","🤘🏾":"1f918-1f3fe","🤘🏽":"1f918-1f3fd","🤘🏼":"1f918-1f3fc","🤘🏻":"1f918-1f3fb","🛀🏿":"1f6c0-1f3ff","🛀🏾":"1f6c0-1f3fe","🛀🏽":"1f6c0-1f3fd","🛀🏼":"1f6c0-1f3fc","🛀🏻":"1f6c0-1f3fb","🚶🏿":"1f6b6-1f3ff","🚶🏾":"1f6b6-1f3fe","🚶🏽":"1f6b6-1f3fd","🚶🏼":"1f6b6-1f3fc","🚶🏻":"1f6b6-1f3fb","🚵🏿":"1f6b5-1f3ff","🚵🏾":"1f6b5-1f3fe","🚵🏽":"1f6b5-1f3fd","🚵🏼":"1f6b5-1f3fc","🚵🏻":"1f6b5-1f3fb","🚴🏿":"1f6b4-1f3ff","🚴🏾":"1f6b4-1f3fe","🚴🏽":"1f6b4-1f3fd","🚴🏼":"1f6b4-1f3fc","🚴🏻":"1f6b4-1f3fb","🚣🏿":"1f6a3-1f3ff","🚣🏾":"1f6a3-1f3fe","🚣🏽":"1f6a3-1f3fd","🚣🏼":"1f6a3-1f3fc","🚣🏻":"1f6a3-1f3fb","🙏🏿":"1f64f-1f3ff","🙏🏾":"1f64f-1f3fe","🙏🏽":"1f64f-1f3fd","🙏🏼":"1f64f-1f3fc","🙏🏻":"1f64f-1f3fb","🙎🏿":"1f64e-1f3ff","🙎🏾":"1f64e-1f3fe","🙎🏽":"1f64e-1f3fd","🙎🏼":"1f64e-1f3fc","🙎🏻":"1f64e-1f3fb","🙍🏿":"1f64d-1f3ff","🙍🏾":"1f64d-1f3fe","🙍🏽":"1f64d-1f3fd","🙍🏼":"1f64d-1f3fc","🙍🏻":"1f64d-1f3fb","🙌🏿":"1f64c-1f3ff","🙌🏾":"1f64c-1f3fe","🙌🏽":"1f64c-1f3fd","🙌🏼":"1f64c-1f3fc","🙌🏻":"1f64c-1f3fb","🙋🏿":"1f64b-1f3ff","🙋🏾":"1f64b-1f3fe","🙋🏽":"1f64b-1f3fd","🙋🏼":"1f64b-1f3fc","🙋🏻":"1f64b-1f3fb","🙇🏿":"1f647-1f3ff","🙇🏾":"1f647-1f3fe","🙇🏽":"1f647-1f3fd","🙇🏼":"1f647-1f3fc","🙇🏻":"1f647-1f3fb","🙆🏿":"1f646-1f3ff","🙆🏾":"1f646-1f3fe","🙆🏽":"1f646-1f3fd","🙆🏼":"1f646-1f3fc","🙆🏻":"1f646-1f3fb","🙅🏿":"1f645-1f3ff","🙅🏾":"1f645-1f3fe","🙅🏽":"1f645-1f3fd","🙅🏼":"1f645-1f3fc","🙅🏻":"1f645-1f3fb","🖖🏿":"1f596-1f3ff","🖖🏾":"1f596-1f3fe","🖖🏽":"1f596-1f3fd","🖖🏼":"1f596-1f3fc","🖖🏻":"1f596-1f3fb","🖕🏿":"1f595-1f3ff","🖕🏾":"1f595-1f3fe","🖕🏽":"1f595-1f3fd","🖕🏼":"1f595-1f3fc","🖕🏻":"1f595-1f3fb","🖐🏿":"1f590-1f3ff","🖐🏾":"1f590-1f3fe","🖐🏽":"1f590-1f3fd","🖐🏼":"1f590-1f3fc","🖐🏻":"1f590-1f3fb","🕵🏿":"1f575-1f3ff","🕵🏾":"1f575-1f3fe","🕵🏽":"1f575-1f3fd","🕵🏼":"1f575-1f3fc","🕵🏻":"1f575-1f3fb","💪🏿":"1f4aa-1f3ff","💪🏾":"1f4aa-1f3fe","💪🏽":"1f4aa-1f3fd","💪🏼":"1f4aa-1f3fc","💪🏻":"1f4aa-1f3fb","💇🏿":"1f487-1f3ff","💇🏾":"1f487-1f3fe","💇🏽":"1f487-1f3fd","💇🏼":"1f487-1f3fc","💇🏻":"1f487-1f3fb","💆🏿":"1f486-1f3ff","💆🏾":"1f486-1f3fe","💆🏽":"1f486-1f3fd","💆🏼":"1f486-1f3fc","💆🏻":"1f486-1f3fb","💅🏿":"1f485-1f3ff","💅🏾":"1f485-1f3fe","💅🏽":"1f485-1f3fd","💅🏼":"1f485-1f3fc","💅🏻":"1f485-1f3fb","💃🏿":"1f483-1f3ff","💃🏾":"1f483-1f3fe","💃🏽":"1f483-1f3fd","💃🏼":"1f483-1f3fc","💃🏻":"1f483-1f3fb","💂🏿":"1f482-1f3ff","💂🏾":"1f482-1f3fe","💂🏽":"1f482-1f3fd","💂🏼":"1f482-1f3fc","💂🏻":"1f482-1f3fb","💁🏿":"1f481-1f3ff","💁🏾":"1f481-1f3fe","💁🏽":"1f481-1f3fd","💁🏼":"1f481-1f3fc","💁🏻":"1f481-1f3fb","👼🏿":"1f47c-1f3ff","👼🏾":"1f47c-1f3fe","👼🏽":"1f47c-1f3fd","👼🏼":"1f47c-1f3fc","👼🏻":"1f47c-1f3fb","👸🏿":"1f478-1f3ff","👸🏾":"1f478-1f3fe","👸🏽":"1f478-1f3fd","👸🏼":"1f478-1f3fc","👸🏻":"1f478-1f3fb","👷🏿":"1f477-1f3ff","👷🏾":"1f477-1f3fe","👷🏽":"1f477-1f3fd","👷🏼":"1f477-1f3fc","👷🏻":"1f477-1f3fb","👶🏿":"1f476-1f3ff","👶🏾":"1f476-1f3fe","👶🏽":"1f476-1f3fd","👶🏼":"1f476-1f3fc","👶🏻":"1f476-1f3fb","👵🏿":"1f475-1f3ff","👵🏾":"1f475-1f3fe","👵🏽":"1f475-1f3fd","👵🏼":"1f475-1f3fc","👵🏻":"1f475-1f3fb","👴🏿":"1f474-1f3ff","👴🏾":"1f474-1f3fe","👴🏽":"1f474-1f3fd","👴🏼":"1f474-1f3fc","👴🏻":"1f474-1f3fb","👳🏿":"1f473-1f3ff","👳🏾":"1f473-1f3fe","👳🏽":"1f473-1f3fd","👳🏼":"1f473-1f3fc","👳🏻":"1f473-1f3fb","👲🏿":"1f472-1f3ff","👲🏾":"1f472-1f3fe","👲🏽":"1f472-1f3fd","👲🏼":"1f472-1f3fc","👲🏻":"1f472-1f3fb","👱🏿":"1f471-1f3ff","👱🏾":"1f471-1f3fe","👱🏽":"1f471-1f3fd","👱🏼":"1f471-1f3fc","👱🏻":"1f471-1f3fb","👰🏿":"1f470-1f3ff","👰🏾":"1f470-1f3fe","👰🏽":"1f470-1f3fd","👰🏼":"1f470-1f3fc","👰🏻":"1f470-1f3fb","👮🏿":"1f46e-1f3ff","👮🏾":"1f46e-1f3fe","👮🏽":"1f46e-1f3fd","👮🏼":"1f46e-1f3fc","👮🏻":"1f46e-1f3fb","👩🏿":"1f469-1f3ff","👩🏾":"1f469-1f3fe","👩🏽":"1f469-1f3fd","👩🏼":"1f469-1f3fc","👩🏻":"1f469-1f3fb","👨🏿":"1f468-1f3ff","👨🏾":"1f468-1f3fe","👨🏽":"1f468-1f3fd","👨🏼":"1f468-1f3fc","👨🏻":"1f468-1f3fb","👧🏿":"1f467-1f3ff","👧🏾":"1f467-1f3fe","👧🏽":"1f467-1f3fd","👧🏼":"1f467-1f3fc","👧🏻":"1f467-1f3fb","👦🏿":"1f466-1f3ff","👦🏾":"1f466-1f3fe","👦🏽":"1f466-1f3fd","👦🏼":"1f466-1f3fc","👦🏻":"1f466-1f3fb","👐🏿":"1f450-1f3ff","👐🏾":"1f450-1f3fe","👐🏽":"1f450-1f3fd","👐🏼":"1f450-1f3fc","👐🏻":"1f450-1f3fb","👏🏿":"1f44f-1f3ff","👏🏾":"1f44f-1f3fe","👏🏽":"1f44f-1f3fd","👏🏼":"1f44f-1f3fc","👏🏻":"1f44f-1f3fb","👎🏿":"1f44e-1f3ff","👎🏾":"1f44e-1f3fe","👎🏽":"1f44e-1f3fd","👎🏼":"1f44e-1f3fc","👎🏻":"1f44e-1f3fb","👍🏿":"1f44d-1f3ff","👍🏾":"1f44d-1f3fe","👍🏽":"1f44d-1f3fd","👍🏼":"1f44d-1f3fc","👍🏻":"1f44d-1f3fb","👌🏿":"1f44c-1f3ff","👌🏾":"1f44c-1f3fe","👌🏽":"1f44c-1f3fd","👌🏼":"1f44c-1f3fc","👌🏻":"1f44c-1f3fb","👋🏿":"1f44b-1f3ff","👋🏾":"1f44b-1f3fe","👋🏽":"1f44b-1f3fd","👋🏼":"1f44b-1f3fc","👋🏻":"1f44b-1f3fb","👊🏿":"1f44a-1f3ff","👊🏾":"1f44a-1f3fe","👊🏽":"1f44a-1f3fd","👊🏼":"1f44a-1f3fc","👊🏻":"1f44a-1f3fb","👉🏿":"1f449-1f3ff","👉🏾":"1f449-1f3fe","👉🏽":"1f449-1f3fd","👉🏼":"1f449-1f3fc","👉🏻":"1f449-1f3fb","👈🏿":"1f448-1f3ff","👈🏾":"1f448-1f3fe","👈🏽":"1f448-1f3fd","👈🏼":"1f448-1f3fc","👈🏻":"1f448-1f3fb","👇🏿":"1f447-1f3ff","👇🏾":"1f447-1f3fe","👇🏽":"1f447-1f3fd","👇🏼":"1f447-1f3fc","👇🏻":"1f447-1f3fb","👆🏿":"1f446-1f3ff","👆🏾":"1f446-1f3fe","👆🏽":"1f446-1f3fd","👆🏼":"1f446-1f3fc","👆🏻":"1f446-1f3fb","👃🏿":"1f443-1f3ff","👃🏾":"1f443-1f3fe","👃🏽":"1f443-1f3fd","👃🏼":"1f443-1f3fc","👃🏻":"1f443-1f3fb","👂🏿":"1f442-1f3ff","👂🏾":"1f442-1f3fe","👂🏽":"1f442-1f3fd","👂🏼":"1f442-1f3fc","👂🏻":"1f442-1f3fb","🏋🏿":"1f3cb-1f3ff","🏋🏾":"1f3cb-1f3fe","🏋🏽":"1f3cb-1f3fd","🏋🏼":"1f3cb-1f3fc","🏋🏻":"1f3cb-1f3fb","🏊🏿":"1f3ca-1f3ff","🏊🏾":"1f3ca-1f3fe","🏊🏽":"1f3ca-1f3fd","🏊🏼":"1f3ca-1f3fc","🏊🏻":"1f3ca-1f3fb","🏇🏿":"1f3c7-1f3ff","🏇🏾":"1f3c7-1f3fe","🏇🏽":"1f3c7-1f3fd","🏇🏼":"1f3c7-1f3fc","🏇🏻":"1f3c7-1f3fb","🏄🏿":"1f3c4-1f3ff","🏄🏾":"1f3c4-1f3fe","🏄🏽":"1f3c4-1f3fd","🏄🏼":"1f3c4-1f3fc","🏄🏻":"1f3c4-1f3fb","🏃🏿":"1f3c3-1f3ff","🏃🏾":"1f3c3-1f3fe","🏃🏽":"1f3c3-1f3fd","🏃🏼":"1f3c3-1f3fc","🏃🏻":"1f3c3-1f3fb","🎅🏿":"1f385-1f3ff","🎅🏾":"1f385-1f3fe","🎅🏽":"1f385-1f3fd","🎅🏼":"1f385-1f3fc","🎅🏻":"1f385-1f3fb","🇿🇼":"1f1ff-1f1fc","🇿🇲":"1f1ff-1f1f2","🇿🇦":"1f1ff-1f1e6","🇾🇹":"1f1fe-1f1f9","🇾🇪":"1f1fe-1f1ea","🇽🇰":"1f1fd-1f1f0","🇼🇸":"1f1fc-1f1f8","🇼🇫":"1f1fc-1f1eb","🇻🇺":"1f1fb-1f1fa","🇻🇳":"1f1fb-1f1f3","🇻🇮":"1f1fb-1f1ee","🇻🇬":"1f1fb-1f1ec","🇻🇪":"1f1fb-1f1ea","🇻🇨":"1f1fb-1f1e8","🇻🇦":"1f1fb-1f1e6","🇺🇿":"1f1fa-1f1ff","🇺🇾":"1f1fa-1f1fe","🇺🇸":"1f1fa-1f1f8","🇺🇲":"1f1fa-1f1f2","🇺🇬":"1f1fa-1f1ec","🇺🇦":"1f1fa-1f1e6","🇹🇿":"1f1f9-1f1ff","🇹🇼":"1f1f9-1f1fc","🇹🇻":"1f1f9-1f1fb","🇹🇹":"1f1f9-1f1f9","🇹🇷":"1f1f9-1f1f7","🇹🇴":"1f1f9-1f1f4","🇹🇳":"1f1f9-1f1f3","🇹🇲":"1f1f9-1f1f2","🇹🇱":"1f1f9-1f1f1","🇹🇰":"1f1f9-1f1f0","🇹🇯":"1f1f9-1f1ef","🇹🇭":"1f1f9-1f1ed","🇹🇬":"1f1f9-1f1ec","🇹🇫":"1f1f9-1f1eb","🇹🇩":"1f1f9-1f1e9","🇹🇨":"1f1f9-1f1e8","🇹🇦":"1f1f9-1f1e6","🇸🇿":"1f1f8-1f1ff","🇸🇾":"1f1f8-1f1fe","🇸🇽":"1f1f8-1f1fd","🇸🇻":"1f1f8-1f1fb","🇸🇹":"1f1f8-1f1f9","🇸🇸":"1f1f8-1f1f8","🇸🇷":"1f1f8-1f1f7","🇸🇴":"1f1f8-1f1f4","🇸🇳":"1f1f8-1f1f3","🇸🇲":"1f1f8-1f1f2","🇸🇱":"1f1f8-1f1f1","🇸🇰":"1f1f8-1f1f0","🇸🇯":"1f1f8-1f1ef","🇸🇮":"1f1f8-1f1ee","🇸🇭":"1f1f8-1f1ed","🇸🇬":"1f1f8-1f1ec","🇸🇪":"1f1f8-1f1ea","🇸🇩":"1f1f8-1f1e9","🇸🇨":"1f1f8-1f1e8","🇸🇧":"1f1f8-1f1e7","🇸🇦":"1f1f8-1f1e6","🇷🇼":"1f1f7-1f1fc","🇷🇺":"1f1f7-1f1fa","🇷🇸":"1f1f7-1f1f8","🇷🇴":"1f1f7-1f1f4","🇷🇪":"1f1f7-1f1ea","🇶🇦":"1f1f6-1f1e6","🇵🇾":"1f1f5-1f1fe","🇵🇼":"1f1f5-1f1fc","🇵🇹":"1f1f5-1f1f9","🇵🇸":"1f1f5-1f1f8","🇵🇷":"1f1f5-1f1f7","🇵🇳":"1f1f5-1f1f3","🇵🇲":"1f1f5-1f1f2","🇵🇱":"1f1f5-1f1f1","🇵🇰":"1f1f5-1f1f0","🇵🇭":"1f1f5-1f1ed","🇵🇬":"1f1f5-1f1ec","🇵🇫":"1f1f5-1f1eb","🇵🇪":"1f1f5-1f1ea","🇵🇦":"1f1f5-1f1e6","🇴🇲":"1f1f4-1f1f2","🇳🇿":"1f1f3-1f1ff","🇳🇺":"1f1f3-1f1fa","🇳🇷":"1f1f3-1f1f7","🇳🇵":"1f1f3-1f1f5","🇳🇴":"1f1f3-1f1f4","🇳🇱":"1f1f3-1f1f1","🇳🇮":"1f1f3-1f1ee","🇳🇬":"1f1f3-1f1ec","🇳🇫":"1f1f3-1f1eb","🇳🇪":"1f1f3-1f1ea","🇳🇨":"1f1f3-1f1e8","🇳🇦":"1f1f3-1f1e6","🇲🇿":"1f1f2-1f1ff","🇲🇾":"1f1f2-1f1fe","🇲🇽":"1f1f2-1f1fd","🇲🇼":"1f1f2-1f1fc","🇲🇻":"1f1f2-1f1fb","🇲🇺":"1f1f2-1f1fa","🇲🇹":"1f1f2-1f1f9","🇲🇸":"1f1f2-1f1f8","🇲🇷":"1f1f2-1f1f7","🇲🇶":"1f1f2-1f1f6","🇲🇵":"1f1f2-1f1f5","🇲🇴":"1f1f2-1f1f4","🇲🇳":"1f1f2-1f1f3","🇲🇲":"1f1f2-1f1f2","🇲🇱":"1f1f2-1f1f1","🇲🇰":"1f1f2-1f1f0","🇲🇭":"1f1f2-1f1ed","🇲🇬":"1f1f2-1f1ec","🇲🇫":"1f1f2-1f1eb","🇲🇪":"1f1f2-1f1ea","🇲🇩":"1f1f2-1f1e9","🇲🇨":"1f1f2-1f1e8","🇲🇦":"1f1f2-1f1e6","🇱🇾":"1f1f1-1f1fe","🇱🇻":"1f1f1-1f1fb","🇱🇺":"1f1f1-1f1fa","🇱🇹":"1f1f1-1f1f9","🇱🇸":"1f1f1-1f1f8","🇱🇷":"1f1f1-1f1f7","🇱🇰":"1f1f1-1f1f0","🇱🇮":"1f1f1-1f1ee","🇱🇨":"1f1f1-1f1e8","🇱🇧":"1f1f1-1f1e7","🇱🇦":"1f1f1-1f1e6","🇰🇿":"1f1f0-1f1ff","🇰🇾":"1f1f0-1f1fe","🇰🇼":"1f1f0-1f1fc","🇰🇷":"1f1f0-1f1f7","🇰🇵":"1f1f0-1f1f5","🇰🇳":"1f1f0-1f1f3","🇰🇲":"1f1f0-1f1f2","🇰🇮":"1f1f0-1f1ee","🇰🇭":"1f1f0-1f1ed","🇰🇬":"1f1f0-1f1ec","🇰🇪":"1f1f0-1f1ea","🇯🇵":"1f1ef-1f1f5","🇯🇴":"1f1ef-1f1f4","🇯🇲":"1f1ef-1f1f2","🇯🇪":"1f1ef-1f1ea","🇮🇹":"1f1ee-1f1f9","🇮🇸":"1f1ee-1f1f8","🇮🇷":"1f1ee-1f1f7","🇮🇶":"1f1ee-1f1f6","🇮🇴":"1f1ee-1f1f4","🇮🇳":"1f1ee-1f1f3","🇮🇲":"1f1ee-1f1f2","🇮🇱":"1f1ee-1f1f1","🇮🇪":"1f1ee-1f1ea","🇮🇩":"1f1ee-1f1e9","🇮🇨":"1f1ee-1f1e8","🇭🇺":"1f1ed-1f1fa","🇭🇹":"1f1ed-1f1f9","🇭🇷":"1f1ed-1f1f7","🇭🇳":"1f1ed-1f1f3","🇭🇲":"1f1ed-1f1f2","🇭🇰":"1f1ed-1f1f0","🇬🇾":"1f1ec-1f1fe","🇬🇼":"1f1ec-1f1fc","🇬🇺":"1f1ec-1f1fa","🇬🇹":"1f1ec-1f1f9","🇬🇸":"1f1ec-1f1f8","🇬🇷":"1f1ec-1f1f7","🇬🇶":"1f1ec-1f1f6","🇬🇵":"1f1ec-1f1f5","🇬🇳":"1f1ec-1f1f3","🇬🇲":"1f1ec-1f1f2","🇬🇱":"1f1ec-1f1f1","🇬🇮":"1f1ec-1f1ee","🇬🇭":"1f1ec-1f1ed","🇬🇬":"1f1ec-1f1ec","🇬🇫":"1f1ec-1f1eb","🇬🇪":"1f1ec-1f1ea","🇬🇩":"1f1ec-1f1e9","🇬🇧":"1f1ec-1f1e7","🇬🇦":"1f1ec-1f1e6","🇫🇷":"1f1eb-1f1f7","🇫🇴":"1f1eb-1f1f4","🇫🇲":"1f1eb-1f1f2","🇫🇰":"1f1eb-1f1f0","🇫🇯":"1f1eb-1f1ef","🇫🇮":"1f1eb-1f1ee","🇪🇺":"1f1ea-1f1fa","🇪🇹":"1f1ea-1f1f9","🇪🇸":"1f1ea-1f1f8","🇪🇷":"1f1ea-1f1f7","🇪🇭":"1f1ea-1f1ed","🇪🇬":"1f1ea-1f1ec","🇪🇪":"1f1ea-1f1ea","🇪🇨":"1f1ea-1f1e8","🇪🇦":"1f1ea-1f1e6","🇩🇿":"1f1e9-1f1ff","🇩🇴":"1f1e9-1f1f4","🇩🇲":"1f1e9-1f1f2","🇩🇰":"1f1e9-1f1f0","🇩🇯":"1f1e9-1f1ef","🇩🇬":"1f1e9-1f1ec","🇩🇪":"1f1e9-1f1ea","🇨🇿":"1f1e8-1f1ff","🇨🇾":"1f1e8-1f1fe","🇨🇽":"1f1e8-1f1fd","🇨🇼":"1f1e8-1f1fc","🇨🇻":"1f1e8-1f1fb","🇨🇺":"1f1e8-1f1fa","🇨🇷":"1f1e8-1f1f7","🇨🇵":"1f1e8-1f1f5","🇨🇴":"1f1e8-1f1f4","🇨🇳":"1f1e8-1f1f3","🇨🇲":"1f1e8-1f1f2","🇨🇱":"1f1e8-1f1f1","🇨🇰":"1f1e8-1f1f0","🇨🇮":"1f1e8-1f1ee","🇨🇭":"1f1e8-1f1ed","🇨🇬":"1f1e8-1f1ec","🇨🇫":"1f1e8-1f1eb","🇨🇩":"1f1e8-1f1e9","🇨🇨":"1f1e8-1f1e8","🇨🇦":"1f1e8-1f1e6","🇧🇿":"1f1e7-1f1ff","🇧🇾":"1f1e7-1f1fe","🇧🇼":"1f1e7-1f1fc","🇧🇻":"1f1e7-1f1fb","🇧🇹":"1f1e7-1f1f9","🇧🇸":"1f1e7-1f1f8","🇧🇷":"1f1e7-1f1f7","🇧🇶":"1f1e7-1f1f6","🇧🇴":"1f1e7-1f1f4","🇧🇳":"1f1e7-1f1f3","🇧🇲":"1f1e7-1f1f2","🇧🇱":"1f1e7-1f1f1","🇧🇯":"1f1e7-1f1ef","🇧🇮":"1f1e7-1f1ee","🇧🇭":"1f1e7-1f1ed","🇧🇬":"1f1e7-1f1ec","🇧🇫":"1f1e7-1f1eb","🇧🇪":"1f1e7-1f1ea","🇧🇩":"1f1e7-1f1e9","🇧🇧":"1f1e7-1f1e7","🇧🇦":"1f1e7-1f1e6","🇦🇿":"1f1e6-1f1ff","🇦🇽":"1f1e6-1f1fd","🇦🇼":"1f1e6-1f1fc","🇦🇺":"1f1e6-1f1fa","🇦🇹":"1f1e6-1f1f9","🇦🇸":"1f1e6-1f1f8","🇦🇷":"1f1e6-1f1f7","🇦🇶":"1f1e6-1f1f6","🇦🇴":"1f1e6-1f1f4","🇦🇲":"1f1e6-1f1f2","🇦🇱":"1f1e6-1f1f1","🇦🇮":"1f1e6-1f1ee","🇦🇬":"1f1e6-1f1ec","🇦🇫":"1f1e6-1f1eb","🇦🇪":"1f1e6-1f1ea","🇦🇩":"1f1e6-1f1e9","🇦🇨":"1f1e6-1f1e8","🀄️":"1f004","🅿️":"1f17f","🈂️":"1f202","🈚️":"1f21a","🈯️":"1f22f","🈷️":"1f237","🎞️":"1f39e","🎟️":"1f39f","🏋️":"1f3cb","🏌️":"1f3cc","🏍️":"1f3cd","🏎️":"1f3ce","🎖️":"1f396","🎗️":"1f397","🌶️":"1f336","🌧️":"1f327","🌨️":"1f328","🌩️":"1f329","🌪️":"1f32a","🌫️":"1f32b","🌬️":"1f32c","🐿️":"1f43f","🕷️":"1f577","🕸️":"1f578","🌡️":"1f321","🎙️":"1f399","🎚️":"1f39a","🎛️":"1f39b","🏳️":"1f3f3","🏵️":"1f3f5","🏷️":"1f3f7","📽️":"1f4fd","🕉️":"1f549","🕊️":"1f54a","🕯️":"1f56f","🕰️":"1f570","🕳️":"1f573","🕶️":"1f576","🕹️":"1f579","🖇️":"1f587","🖊️":"1f58a","🖋️":"1f58b","🖌️":"1f58c","🖍️":"1f58d","🖥️":"1f5a5","🖨️":"1f5a8","🖲️":"1f5b2","🖼️":"1f5bc","🗂️":"1f5c2","🗃️":"1f5c3","🗄️":"1f5c4","🗑️":"1f5d1","🗒️":"1f5d2","🗓️":"1f5d3","🗜️":"1f5dc","🗝️":"1f5dd","🗞️":"1f5de","🗡️":"1f5e1","🗣️":"1f5e3","🗯️":"1f5ef","🗳️":"1f5f3","🗺️":"1f5fa","🛠️":"1f6e0","🛡️":"1f6e1","🛢️":"1f6e2","🛰️":"1f6f0","🍽️":"1f37d","👁️":"1f441","🕴️":"1f574","🕵️":"1f575","🖐️":"1f590","🏔️":"1f3d4","🏕️":"1f3d5","🏖️":"1f3d6","🏗️":"1f3d7","🏘️":"1f3d8","🏙️":"1f3d9","🏚️":"1f3da","🏛️":"1f3db","🏜️":"1f3dc","🏝️":"1f3dd","🏞️":"1f3de","🏟️":"1f3df","🛋️":"1f6cb","🛍️":"1f6cd","🛎️":"1f6ce","🛏️":"1f6cf","🛣️":"1f6e3","🛤️":"1f6e4","🛥️":"1f6e5","🛩️":"1f6e9","🛳️":"1f6f3","🌤️":"1f324","🌥️":"1f325","🌦️":"1f326","🖱️":"1f5b1","☝🏻":"261d-1f3fb","☝🏼":"261d-1f3fc","☝🏽":"261d-1f3fd","☝🏾":"261d-1f3fe","☝🏿":"261d-1f3ff","✌🏻":"270c-1f3fb","✌🏼":"270c-1f3fc","✌🏽":"270c-1f3fd","✌🏾":"270c-1f3fe","✌🏿":"270c-1f3ff","✊🏻":"270a-1f3fb","✊🏼":"270a-1f3fc","✊🏽":"270a-1f3fd","✊🏾":"270a-1f3fe","✊🏿":"270a-1f3ff","✋🏻":"270b-1f3fb","✋🏼":"270b-1f3fc","✋🏽":"270b-1f3fd","✋🏾":"270b-1f3fe","✋🏿":"270b-1f3ff","✍🏻":"270d-1f3fb","✍🏼":"270d-1f3fc","✍🏽":"270d-1f3fd","✍🏾":"270d-1f3fe","✍🏿":"270d-1f3ff","⛹🏻":"26f9-1f3fb","⛹🏼":"26f9-1f3fc","⛹🏽":"26f9-1f3fd","⛹🏾":"26f9-1f3fe","⛹🏿":"26f9-1f3ff","©️":"00a9","®️":"00ae","‼️":"203c","⁉️":"2049","™️":"2122","ℹ️":"2139","↔️":"2194","↕️":"2195","↖️":"2196","↗️":"2197","↘️":"2198","↙️":"2199","↩️":"21a9","↪️":"21aa","⌚️":"231a","⌛️":"231b","Ⓜ️":"24c2","▪️":"25aa","▫️":"25ab","▶️":"25b6","◀️":"25c0","◻️":"25fb","◼️":"25fc","◽️":"25fd","◾️":"25fe","☀️":"2600","☁️":"2601","☎️":"260e","☑️":"2611","☔️":"2614","☕️":"2615","☝️":"261d","☺️":"263a","♈️":"2648","♉️":"2649","♊️":"264a","♋️":"264b","♌️":"264c","♍️":"264d","♎️":"264e","♏️":"264f","♐️":"2650","♑️":"2651","♒️":"2652","♓️":"2653","♠️":"2660","♣️":"2663","♥️":"2665","♦️":"2666","♨️":"2668","♻️":"267b","♿️":"267f","⚓️":"2693","⚠️":"26a0","⚡️":"26a1","⚪️":"26aa","⚫️":"26ab","⚽️":"26bd","⚾️":"26be","⛄️":"26c4","⛅️":"26c5","⛔️":"26d4","⛪️":"26ea","⛲️":"26f2","⛳️":"26f3","⛵️":"26f5","⛺️":"26fa","⛽️":"26fd","✂️":"2702","✈️":"2708","✉️":"2709","✌️":"270c","✏️":"270f","✒️":"2712","✔️":"2714","✖️":"2716","✳️":"2733","✴️":"2734","❄️":"2744","❇️":"2747","❗️":"2757","❤️":"2764","➡️":"27a1","⤴️":"2934","⤵️":"2935","⬅️":"2b05","⬆️":"2b06","⬇️":"2b07","⬛️":"2b1b","⬜️":"2b1c","⭐️":"2b50","⭕️":"2b55","〰️":"3030","〽️":"303d","㊗️":"3297","㊙️":"3299","✝️":"271d","⌨️":"2328","✍️":"270d","⏭️":"23ed","⏮️":"23ee","⏯️":"23ef","⏱️":"23f1","⏲️":"23f2","⏸️":"23f8","⏹️":"23f9","⏺️":"23fa","☂️":"2602","☃️":"2603","☄️":"2604","☘️":"2618","☠️":"2620","☢️":"2622","☣️":"2623","☦️":"2626","☪️":"262a","☮️":"262e","☯️":"262f","☸️":"2638","☹️":"2639","⚒️":"2692","⚔️":"2694","⚖️":"2696","⚗️":"2697","⚙️":"2699","⚛️":"269b","⚜️":"269c","⚰️":"26b0","⚱️":"26b1","⛈️":"26c8","⛏️":"26cf","⛑️":"26d1","⛓️":"26d3","⛩️":"26e9","⛰️":"26f0","⛱️":"26f1","⛴️":"26f4","⛷️":"26f7","⛸️":"26f8","⛹️":"26f9","✡️":"2721","❣️":"2763","🃏":"1f0cf","🅰":"1f170","🅱":"1f171","🅾":"1f17e","🆎":"1f18e","🆑":"1f191","🆒":"1f192","🆓":"1f193","🆔":"1f194","🆕":"1f195","🆖":"1f196","🆗":"1f197","🆘":"1f198","🆙":"1f199","🆚":"1f19a","🈁":"1f201","🈲":"1f232","🈳":"1f233","🈴":"1f234","🈵":"1f235","🈶":"1f236","🈸":"1f238","🈹":"1f239","🈺":"1f23a","🉐":"1f250","🉑":"1f251","🌀":"1f300","🌁":"1f301","🌂":"1f302","🌃":"1f303","🌄":"1f304","🌅":"1f305","🌆":"1f306","🌇":"1f307","🌈":"1f308","🌉":"1f309","🌊":"1f30a","🌋":"1f30b","🌌":"1f30c","🌏":"1f30f","🌑":"1f311","🌓":"1f313","🌔":"1f314","🌕":"1f315","🌙":"1f319","🌛":"1f31b","🌟":"1f31f","🌠":"1f320","🌰":"1f330","🌱":"1f331","🌴":"1f334","🌵":"1f335","🌷":"1f337","🌸":"1f338","🌹":"1f339","🌺":"1f33a","🌻":"1f33b","🌼":"1f33c","🌽":"1f33d","🌾":"1f33e","🌿":"1f33f","🍀":"1f340","🍁":"1f341","🍂":"1f342","🍃":"1f343","🍄":"1f344","🍅":"1f345","🍆":"1f346","🍇":"1f347","🍈":"1f348","🍉":"1f349","🍊":"1f34a","🍌":"1f34c","🍍":"1f34d","🍎":"1f34e","🍏":"1f34f","🍑":"1f351","🍒":"1f352","🍓":"1f353","🍔":"1f354","🍕":"1f355","🍖":"1f356","🍗":"1f357","🍘":"1f358","🍙":"1f359","🍚":"1f35a","🍛":"1f35b","🍜":"1f35c","🍝":"1f35d","🍞":"1f35e","🍟":"1f35f","🍠":"1f360","🍡":"1f361","🍢":"1f362","🍣":"1f363","🍤":"1f364","🍥":"1f365","🍦":"1f366","🍧":"1f367","🍨":"1f368","🍩":"1f369","🍪":"1f36a","🍫":"1f36b","🍬":"1f36c","🍭":"1f36d","🍮":"1f36e","🍯":"1f36f","🍰":"1f370","🍱":"1f371","🍲":"1f372","🍳":"1f373","🍴":"1f374","🍵":"1f375","🍶":"1f376","🍷":"1f377","🍸":"1f378","🍹":"1f379","🍺":"1f37a","🍻":"1f37b","🎀":"1f380","🎁":"1f381","🎂":"1f382","🎃":"1f383","🎄":"1f384","🎅":"1f385","🎆":"1f386","🎇":"1f387","🎈":"1f388","🎉":"1f389","🎊":"1f38a","🎋":"1f38b","🎌":"1f38c","🎍":"1f38d","🎎":"1f38e","🎏":"1f38f","🎐":"1f390","🎑":"1f391","🎒":"1f392","🎓":"1f393","🎠":"1f3a0","🎡":"1f3a1","🎢":"1f3a2","🎣":"1f3a3","🎤":"1f3a4","🎥":"1f3a5","🎦":"1f3a6","🎧":"1f3a7","🎨":"1f3a8","🎩":"1f3a9","🎪":"1f3aa","🎫":"1f3ab","🎬":"1f3ac","🎭":"1f3ad","🎮":"1f3ae","🎯":"1f3af","🎰":"1f3b0","🎱":"1f3b1","🎲":"1f3b2","🎳":"1f3b3","🎴":"1f3b4","🎵":"1f3b5","🎶":"1f3b6","🎷":"1f3b7","🎸":"1f3b8","🎹":"1f3b9","🎺":"1f3ba","🎻":"1f3bb","🎼":"1f3bc","🎽":"1f3bd","🎾":"1f3be","🎿":"1f3bf","🏀":"1f3c0","🏁":"1f3c1","🏂":"1f3c2","🏃":"1f3c3","🏄":"1f3c4","🏆":"1f3c6","🏈":"1f3c8","🏊":"1f3ca","🏠":"1f3e0","🏡":"1f3e1","🏢":"1f3e2","🏣":"1f3e3","🏥":"1f3e5","🏦":"1f3e6","🏧":"1f3e7","🏨":"1f3e8","🏩":"1f3e9","🏪":"1f3ea","🏫":"1f3eb","🏬":"1f3ec","🏭":"1f3ed","🏮":"1f3ee","🏯":"1f3ef","🏰":"1f3f0","🐌":"1f40c","🐍":"1f40d","🐎":"1f40e","🐑":"1f411","🐒":"1f412","🐔":"1f414","🐗":"1f417","🐘":"1f418","🐙":"1f419","🐚":"1f41a","🐛":"1f41b","🐜":"1f41c","🐝":"1f41d","🐞":"1f41e","🐟":"1f41f","🐠":"1f420","🐡":"1f421","🐢":"1f422","🐣":"1f423","🐤":"1f424","🐥":"1f425","🐦":"1f426","🐧":"1f427","🐨":"1f428","🐩":"1f429","🐫":"1f42b","🐬":"1f42c","🐭":"1f42d","🐮":"1f42e","🐯":"1f42f","🐰":"1f430","🐱":"1f431","🐲":"1f432","🐳":"1f433","🐴":"1f434","🐵":"1f435","🐶":"1f436","🐷":"1f437","🐸":"1f438","🐹":"1f439","🐺":"1f43a","🐻":"1f43b","🐼":"1f43c","🐽":"1f43d","🐾":"1f43e","👀":"1f440","👂":"1f442","👃":"1f443","👄":"1f444","👅":"1f445","👆":"1f446","👇":"1f447","👈":"1f448","👉":"1f449","👊":"1f44a","👋":"1f44b","👌":"1f44c","👍":"1f44d","👎":"1f44e","👏":"1f44f","👐":"1f450","👑":"1f451","👒":"1f452","👓":"1f453","👔":"1f454","👕":"1f455","👖":"1f456","👗":"1f457","👘":"1f458","👙":"1f459","👚":"1f45a","👛":"1f45b","👜":"1f45c","👝":"1f45d","👞":"1f45e","👟":"1f45f","👠":"1f460","👡":"1f461","👢":"1f462","👣":"1f463","👤":"1f464","👦":"1f466","👧":"1f467","👨":"1f468","👩":"1f469","👪":"1f46a","👫":"1f46b","👮":"1f46e","👯":"1f46f","👰":"1f470","👱":"1f471","👲":"1f472","👳":"1f473","👴":"1f474","👵":"1f475","👶":"1f476","👷":"1f477","👸":"1f478","👹":"1f479","👺":"1f47a","👻":"1f47b","👼":"1f47c","👽":"1f47d","👾":"1f47e","👿":"1f47f","💀":"1f480","📇":"1f4c7","💁":"1f481","💂":"1f482","💃":"1f483","💄":"1f484","💅":"1f485","📒":"1f4d2","💆":"1f486","📓":"1f4d3","💇":"1f487","📔":"1f4d4","💈":"1f488","📕":"1f4d5","💉":"1f489","📖":"1f4d6","💊":"1f48a","📗":"1f4d7","💋":"1f48b","📘":"1f4d8","💌":"1f48c","📙":"1f4d9","💍":"1f48d","📚":"1f4da","💎":"1f48e","📛":"1f4db","💏":"1f48f","📜":"1f4dc","💐":"1f490","📝":"1f4dd","💑":"1f491","📞":"1f4de","💒":"1f492","📟":"1f4df","📠":"1f4e0","💓":"1f493","📡":"1f4e1","📢":"1f4e2","💔":"1f494","📣":"1f4e3","📤":"1f4e4","💕":"1f495","📥":"1f4e5","📦":"1f4e6","💖":"1f496","📧":"1f4e7","📨":"1f4e8","💗":"1f497","📩":"1f4e9","📪":"1f4ea","💘":"1f498","📫":"1f4eb","📮":"1f4ee","💙":"1f499","📰":"1f4f0","📱":"1f4f1","💚":"1f49a","📲":"1f4f2","📳":"1f4f3","💛":"1f49b","📴":"1f4f4","📶":"1f4f6","💜":"1f49c","📷":"1f4f7","📹":"1f4f9","💝":"1f49d","📺":"1f4fa","📻":"1f4fb","💞":"1f49e","📼":"1f4fc","🔃":"1f503","💟":"1f49f","🔊":"1f50a","🔋":"1f50b","💠":"1f4a0","🔌":"1f50c","🔍":"1f50d","💡":"1f4a1","🔎":"1f50e","🔏":"1f50f","💢":"1f4a2","🔐":"1f510","🔑":"1f511","💣":"1f4a3","🔒":"1f512","🔓":"1f513","💤":"1f4a4","🔔":"1f514","🔖":"1f516","💥":"1f4a5","🔗":"1f517","🔘":"1f518","💦":"1f4a6","🔙":"1f519","🔚":"1f51a","💧":"1f4a7","🔛":"1f51b","🔜":"1f51c","💨":"1f4a8","🔝":"1f51d","🔞":"1f51e","💩":"1f4a9","🔟":"1f51f","💪":"1f4aa","🔠":"1f520","🔡":"1f521","💫":"1f4ab","🔢":"1f522","🔣":"1f523","💬":"1f4ac","🔤":"1f524","🔥":"1f525","💮":"1f4ae","🔦":"1f526","🔧":"1f527","💯":"1f4af","🔨":"1f528","🔩":"1f529","💰":"1f4b0","🔪":"1f52a","🔫":"1f52b","💱":"1f4b1","🔮":"1f52e","💲":"1f4b2","🔯":"1f52f","💳":"1f4b3","🔰":"1f530","🔱":"1f531","💴":"1f4b4","🔲":"1f532","🔳":"1f533","💵":"1f4b5","🔴":"1f534","🔵":"1f535","💸":"1f4b8","🔶":"1f536","🔷":"1f537","💹":"1f4b9","🔸":"1f538","🔹":"1f539","💺":"1f4ba","🔺":"1f53a","🔻":"1f53b","💻":"1f4bb","🔼":"1f53c","💼":"1f4bc","🔽":"1f53d","🕐":"1f550","💽":"1f4bd","🕑":"1f551","💾":"1f4be","🕒":"1f552","💿":"1f4bf","🕓":"1f553","📀":"1f4c0","🕔":"1f554","🕕":"1f555","📁":"1f4c1","🕖":"1f556","🕗":"1f557","📂":"1f4c2","🕘":"1f558","🕙":"1f559","📃":"1f4c3","🕚":"1f55a","🕛":"1f55b","📄":"1f4c4","🗻":"1f5fb","🗼":"1f5fc","📅":"1f4c5","🗽":"1f5fd","🗾":"1f5fe","📆":"1f4c6","🗿":"1f5ff","😁":"1f601","😂":"1f602","😃":"1f603","📈":"1f4c8","😄":"1f604","😅":"1f605","📉":"1f4c9","😆":"1f606","😉":"1f609","📊":"1f4ca","😊":"1f60a","😋":"1f60b","📋":"1f4cb","😌":"1f60c","😍":"1f60d","📌":"1f4cc","😏":"1f60f","😒":"1f612","📍":"1f4cd","😓":"1f613","😔":"1f614","📎":"1f4ce","😖":"1f616","😘":"1f618","📏":"1f4cf","😚":"1f61a","😜":"1f61c","📐":"1f4d0","😝":"1f61d","😞":"1f61e","📑":"1f4d1","😠":"1f620","😡":"1f621","😢":"1f622","😣":"1f623","😤":"1f624","😥":"1f625","😨":"1f628","😩":"1f629","😪":"1f62a","😫":"1f62b","😭":"1f62d","😰":"1f630","😱":"1f631","😲":"1f632","😳":"1f633","😵":"1f635","😷":"1f637","😸":"1f638","😹":"1f639","😺":"1f63a","😻":"1f63b","😼":"1f63c","😽":"1f63d","😾":"1f63e","😿":"1f63f","🙀":"1f640","🙅":"1f645","🙆":"1f646","🙇":"1f647","🙈":"1f648","🙉":"1f649","🙊":"1f64a","🙋":"1f64b","🙌":"1f64c","🙍":"1f64d","🙎":"1f64e","🙏":"1f64f","🚀":"1f680","🚃":"1f683","🚄":"1f684","🚅":"1f685","🚇":"1f687","🚉":"1f689","🚌":"1f68c","🚏":"1f68f","🚑":"1f691","🚒":"1f692","🚓":"1f693","🚕":"1f695","🚗":"1f697","🚙":"1f699","🚚":"1f69a","🚢":"1f6a2","🚤":"1f6a4","🚥":"1f6a5","🚧":"1f6a7","🚨":"1f6a8","🚩":"1f6a9","🚪":"1f6aa","🚫":"1f6ab","🚬":"1f6ac","🚭":"1f6ad","🚲":"1f6b2","🚶":"1f6b6","🚹":"1f6b9","🚺":"1f6ba","🚻":"1f6bb","🚼":"1f6bc","🚽":"1f6bd","🚾":"1f6be","🛀":"1f6c0","🤘":"1f918","😀":"1f600","😇":"1f607","😈":"1f608","😎":"1f60e","😐":"1f610","😑":"1f611","😕":"1f615","😗":"1f617","😙":"1f619","😛":"1f61b","😟":"1f61f","😦":"1f626","😧":"1f627","😬":"1f62c","😮":"1f62e","😯":"1f62f","😴":"1f634","😶":"1f636","🚁":"1f681","🚂":"1f682","🚆":"1f686","🚈":"1f688","🚊":"1f68a","🚍":"1f68d","🚎":"1f68e","🚐":"1f690","🚔":"1f694","🚖":"1f696","🚘":"1f698","🚛":"1f69b","🚜":"1f69c","🚝":"1f69d","🚞":"1f69e","🚟":"1f69f","🚠":"1f6a0","🚡":"1f6a1","🚣":"1f6a3","🚦":"1f6a6","🚮":"1f6ae","🚯":"1f6af","🚰":"1f6b0","🚱":"1f6b1","🚳":"1f6b3","🚴":"1f6b4","🚵":"1f6b5","🚷":"1f6b7","🚸":"1f6b8","🚿":"1f6bf","🛁":"1f6c1","🛂":"1f6c2","🛃":"1f6c3","🛄":"1f6c4","🛅":"1f6c5","🌍":"1f30d","🌎":"1f30e","🌐":"1f310","🌒":"1f312","🌖":"1f316","🌗":"1f317","🌘":"1f318","🌚":"1f31a","🌜":"1f31c","🌝":"1f31d","🌞":"1f31e","🌲":"1f332","🌳":"1f333","🍋":"1f34b","🍐":"1f350","🍼":"1f37c","🏇":"1f3c7","🏉":"1f3c9","🏤":"1f3e4","🐀":"1f400","🐁":"1f401","🐂":"1f402","🐃":"1f403","🐄":"1f404","🐅":"1f405","🐆":"1f406","🐇":"1f407","🐈":"1f408","🐉":"1f409","🐊":"1f40a","🐋":"1f40b","🐏":"1f40f","🐐":"1f410","🐓":"1f413","🐕":"1f415","🐖":"1f416","🐪":"1f42a","👥":"1f465","👬":"1f46c","👭":"1f46d","💭":"1f4ad","💶":"1f4b6","💷":"1f4b7","📬":"1f4ec","📭":"1f4ed","📯":"1f4ef","📵":"1f4f5","🔀":"1f500","🔁":"1f501","🔂":"1f502","🔄":"1f504","🔅":"1f505","🔆":"1f506","🔇":"1f507","🔉":"1f509","🔕":"1f515","🔬":"1f52c","🔭":"1f52d","🕜":"1f55c","🕝":"1f55d","🕞":"1f55e","🕟":"1f55f","🕠":"1f560","🕡":"1f561","🕢":"1f562","🕣":"1f563","🕤":"1f564","🕥":"1f565","🕦":"1f566","🕧":"1f567","🔈":"1f508","🚋":"1f68b","🏅":"1f3c5","🏴":"1f3f4","📸":"1f4f8","🛌":"1f6cc","🖕":"1f595","🖖":"1f596","🙁":"1f641","🙂":"1f642","🛫":"1f6eb","🛬":"1f6ec","🏻":"1f3fb","🏼":"1f3fc","🏽":"1f3fd","🏾":"1f3fe","🏿":"1f3ff","🙃":"1f643","🤑":"1f911","🤓":"1f913","🤗":"1f917","🙄":"1f644","🤔":"1f914","🤐":"1f910","🤒":"1f912","🤕":"1f915","🤖":"1f916","🦁":"1f981","🦄":"1f984","🦂":"1f982","🦀":"1f980","🦃":"1f983","🧀":"1f9c0","🌭":"1f32d","🌮":"1f32e","🌯":"1f32f","🍿":"1f37f","🍾":"1f37e","🏹":"1f3f9","🏺":"1f3fa","🛐":"1f6d0","🕋":"1f54b","🕌":"1f54c","🕍":"1f54d","🕎":"1f54e","📿":"1f4ff","🏏":"1f3cf","🏐":"1f3d0","🏑":"1f3d1","🏒":"1f3d2","🏓":"1f3d3","🏸":"1f3f8","⏩":"23e9","⏪":"23ea","⏫":"23eb","⏬":"23ec","⏰":"23f0","⏳":"23f3","⛎":"26ce","✅":"2705","✊":"270a","✋":"270b","✨":"2728","❌":"274c","❎":"274e","❓":"2753","❔":"2754","❕":"2755","➕":"2795","➖":"2796","➗":"2797","➰":"27b0","➿":"27bf","©":"00a9","®":"00ae","‼":"203c","⁉":"2049","™":"2122","ℹ":"2139","↔":"2194","↕":"2195","↖":"2196","↗":"2197","↘":"2198","↙":"2199","↩":"21a9","↪":"21aa","⌚":"231a","⌛":"231b","Ⓜ":"24c2","▪":"25aa","▫":"25ab","▶":"25b6","◀":"25c0","◻":"25fb","◼":"25fc","◽":"25fd","◾":"25fe","☀":"2600","☁":"2601","☎":"260e","☑":"2611","☔":"2614","☕":"2615","☝":"261d","☺":"263a","♈":"2648","♉":"2649","♊":"264a","♋":"264b","♌":"264c","♍":"264d","♎":"264e","♏":"264f","♐":"2650","♑":"2651","♒":"2652","♓":"2653","♠":"2660","♣":"2663","♥":"2665","♦":"2666","♨":"2668","♻":"267b","♿":"267f","⚓":"2693","⚠":"26a0","⚡":"26a1","⚪":"26aa","⚫":"26ab","⚽":"26bd","⚾":"26be","⛄":"26c4","⛅":"26c5","⛔":"26d4","⛪":"26ea","⛲":"26f2","⛳":"26f3","⛵":"26f5","⛺":"26fa","⛽":"26fd","✂":"2702","✈":"2708","✉":"2709","✌":"270c","✏":"270f","✒":"2712","✔":"2714","✖":"2716","✳":"2733","✴":"2734","❄":"2744","❇":"2747","❗":"2757","❤":"2764","➡":"27a1","⤴":"2934","⤵":"2935","⬅":"2b05","⬆":"2b06","⬇":"2b07","⬛":"2b1b","⬜":"2b1c","⭐":"2b50","⭕":"2b55","〰":"3030","〽":"303d","㊗":"3297","㊙":"3299","🀄":"1f004","🅿":"1f17f","🈂":"1f202","🈚":"1f21a","🈯":"1f22f","🈷":"1f237","🎞":"1f39e","🎟":"1f39f","🏋":"1f3cb","🏌":"1f3cc","🏍":"1f3cd","🏎":"1f3ce","🎖":"1f396","🎗":"1f397","🌶":"1f336","🌧":"1f327","🌨":"1f328","🌩":"1f329","🌪":"1f32a","🌫":"1f32b","🌬":"1f32c","🐿":"1f43f","🕷":"1f577","🕸":"1f578","🌡":"1f321","🎙":"1f399","🎚":"1f39a","🎛":"1f39b","🏳":"1f3f3","🏵":"1f3f5","🏷":"1f3f7","📽":"1f4fd","✝":"271d","🕉":"1f549","🕊":"1f54a","🕯":"1f56f","🕰":"1f570","🕳":"1f573","🕶":"1f576","🕹":"1f579","🖇":"1f587","🖊":"1f58a","🖋":"1f58b","🖌":"1f58c","🖍":"1f58d","🖥":"1f5a5","🖨":"1f5a8","⌨":"2328","🖲":"1f5b2","🖼":"1f5bc","🗂":"1f5c2","🗃":"1f5c3","🗄":"1f5c4","🗑":"1f5d1","🗒":"1f5d2","🗓":"1f5d3","🗜":"1f5dc","🗝":"1f5dd","🗞":"1f5de","🗡":"1f5e1","🗣":"1f5e3","🗯":"1f5ef","🗳":"1f5f3","🗺":"1f5fa","🛠":"1f6e0","🛡":"1f6e1","🛢":"1f6e2","🛰":"1f6f0","🍽":"1f37d","👁":"1f441","🕴":"1f574","🕵":"1f575","✍":"270d","🖐":"1f590","🏔":"1f3d4","🏕":"1f3d5","🏖":"1f3d6","🏗":"1f3d7","🏘":"1f3d8","🏙":"1f3d9","🏚":"1f3da","🏛":"1f3db","🏜":"1f3dc","🏝":"1f3dd","🏞":"1f3de","🏟":"1f3df","🛋":"1f6cb","🛍":"1f6cd","🛎":"1f6ce","🛏":"1f6cf","🛣":"1f6e3","🛤":"1f6e4","🛥":"1f6e5","🛩":"1f6e9","🛳":"1f6f3","⏭":"23ed","⏮":"23ee","⏯":"23ef","⏱":"23f1","⏲":"23f2","⏸":"23f8","⏹":"23f9","⏺":"23fa","☂":"2602","☃":"2603","☄":"2604","☘":"2618","☠":"2620","☢":"2622","☣":"2623","☦":"2626","☪":"262a","☮":"262e","☯":"262f","☸":"2638","☹":"2639","⚒":"2692","⚔":"2694","⚖":"2696","⚗":"2697","⚙":"2699","⚛":"269b","⚜":"269c","⚰":"26b0","⚱":"26b1","⛈":"26c8","⛏":"26cf","⛑":"26d1","⛓":"26d3","⛩":"26e9","⛰":"26f0","⛱":"26f1","⛴":"26f4","⛷":"26f7","⛸":"26f8","⛹":"26f9","✡":"2721","❣":"2763","🌤":"1f324","🌥":"1f325","🌦":"1f326","🖱":"1f5b1"},a.imagePathPNG="//cdn.jsdelivr.net/emojione/assets/png/",a.imagePathSVG="//cdn.jsdelivr.net/emojione/assets/svg/",a.imagePathSVGSprites="./../assets/sprites/emojione.sprites.svg",a.imageType="png",a.sprites=!1,a.unicodeAlt=!0,a.ascii=!1,a.cacheBustParam="?v=2.1.3",a.regShortNames=new RegExp("<object[^>]*>.*?</object>|<span[^>]*>.*?</span>|<(?:object|embed|svg|img|div|span|p|a)[^>]*>|("+a.shortnames+")","gi"),a.regAscii=new RegExp("<object[^>]*>.*?</object>|<span[^>]*>.*?</span>|<(?:object|embed|svg|img|div|span|p|a)[^>]*>|((\\s|^)"+a.asciiRegexp+"(?=\\s|$|[!,.?]))","g"),a.regUnicode=new RegExp("<object[^>]*>.*?</object>|<span[^>]*>.*?</span>|<(?:object|embed|svg|img|div|span|p|a)[^>]*>|("+a.unicodeRegexp+")","gi"),a.toImage=function(b){return b=a.unicodeToImage(b),b=a.shortnameToImage(b)},a.unifyUnicode=function(b){return b=a.toShort(b),b=a.shortnameToUnicode(b)},a.shortnameToAscii=function(b){var c,d=a.objectFlip(a.asciiList);return b=b.replace(a.regShortNames,function(b){return"undefined"!=typeof b&&""!==b&&b in a.emojioneList?(c=a.emojioneList[b].unicode[a.emojioneList[b].unicode.length-1],"undefined"!=typeof d[c]?d[c]:b):b})},a.shortnameToUnicode=function(b){var c;return b=b.replace(a.regShortNames,function(b){return"undefined"!=typeof b&&""!==b&&b in a.emojioneList?(c=a.emojioneList[b].unicode[0].toUpperCase(),a.convert(c)):b}),a.ascii&&(b=b.replace(a.regAscii,function(b,d,e,f){return"undefined"!=typeof f&&""!==f&&a.unescapeHTML(f)in a.asciiList?(f=a.unescapeHTML(f),c=a.asciiList[f].toUpperCase(),e+a.convert(c)):b})),b},a.shortnameToImage=function(b){var c,d,e;return b=b.replace(a.regShortNames,function(b){return"undefined"!=typeof b&&""!==b&&b in a.emojioneList?(d=a.emojioneList[b].unicode[a.emojioneList[b].unicode.length-1],e=a.unicodeAlt?a.convert(d.toUpperCase()):b,c="png"===a.imageType?a.sprites?'<span class="emojione emojione-'+d+'" title="'+b+'">'+e+"</span>":'<img class="emojione" alt="'+e+'" src="'+a.imagePathPNG+d+".png"+a.cacheBustParam+'"/>':a.sprites?'<svg class="emojione"><description>'+e+'</description><use xlink:href="'+a.imagePathSVGSprites+"#emoji-"+d+'"></use></svg>':'<object class="emojione" data="'+a.imagePathSVG+d+".svg"+a.cacheBustParam+'" type="image/svg+xml" standby="'+e+'">'+e+"</object>"):b}),a.ascii&&(b=b.replace(a.regAscii,function(b,f,g,h){return"undefined"!=typeof h&&""!==h&&a.unescapeHTML(h)in a.asciiList?(h=a.unescapeHTML(h),d=a.asciiList[h],e=a.unicodeAlt?a.convert(d.toUpperCase()):a.escapeHTML(h),c="png"===a.imageType?a.sprites?g+'<span class="emojione emojione-'+d+'" title="'+a.escapeHTML(h)+'">'+e+"</span>":g+'<img class="emojione" alt="'+e+'" src="'+a.imagePathPNG+d+".png"+a.cacheBustParam+'"/>':a.sprites?'<svg class="emojione"><description>'+e+'</description><use xlink:href="'+a.imagePathSVGSprites+"#emoji-"+d+'"></use></svg>':g+'<object class="emojione" data="'+a.imagePathSVG+d+".svg"+a.cacheBustParam+'" type="image/svg+xml" standby="'+e+'">'+e+"</object>"):b})),b},a.unicodeToImage=function(b){var c,d,e;if(!a.unicodeAlt||a.sprites)var f=a.mapUnicodeToShort();return b=b.replace(a.regUnicode,function(b){
    return"undefined"!=typeof b&&""!==b&&b in a.jsEscapeMap?(d=a.jsEscapeMap[b],e=a.unicodeAlt?a.convert(d.toUpperCase()):f[d],c="png"===a.imageType?a.sprites?'<span class="emojione emojione-'+d+'" title="'+f[d]+'">'+e+"</span>":'<img class="emojione" alt="'+e+'" src="'+a.imagePathPNG+d+".png"+a.cacheBustParam+'"/>':a.sprites?'<svg class="emojione"><description>'+e+'</description><use xlink:href="'+a.imagePathSVGSprites+"#emoji-"+d+'"></use></svg>':'<img class="emojione" alt="'+e+'" src="'+a.imagePathSVG+d+".svg"+a.cacheBustParam+'"/>'):b})},a.toShort=function(b){var c=a.getUnicodeReplacementRegEx(),d=a.mapUnicodeCharactersToShort();return a.replaceAll(b,c,d)},a.convert=function(a){if(a.indexOf("-")>-1){for(var b=[],c=a.split("-"),d=0;d<c.length;d++){var e=parseInt(c[d],16);if(e>=65536&&1114111>=e){var f=Math.floor((e-65536)/1024)+55296,g=(e-65536)%1024+56320;e=String.fromCharCode(f)+String.fromCharCode(g)}else e=String.fromCharCode(e);b.push(e)}return b.join("")}var c=parseInt(a,16);if(c>=65536&&1114111>=c){var f=Math.floor((c-65536)/1024)+55296,g=(c-65536)%1024+56320;return String.fromCharCode(f)+String.fromCharCode(g)}return String.fromCharCode(c)},a.escapeHTML=function(a){var b={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"};return a.replace(/[&<>"']/g,function(a){return b[a]})},a.unescapeHTML=function(a){var b={"&amp;":"&","&#38;":"&","&#x26;":"&","&lt;":"<","&#60;":"<","&#x3C;":"<","&gt;":">","&#62;":">","&#x3E;":">","&quot;":'"',"&#34;":'"',"&#x22;":'"',"&apos;":"'","&#39;":"'","&#x27;":"'"};return a.replace(/&(?:amp|#38|#x26|lt|#60|#x3C|gt|#62|#x3E|apos|#39|#x27|quot|#34|#x22);/gi,function(a){return b[a]})},a.mapEmojioneList=function(b){for(var c in a.emojioneList)if(a.emojioneList.hasOwnProperty(c))for(var d=0,e=a.emojioneList[c].unicode.length;e>d;d++){var f=a.emojioneList[c].unicode[d];b(f,c)}},a.mapUnicodeToShort=function(){return a.memMapShortToUnicode||(a.memMapShortToUnicode={},a.mapEmojioneList(function(b,c){a.memMapShortToUnicode[b]=c})),a.memMapShortToUnicode},a.memoizeReplacement=function(){if(!a.unicodeReplacementRegEx||!a.memMapShortToUnicodeCharacters){var b=[];a.memMapShortToUnicodeCharacters={},a.mapEmojioneList(function(c,d){var e=a.convert(c);a.emojioneList[d].isCanonical&&(a.memMapShortToUnicodeCharacters[e]=d),b.push(e)}),a.unicodeReplacementRegEx=b.join("|")}},a.mapUnicodeCharactersToShort=function(){return a.memoizeReplacement(),a.memMapShortToUnicodeCharacters},a.getUnicodeReplacementRegEx=function(){return a.memoizeReplacement(),a.unicodeReplacementRegEx},a.objectFlip=function(a){var b,c={};for(b in a)a.hasOwnProperty(b)&&(c[a[b]]=b);return c},a.escapeRegExp=function(a){return a.replace(/[-[\]{}()*+?.,;:&\\^$#\s]/g,"\\$&")},a.replaceAll=function(b,c,d){var e=a.escapeRegExp(c),f=new RegExp("<object[^>]*>.*?</object>|<span[^>]*>.*?</span>|<(?:object|embed|svg|img|div|span|p|a)[^>]*>|("+e+")","gi"),g=function(a,b){return d[b]||b};return b.replace(f,g)}}(this.emojione=this.emojione||{}),"object"==typeof module&&(module.exports=this.emojione);

    $(".__emoji__").each(function(i, x) {
        x.innerHTML = emojione.toImage(x.innerHTML).replace(/:/g, "");
    });
    /****************************/
}

/**
 * Add listeners
 */

function addListeners() {
    var navWidths = [];

    $('nav').each(function(i, x) {
        x = $(x);
        var totalWidth = 0;
        var c = x.children();
        c.each(function(i, x) {
            $(x).css('position', 'absolute').css('top', '0').css('left', '0');
        });
        for (var j=0; j<c.length; j++) totalWidth += c.eq(j).width();
        navWidths[i] = totalWidth + parseInt(x.css('padding-left')) + parseInt(x.css('padding-right'));
        c.each(function(k, x) {
            $(x).css('position', 'static');
        });
    });


    $('nav').each(function(i, x) {
        x = $(x);
        function adjustMenu() {
            if (x.css('display') != "none" && x.width() < navWidths[i]) {
                x.children('.link-container').css('display', 'block');
                x.children('.separator').css('display', 'none');
            } else {
                x.children('.link-container').css('display', 'inline');
                x.children('.separator').css('display', 'inline');
            }
        }
        $(window).on('resize orientationChanged', adjustMenu);
        adjustMenu();
    });

    // Menus pre-set to first one
    var n = $('nav :first-child :first-child');
    for (var i=n.size()-1; i>=0; ) eval(n.eq(--i).attr("onclick"));

    // If there's a hash, open it
    if (window.location.hash.length > 1) changePage(window.location.hash.replace(/^#/,""));

    $('body').css('opacity', '').css('overflow', '');
}

/**
 * Helper functions
 */

window.changePage = function(name) {
    if (name && name.indexOf('href')<0) {
        var tag = '#' + name.toLowerCase().replace(/%20| /g, '-').replace(/%22|[^a-z0-9\-]]/g, '');
        var query = $(tag);
        if (query.length) {
            query.removeClass('hide');
            query.siblings('.section').addClass('hide');
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
};