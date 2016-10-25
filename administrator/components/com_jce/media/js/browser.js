/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2016 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

(function($) {
    $.WFBrowserWidget = {
        options: {
            element: null,
            plugin: {
                plugin: 'browser',
                root: '',
                site: '',
                help: function(e) {
                    var w = Math.max($('#browser').width(), 768),
                        h = Math.max($('#browser').height(), 520);

                    $.Dialog.iframe('Help', 'index.php?option=com_jce&view=help&tmpl=component&section=editor&category=browser', {
                        width: w,
                        height: h,
                        onFrameLoad: function() {
                            if ($(this).width() < 768) {
                                $(this).width(768);
                            }
                        }
                    });
                }
            },
            manager: {
                upload: {
                    insert: false
                },
                expandable: false
            }
        },
        init: function(options) {
            var self = this,
                win = window.parent,
                doc = win.document;

            $.extend(true, this.options, options);

            $('<input type="hidden" id="src" value="" />').appendTo(document.body);

            $.Plugin.init(this.options.plugin);

            $('button#insert, button#cancel').hide();

            if (this.options.element) {
                // add insert button action
                $('button#insert').show().click(function(e) {
                    self.insert();
                    self.close();
                    e.preventDefault();
                });

                $('button#cancel').show().click(function(e) {
                    self.close();
                    e.preventDefault();
                });

                if (win.jQuery) {
                    // Joomla 3.5.x Media Field
                    var wrapper = win.jQuery('#' + this.options.element).parents('.field-media-wrapper').get(0);
                    if (wrapper) {
                        $('button#cancel').hide();
                    }
                }

                var src = '',
                    el = doc.getElementById(this.options.element);

                if (el) {
                    src = el.value;
                }

                $('#src').val(src);
            }

            $.extend(this.options.manager, {
                onFileClick: function(e, file) {
                    var src = $(file).data('url');
                    $('#src').val(src);
                }
            });

            // Create File Browser
            WFBrowserWidget.init($.extend(this.options.manager, {}));
        },

        clean: function(s) {
            // trim
            s = $.trim(s);

            // remove multiple period characters
            s = s.replace(/(\.){2,}/g, '');

            // trim period characters
            s = s.replace(/^\.|\.$/g, '');

            // trim
            s = $.trim(s);

            return s;
        },

        selectFile: function(file) {
            var self = this;
            var name = file.title;

            var src = $(file).data('url');

            src = src.charAt(0) == '/' ? src.substring(1) : src;
            $('#src').val(src);
        },
		
        insert: function() {
            if (this.options.element) {
                var selected = WFFileBrowser.getSelectedItems();

                if (selected.length) {
                    this.selectFile(selected[0]);
                }

                var win = window.parent;

                var v = $('#src').val() || '';

                // trim url
                v = $.trim(v);

                if (win.jQuery) {
                    // Joomla 3.5.x Media Field
                    var wrapper = win.jQuery('#' + this.options.element).parents('.field-media-wrapper').get(0);
                    if (wrapper) {
                        var inst = win.jQuery(wrapper).data('fieldMedia');

                        if (inst) {
                            return inst.setValue(v);
                        }
                    }

                    win.jQuery('#' + this.options.element).val(v).change();
                } else {
                    var el = win.document.getElementById(this.options.element);

                    if (el) {
                        el.value = v;
                    }
                }
            }
        },
        close: function() {
            var win = window.parent;

            // JCE dialog
            if (typeof win.$jce !== 'undefined') {
                return win.$jce.closeDialog('#' + this.options.element + '_browser');
            }

            // Joomla 3.5.x Media Field
            if (this.options.element && typeof win.jQuery.fieldMedia !== 'undefined') {
                var wrapper = win.jQuery('#' + this.options.element).parents('.field-media-wrapper').get(0);

                var inst = win.jQuery(wrapper).data('fieldMedia');

                if (inst) {
                    return inst.modalClose();
                }
            }

            // jModalClose
            if (typeof win.jModalClose !== 'undefined') {
                return win.jModalClose();
            }

            // try squeezebox
            if (typeof win.SqueezeBox !== 'undefined') {
                return win.SqueezeBox.close();
            }
        }
    };
})(jQuery);

//fake tinyMCE object for language files
var tinyMCE = {
    addI18n: function(p, o) {
        return jQuery.Plugin.addI18n(p, o);
    }
};

var tinyMCEPopup = {
    getLang: function(p, o) {
        return tinyMCE.addI18n(p, o);
    },
    getParam: function() {

    },
    getWindowArg: function(element) {

    }
};