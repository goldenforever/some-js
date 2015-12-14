document.addEventListener("DOMContentLoaded", function() {    // set character set    var charset = document.createElement("meta");    charset.setAttribute("charset", "UTF-8");    document.head.insertBefore(charset, document.head.firstChild);    // defines source types    var tagTypes = [        { // 0 = external js            0: "script",            "type": "text/javascript",            "src": ""        },        { // 1 = external css            0: "link",            "rel": "stylesheet",            "type": "text/css",            "href": ""        },        { // 2 = meta tagTypes            0: "meta",            "name": "",            "content": ""        }    ];    // load an array of sources    function loadSources(sources) {        var tagToAdd, args, tagInfo, tagKeys, val, count, prevNode;        for (var i=0; i<sources.length; i++) {            count = 0;            args = sources[i];            tagInfo = tagTypes[args[0]];            tagToAdd = document.createElement(tagInfo[0]);            tagKeys = Object.getOwnPropertyNames(tagInfo);            for (var j=0; j<tagKeys.length; j++) {                if (tagKeys[j] != 0) {                    val = tagInfo[tagKeys[j]];                    tagToAdd[tagKeys[j]] = val ? val : args[1+(count++)];                }            }            prevNode = document.head.firstChild;            for (var j=i; j>0; j--) {                prevNode = prevNode.nextSibling;            }            document.head.insertBefore(tagToAdd, prevNode);        }    }    // Essential sources    loadSources([        [0,'marked.js'],        [0,'https://cdn.jsdelivr.net/jquery/3.0.0-alpha1/jquery.min.js'],        [1,'https://cdn.jsdelivr.net/normalize/3.0.3/normalize.min.css'],        [1,'new.css'],        [2,'viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no']    ]);    // Defer module    window.defer = function(method, str) {        if (eval(str)) return method(); else setTimeout(function() { window.defer(method, str) }, 1);    };    window.defer(function() {        window.defer(function() {            window.onhashchange = changePage(window.location.hash.replace("#",""));            var pageCodeAddress = document.getElementsByTagName("html")[0].getAttribute("md").trim();            $.get(pageCodeAddress, function (data) {                window.markdownCode = data;                loadSources([                    [0,'https://cdn.jsdelivr.net/highlight.js/8.9.1/highlight.min.js'],                    [0,'https://cdn.jsdelivr.net/less/2.5.3/less.min.js'],                    [0,'https://cdn.jsdelivr.net/codemirror/4.5.0/codemirror.min.js'],                    [1,'https://fonts.googleapis.com/css?family=Raleway'],                    [1,'https://fonts.googleapis.com/css?family=Open+Sans:400,700'],                    [1,'https://fonts.googleapis.com/css?family=Inconsolata:400,700'],                    [1,'https://cdn.jsdelivr.net/codemirror/4.5.0/codemirror.css'],                    [1,'https://cdn.jsdelivr.net/fontawesome/4.5.0/css/font-awesome.min.css'],                    [1,'https://cdn.jsdelivr.net/codemirror/4.5.0/theme/neo.css']                ]);                window.markdownHighlighting = false;                // Get Markdown highlighting                window.defer(function() {                    loadSources([                        [0,'https://cdn.jsdelivr.net/codemirror/4.5.0/mode/markdown/markdown.js']                    ]);                    window.markdownHighlighting = true;                }, "typeof CodeMirror !== 'undefined'");                // Loop to retrieve all Markdown sources                window.documents = [];                function findFiles(inp) {                    var regex;                        regex = (/\{(?! )(?:https?:\/\/)?(?:(?:[\da-z\.-]+)\.(?:[a-z\.]{2,6}))?(?:[\/\w\.-]*)*\/?}/g).exec(inp);                    if (regex) {                        if (regex[0].length>2) {                            window.documents.push([regex[0].substring(1,regex[0].length-1),""]);                        }                        findFiles(inp.substring(regex.index + regex[0].length))                    }                }                findFiles(data);                for (var i=0; i<window.documents.length; i++) {                    getFile(window.documents[i][0], i);                }                function getFile(file, index) {                    $.get(file, function(content) {                        window.documents[index][1] = content ? content : " ";                    });                }                window.defer(function() {                    for (var i=0; i<window.documents.length; i++) {                        data = data.replace('{'+window.documents[i][0]+'}', window.documents[i][1]);                    }                    var hash = window.location.hash;                    $('body').html('<div class="container">' + marked(data) + '</div>');                    // Menus pre-set to first one                    $('nav :first-child :first-child').trigger("click");                    // If there's a hash, open it                    if (hash.length > 1) changePage(hash.replace(/^#/,""));                    // If a menu is too long, make inline                    var menus = $('nav'), menu;                    var retrieved = false, breakLengths = [];                    var adjustMenus = function () {                        for (var i = 0; i < menus.length; i++) {                            menu = $(menus[i]);                            if (!retrieved) {                                var total = 0, menuChildren = menu.children();                                for (var j = 0; j < menuChildren.length; j += 2) {                                    total += $(menuChildren[j]).width() + 18;                                }                                breakLengths[i] = total - 18;                            }                            if (menu.height() > 25 || $(menu).width() < breakLengths[i]) {                                $(menu).children().css('display', 'block').css('margin', '0.25rem 0');                                if ($(menu).width() > breakLengths[i]) {                                    $(menu).children().css('display', 'inline').css('text-align', '').css('margin', '');                                    $(menu).css('height', '').css('overflow-y', '');                                }                            }                        }                        retrieved = true;                    };                    adjustMenus();                    // Set listeners to switch back and forth                    $(window).resize(adjustMenus);                    window.defer(function () {                        var date1, date2;                        date1 = new Date();                        $('pre code').each(function (i, block) {                            hljs.highlightBlock(block);                        });                        date2 = new Date();                        //console.log("HLJS: " + (date2.getTime() - date1.getTime()));                    }, "window.hljs");                }, "(function(){for (var i=0;i<window.documents.length;i++) {if (!window.documents[i][1]) return false;} return true;})()");            });        }, "window.marked");    }, "window.jQuery");});