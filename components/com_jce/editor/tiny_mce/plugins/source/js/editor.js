// fake tinyMCEPopup
var tinyMCEPopup = {
  init: function() {
    var self = this;

    var win = this.getWin();
    var tinymce = win.tinymce || false;

    self.editor = tinymce ? tinymce.EditorManager.activeEditor : false;
  },
  getLang: function(n, dv) {
    var lang = jQuery.Plugin.getLanguage();
    return jQuery.Plugin.i18n[lang + '.dlg.' + n] || dv;
  },
  getWin : function() {
      return (!window.frameElement && window.dialogArguments) || opener || parent || top;
  },
  getParam : function(n, v) {
      if (this.editor) {
          return this.editor.getParam(n, dv);
      }
  },
  /**
	 * Stores the current editor selection for later restoration. This can be useful since some browsers
	 * looses it's selection if a control element is selected/focused inside the dialogs.
	 *
	 * @method storeSelection
	 */
	storeSelection : function() {
		this.editor.windowManager.bookmark = this.editor.selection.getBookmark(1);
	},

	/**
	 * Restores any stored selection. This can be useful since some browsers
	 * looses it's selection if a control element is selected/focused inside the dialogs.
	 *
	 * @method restoreSelection
	 */
	restoreSelection : function() {
		this.editor.selection.moveToBookmark(this.editor.windowManager.bookmark);
	},
  execCommand : function(cmd, ui, val, a) {
		a = a || {};
		a.skip_focus = 1;

		this.restoreSelection();

		return this.editor.execCommand(cmd, ui, val, a);
	},
  addI18n: function(p, o) {
    var win = this.getWin();

    if (win.tinyMCE) {
        return win.tinyMCE.addI18n(p, o);
    }

    return jQuery.Plugin.addI18n(p, o);
  }
};

tinyMCEPopup.init();

// fake tinyMCE object
var tinyMCE = {
  addI18n: function(p, o) {
    return tinyMCEPopup.addI18n(p, o);
  }
};

