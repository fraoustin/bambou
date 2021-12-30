
CodeMirror.defineMode('log4j', function () {
    var keywords = ["INFO", "DEBUG", ]
    keywords = new RegExp("((" + keywords.join(")|(") + "))\\b");
    function tokenBase (stream, state) {
        if(stream.match(new RegExp("((DEBUG))\\b"))) {
            return "comment";
        }
        if(stream.match(new RegExp("((INFO))\\b"))) {
            return "number";
        }
        if(stream.match(new RegExp("((WARNING))\\b"))) {
            return "def";
        }
        if(stream.match(new RegExp("((ERROR))\\b"))) {
            return "keyword";
        }
        if(stream.match(new RegExp("((CRITICAL))\\b"))) {
            return "string";
        }
        stream.next();
    }

    return {
        startState: function () {
            return {tokenize: tokenBase};
        },
        token: function(stream, state) {var style = state.tokenize(stream, state); return style;}
    };
});
CodeMirror.defineMIME("text/plain", "log4j");