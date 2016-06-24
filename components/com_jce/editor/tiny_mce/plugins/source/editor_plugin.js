(function() {
    var DOM = tinymce.DOM, Event = tinymce.dom.Event;

    tinymce.create('tinymce.plugins.SourcePlugin', {
      init: function(ed, url) {
          var self = this; self.editor = ed;

          ed.onFullScreen.add(function(ed, state) {
            var element   = ed.getElement();
            var container = element.parentNode;

            var header    = DOM.getPrev(element, '.wf-editor-header');
            var iframe    = DOM.get(ed.id + '_editor_source_iframe');

            // store the containerHeight as we go into fullscreen mode
            if (state) {
              var vp = DOM.getViewPort();
              // set height as viewport - header - footer
              DOM.setStyle(iframe, 'height', vp.h - header.offsetHeight - 30);
            } else {
              DOM.setStyle(iframe, 'height', ed.settings.container_height - 30);
            }
          });

          ed.onFullScreenResize.add(function(ed, vp) {
              var element   = ed.getElement();
              var header    = DOM.getPrev(element, '.wf-editor-header');
              var iframe    = DOM.get(ed.id + '_editor_source_iframe');

              DOM.setStyle(iframe, 'height', vp.h - header.offsetHeight - 30);
          });

          ed.onInit.add(function(ed) {
            // get the stored active tab
            var activeTab = sessionStorage.getItem('wf-editor-tabs');

            if (activeTab === "wf-editor-source") {
                // hide editor
                ed.hide();
                // hide textarea
                DOM.hide(ed.getElement());
                // toggle source
                self.toggle();
            }
          });
      },
      getContent: function() {
        var ed = this.editor;

        var iframe = DOM.get(ed.id + '_editor_source_iframe');

        if (iframe) {
            var editor = iframe.contentWindow.SourceEditor;

            if (editor) {
                return editor.getContent();
            }
        }

        return null;
      },
      hide: function() {
        DOM.hide(this.editor.id + '_editor_source');
      },
      toggle: function() {
          var ed = this.editor;
          var self = this,
              s = ed.settings;

          var element   = ed.getElement();
          var container = element.parentNode;

          // get tabs header
          var header = DOM.getPrev(element, '.wf-editor-header');

          var div = DOM.get(ed.id + '_editor_source');
          var iframe = DOM.get(ed.id + '_editor_source_iframe');
          var statusbar = DOM.get(ed.id + '_editor_source_resize');

          // get editor iframe height
          var ifrHeight = parseInt(DOM.get(ed.id + '_ifr').style.height) || s.height;

          var o = tinymce.util.Cookie.getHash("TinyMCE_" + ed.id + "_size");

          if (o && o.height) {
              ifrHeight = o.height;
          }

          // get content from textarea / div
          var content = tinymce.is(element.value) ? element.value : element.innerHTML;

          if (!div) {
              // create the container
              var div = DOM.add(container, 'div', {
                  role: 'textbox',
                  id: ed.id + '_editor_source',
                  'class': 'wf-editor-source defaultSkin'
              });

              if (s.skin !== 'default') {
                DOM.addClass(div, s.skin + 'Skin');

                if (s.skin_variant) {
                  DOM.addClass(div, s.skin + 'Skin' + ucfirst(s.skin_variant));
                }
              }

              var query = ed.getParam('site_url') + 'index.php?option=com_jce';

              var args = {
                  'view': 'editor',
                  'layout': 'plugin',
                  'plugin': 'source',
                  'component_id': ed.getParam('component_id')
              };

              // set token
              args[ed.settings.token] = 1;

              // create query
              for (k in args) {
                  query += '&' + k + '=' + encodeURIComponent(args[k]);
              }

              var iframe = DOM.create('iframe', {
                  'frameborder': 0,
                  'scrolling': 'no',
                  'id': ed.id + '_editor_source_iframe',
                  'src': query
              });

              Event.add(iframe, 'load', function() {
                  var editor = iframe.contentWindow.SourceEditor;

                  editor.init({
                      'wrap': ed.getParam('source_wrap', true),
                      'linenumbers': ed.getParam('source_numbers', true),
                      'highlight': ed.getParam('source_highlight', true),
                      'theme': ed.getParam('source_theme', 'textmate'),
                      'format': ed.getParam('source_format', true),
                      'tag_closing': ed.getParam('source_tag_closing', true),
                      'selection_match': ed.getParam('source_selection_match', true),
                      'font_size': ed.getParam('source_font_size', ''),
                      'fullscreen': DOM.hasClass(container, 'mce-fullscreen'),
                      'load': function() {
                          DOM.removeClass(container, 'mce-loading');
                      }
                  }, content);
              });

              var iframeContainer = DOM.add(div, 'div', {
                  'class': 'mceIframeContainer'
              });

              DOM.add(iframeContainer, iframe);

              // create statusbar
              statusbar = DOM.add(div, 'div', {
                  'id': ed.id + '_editor_source_statusbar',
                  'class': 'mceStatusbar mceLast'
              }, '<a tabindex="-1" class="mceResize" onclick="return false;" href="javascript:;" id="' + ed.id + '_editor_source_resize"></a>');

              var resize = DOM.get(ed.id + '_editor_source_resize');

              // cancel default click
              Event.add(resize, 'click', function(e) {
                  e.preventDefault();
              });

              // Resize source editor
              Event.add(resize, 'mousedown', function(e) {
                  var mm, mu, sx, sy, sw, sh, w, h;

                  e.preventDefault();

                  if (DOM.hasClass(resize, 'wf-editor-source-resizing')) {
                      return false;
                  }

                  function resizeOnMove(e) {
                      e.preventDefault();

                      w = sw + (e.screenX - sx);
                      h = sh + (e.screenY - sy);

                      DOM.setStyle(iframe, 'max-width', w + 'px');
                      DOM.setStyle(iframe, 'height', h);
                      //DOM.setStyle(div, 'width', w);
                      DOM.setStyle(container, 'max-width', w + 'px');

                      DOM.addClass(resize, 'wf-editor-source-resizing');
                  }

                  function endResize(e) {
                      // Stop listening
                      Event.remove(DOM.doc, 'mousemove', mm);
                      Event.remove(DOM.doc, 'mouseup', mu);

                      w = sw + (e.screenX - sx);
                      h = sh + (e.screenY - sy);

                      DOM.setStyle(iframe, 'max-width', w + 'px');
                      DOM.setStyle(iframe, 'height', h);
                      DOM.setStyle(container, 'max-width', w + 'px');

                      DOM.removeClass(resize, 'wf-editor-source-resizing');
                  }

                  // Get the current rect size
                  sx = e.screenX;
                  sy = e.screenY;

                  sw = w = container.offsetHeight;
                  sh = h = iframe.clientHeight;

                  // Register envent handlers
                  mm = Event.add(DOM.doc, 'mousemove', resizeOnMove);
                  mu = Event.add(DOM.doc, 'mouseup', endResize);
              });

          } else {
              DOM.show(div);
              var editor = iframe.contentWindow.SourceEditor;
              // set fullscreen state
              editor.setButtonState('fullscreen', DOM.hasClass(container, 'mce-fullscreen'));
              // set content
              editor.setContent(content);
              DOM.removeClass(container, 'mce-loading');
          }

          // get height from setting or session data or editor textarea
          var height = ed.settings.container_height || sessionStorage.getItem('wf-editor-container-height') || (ifrHeight + statusbar.offsetHeight);

          if (DOM.hasClass(container, 'mce-fullscreen')) {
            var vp = DOM.getViewPort();
            height = vp.h - header.offsetHeight;
          }

          DOM.setStyle(iframe, 'height', height - 30);

          /*var width = ed.settings.container_width || sessionStorage.getItem('wf-editor-container-width');

          if (width) {
              DOM.setStyle(div, 'width', width);
          }*/
      }
    });

    // Register plugin
    tinymce.PluginManager.add('source', tinymce.plugins.SourcePlugin);
})();