(function($) {
    var SourceEditor = {
        options: {
            format: true,
            width: '100%',
            height: '100%',
            theme: 'textmate',
            font_size : '',
            load: function() {
            },
            change: function() {
            },
            fullscreen: false
        },
        init: function(options, content, selection) {
            var self = this;

            $.extend(this.options, options);

            $(document).ready(function() {

              self._createToolbar();

              // format content
              if (self.options.format) {
                  content = self._format(content);
              }

              self._load(content);
            });
        },
        _createToolbar: function() {
            var self = this, o = this.options, doc = document;

            $('.source-editor .ui-navbar button').click(function(e) {
                e.preventDefault();

                var action = $(this).data('action');

                // search
                if (action == 'search' || action == 'search-previous') {
                  var f = $('#source_search_value').val();
                  var prev = !!(action == 'search-previous');

                  self.search(f, prev, $('#source_search_regex').prop('checked'))
                }

                // replace
                if (action == 'replace' || action == 'replace-all') {
                    var f = $('#source_search_value').val();
                    var r = $('#source_replace_value').val();

                    var all = !!(action == 'replace-all');

                    return self.replace(f, r, all, $('#source_search_regex').prop('checked'));
                }

                var fn = self[action] || function() {};

                if ($(this).hasClass('ui-button-checkbox')) {
                  $(this).toggleClass('ui-active');
                }

                fn.call(self, $(this).hasClass('ui-active'));
            }).filter('.ui-button-checkbox').each(function() {
                var action = $(this).data('action');

                if (!!o[action]) {
                    $(this).addClass('ui-active');
                }
            });

            $('.source-editor .ui-navbar button[data-action="fullscreen"]').toggleClass('ui-active', o.fullscreen);

            // clear search if search input emptied
            $('#source_search_value').change(function() {
                if (this.value === "") {
                    self.clearSearch();
                }
            });
        },
        setButtonState: function(button, state) {
          $('.source-editor .ui-navbar button[data-action="' + state + '"]').toggleClass('ui-active', state);
        },
        _format: function(html, validate) {
            if (validate) {
                // parse content
                parser.parse(html);
            }

            // format
            return this.formatHTML(html);
        },
        _load: function(content, selection) {
            var self = this, cm, o = this.options;

            if (window.CodeMirror) {
               if (o.theme == 'codemirror') {
                    o.theme = 'default';
                }

                var settings = {
                    mode: "text/html",
                    theme: o.theme,
                    indentWithTabs: true,
                    smartIndent: true,
                    tabMode: "indent",
                    styleActiveLine: true,
                    highlightSelectionMatches: !!o.selection_match,
                    autoCloseTags: !!o.tag_closing
                };

                cm = CodeMirror($('.source-editor-container').get(0), settings);

                // onchange
                cm.on('change', function() {
                    o.change.call();

                    var history = cm.historySize();

                    $('.source-editor .ui-navbar button[data-action="undo"]').prop('disabled', !history.undo);
                    $('.source-editor .ui-navbar button[data-action="redo"]').prop('disabled', !history.redo);
                });

                // line wrapping
                cm.setWrap = function(s) {
                    cm.setOption('lineWrapping', s);

                    try {
                        cm.focus();
                    } catch (e) {}
                };

                // gutter
                cm.showGutter = function(s) {
                    cm.setOption('lineNumbers', s);

                    try {
                        cm.focus();
                    } catch (e) {}
                };

                // syntax highlighting
                cm.highlight = function(s) {
                    var c = cm.getCursor();

                    if (s) {
                        cm.setOption('mode', 'text/html');
                    } else {
                        cm.setOption('mode', 'text/plain');
                    }

                    cm.setCursor(c);

                    try {
                        cm.focus();
                    } catch (e) {}
                };

                // resize editor
                cm.resize = function(w, h, init) {
                    //var scroller = cm.getScrollerElement();

                    // only if drag resize
                    if (!init) {
                        h = h - self.toolbar.offsetHeight;
                    }
                    cm.setSize(w || null, h);
                };

                cm.showInvisibles = function(s) {
                };

                cm.setContent = function(v) {
                    if (v === '') {
                        v = '\u00a0';
                    }
                    cm.setValue(v);

                    try {
                        cm.focus();
                    } catch (e) {}
                };

                cm.insertContent = function(v) {
                    return cm.replaceSelection(v);
                };

                cm.getContent = function() {
                    return cm.getValue();
                };

                cm.getSearchState = function() {
                    function SearchState() {
                        this.posFrom = this.posTo = this.query = null;
                        this.marked = [];
                    }

                    return cm.state.search || (cm.state.search = new SearchState());
                };

                cm.clearSearch = function() {
                    cm.operation(function() {
                        var state = cm.getSearchState(cm);

                        if (!state.query) {
                            return;
                        }
                        state.query = null;
                        for (var i = 0; i < state.marked.length; ++i) {
                            state.marked[i].clear();
                        }

                        state.marked.length = 0;

                        cm.removeOverlay(state.overlay);
                    });
                };

                cm.search = function(query, rev, re) {
                    // create regex
                    if (re) {
                        query = new RegExp(query);
                    }

                    function searchOverlay(query) {
                        if (typeof query == "string") {
                            return {token: function(stream) {
                                    if (stream.match(query))
                                        return "searching";
                                    stream.next();
                                    stream.skipTo(query.charAt(0)) || stream.skipToEnd();
                                }};
                        }
                        return {token: function(stream) {
                                if (stream.match(query))
                                    return "searching";
                                while (!stream.eol()) {
                                    stream.next();
                                    if (stream.match(query, false))
                                        break;
                                }
                            }};
                    }

                    function getSearchCursor(cm, query, pos) {
                        // Heuristic: if the query string is all lowercase, do a case insensitive search.
                        return cm.getSearchCursor(query, pos, typeof query == "string" && query == query.toLowerCase());
                    }

                    function doSearch(cm, rev, query) {
                        var state = cm.getSearchState(cm);

                        if (state.query) {
                            return findNext(cm, rev);
                        } else {
                            if (!query) {
                                return;
                            }

                            state.query = query;
                            cm.removeOverlay(state.overlay);
                            state.overlay = searchOverlay(state.query);
                            cm.addOverlay(state.overlay);
                            state.posFrom = state.posTo = cm.getCursor();
                            findNext(cm, rev);
                        }
                    }

                    function findNext(cm, rev) {
                        cm.operation(function() {
                            var state = cm.getSearchState();
                            var cursor = getSearchCursor(cm, state.query, rev ? state.posFrom : state.posTo);
                            if (!cursor.find(rev)) {
                                cursor = getSearchCursor(cm, state.query, rev ? CodeMirror.Pos(cm.lastLine()) : CodeMirror.Pos(cm.firstLine(), 0));
                                if (!cursor.find(rev)) {
                                    return;
                                }
                            }
                            cm.setSelection(cursor.from(), cursor.to());
                            state.posFrom = cursor.from();
                            state.posTo = cursor.to();

                            cm.scrollIntoView(cursor.from());
                        });
                    }
                    var state = cm.getSearchState(cm);

                    // query changed, clear
                    if (state.query !== query) {
                        // clear
                        cm.clearSearch();
                    }

                    // search
                    doSearch(cm, rev, query);
                };

                cm.replace = function(query, text, all, re) {
                    var self = this;

                    // create regex
                    if (re) {
                        query = new RegExp(query);
                    }

                    if (all) {
                        for (var cursor = cm.getSearchCursor(query); cursor.findNext(); ) {
                            if (typeof query != "string") {
                                var match = cm.getRange(cursor.from(), cursor.to()).match(query);
                                cursor.replace(text.replace(/\$(\d)/, function(w, i) {
                                    return match[i];
                                }));
                            } else {
                                cursor.replace(text);
                            }
                        }
                    } else {
                        cm.clearSearch();

                        var cursor = cm.getSearchCursor(query, cm.getCursor());

                        function advance() {
                            var start = cursor.from(), match;
                            if (!(match = cursor.findNext())) {
                                cursor = cm.getSearchCursor(query);
                                if (!start || !(match = cursor.findNext()) || (cursor.from().line == start.line && cursor.from().ch == start.ch)) {
                                    cm.focus();
                                    return false;
                                }
                            }
                            cm.setSelection(cursor.from(), cursor.to());

                            doReplace(match);
                            cm.setCursor(cursor.to());

                            cm.scrollIntoView(cursor.to());

                            cm.focus();
                        }

                        function doReplace(match) {
                            cursor.replace(typeof query == "string" ? text : text.replace(/\$(\d)/, function(w, i) {
                                return match[i];
                            }));
                        }

                        advance();
                    }
                };

                cm.format = function() {
                    CodeMirror.commands["selectAll"](cm);

                    function getSelectedRange() {
                        return {
                            from: cm.getCursor(true),
                            to: cm.getCursor(false)
                        };
                    }

                    var range = getSelectedRange();
                    cm.autoFormatRange(range.from, range.to);
                };

                if (o.font_size) {
                    if (/[^\D]/.test(o.font_size)) {
                        o.font_size += 'px';
                    }

                    cm.getWrapperElement().style.fontSize = o.font_size;
                }

                this.editor = cm;

                this._loaded(content);

                if (selection) {
                    cm.search(selection);
                }

                cm.refresh();
            }
        },
        _loaded: function(content) {
            var o = this.options;

            this.setContent(content);

            // set word wrap
            this.wrap(!!o.wrap);
            // set line numbers / gutter
            this.linenumbers(!!o.linenumbers);

            // callback
            o.load.call();

            // focus
            this.focus();
        },
        search: function(find, rev, re) {
            return this.editor.search(find, rev, re);
        },
        replace: function(find, replace, all, re) {
            return this.editor.replace(find, replace, all, re);
        },
        clearSearch: function() {
            return this.editor.clearSearch();
        },
        getSelection: function() {
            return this.editor.getSelection();
        },
        wrap: function(s) {
            return this.editor.setWrap(s);
        },
        linenumbers: function(s) {
            return this.editor.showGutter(s);
        },
        highlight: function(s) {
            return this.editor.highlight(s);
        },
        setContent: function(v, format) {
            if (format) {
                v = this._format(v);
            }
            return this.editor.setContent(v);
        },
        insertContent: function(v) {
            return this.editor.insertContent(v);
        },
        getContent: function() {
            return this.editor.getContent();
        },
        save: function() {
            return this.editor.getContent();
        },
        showInvisibles: function(s) {
            return this.editor.showInvisibles(s);
        },
        resize: function(w, h, init) {
            return this.editor.resize(w, h, init);
        },
        focus: function() {
            return this.editor.focus();
        },
        undo: function() {
            this.editor.undo();

            this.focus();
        },
        redo: function() {
            this.editor.redo();

            this.focus();
        },
        indent: function() {
        },
        getContainer: function() {
            return this.container || null;
        },
        format: function() {
            // get content
            var html = this.getContent();
            // format with cleanup
            html = this._format(html);
            // set content
            this.setContent(html);
        },
        fullscreen: function() {
            var ed = tinyMCEPopup.editor;

            if (ed) {
                return ed.execCommand('mceFullScreen', false);
            }
        }
    };

    window.SourceEditor = SourceEditor;
})(jQuery);
