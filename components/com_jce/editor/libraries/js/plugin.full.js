/**
 * Inline development version. Only to be used while developing since it uses document.write to load scripts.
 */

/*jshint smarttabs:true, undef:true, latedef:true, curly:true, bitwise:true, camelcase:true */
/*globals $code */

(function(exports) {
    "use strict";

    var html = "", baseDir = "", s = "";

    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].src;

        if (src.indexOf('/plugin.full.js') != -1) {
            baseDir = src.substring(0, src.lastIndexOf('/'));
        }
    }

    function writeScripts() {
        document.write(html);
    }

    function load(path) { 
        html += '<script type="text/javascript" src="' + baseDir + '/' + path + '"></script>\n';
    }
    
    load('lib/html5.js');
    load('lib/validate.js');
    load('lib/select.js');
    load('lib/tips.js');
    load('lib/colorpicker.js');
    load('lib/plugin.js');

    load('lib/extensions.js');
    load('lib/aggregator.js');
    load('lib/mediaplayer.js');
    load('lib/popups.js');

    writeScripts();
})(this);