//tinyMCEPopup.requireLangPack();

var TableDialog = {
    settings: {},
    init: function() {
        var self = this, ed = tinyMCEPopup.editor;

        this.html5 = ed.settings.schema == 'html5' && ed.settings.validate;

        if (!this.settings.file_browser) {
            $('input.browser').removeClass('browser');
        }

        $.Plugin.init();

        if (this.settings.context == 'merge') {
            return this.initMerge();
        }

        addClassesToList('classlist', "table_styles");

        if (this.html5) {
            // hide HTML4 only attributes (tframe = frame)
            $('#axis, #abbr, #scope, #summary, #char, #charoff, #tframe, #nowrap, #rules').parent().parent().hide();

            $('#cellspacing').change(function() {
                var st = tinyMCEPopup.dom.parseStyle($('#style').val());

                var v = this.value;

                if (v !== '') {
                    if (v == 0) {
                        st['border-collapse'] = 'collapse';
                    } else {
                        st['border-collapse'] = 'separate';
                        st['border-spacing'] = self.cssSize(v);
                    }
                }

                $('#style').val(tinyMCEPopup.dom.serializeStyle(st));
            });

            // replace border field with checkbox
            $('#border').replaceWith('<input type="checkbox" id="border" />');
        }

        switch (this.settings.context) {
            case 'table':
                this.initTable();
                break;
            case 'cell':
                this.initCell();
                break;
            case 'row':
                this.initRow();
                break;
        }

        $('body').addClass(this.settings.context);

        tinyMCEPopup.resizeToInnerSize();
    },
    insert: function() {
        switch (this.settings.context) {
            case 'table':
                this.insertTable();
                break;
            case 'cell':
                this.updateCells();
                break;
            case 'row':
                this.updateRows();
                break;
            case 'merge':
                this.merge();
                break;
        }
    },
    initMerge: function() {
        $('#numcols').val(tinyMCEPopup.getWindowArg('cols', 1));
        $('#numrows').val(tinyMCEPopup.getWindowArg('rows', 1));

        $('#insert').button('option', 'label', tinyMCEPopup.getLang('update', 'Update', true));
    },
    updateClassList: function(cls) {
        if (!cls) {
            return;
        }

        $('#classlist').val(function() {
            var n = this, a = cls.split(' '), r = [];
            
            $.each(a, function(i, v) {                
                if (v.indexOf('mceItem') == -1) {
                    if ($('option[value="' + v + '"]', n).length == 0) {
                        $(n).append(new Option(v, v));
                    }
                    
                    r.push(v);
                }
            });
            
            return r;
            
        }).change();
    },
    initTable: function() {
        var ed = tinyMCEPopup.editor;

        var elm = ed.dom.getParent(ed.selection.getNode(), "table");
        var action = tinyMCEPopup.getWindowArg('action');

        if (!action) {
            action = elm ? "update" : "insert";
        }

        if (elm && action != "insert") {
            var rowsAr = elm.rows;
            var cols = 0;

            for (var i = 0; i < rowsAr.length; i++) {
                if (rowsAr[i].cells.length > cols) {
                    cols = rowsAr[i].cells.length;
                }
            }

            // Update form
            $('#align').val(ed.dom.getAttrib(elm, 'align'));
            $('#tframe').val(ed.dom.getAttrib(elm, 'frame'));
            $('#rules').val(ed.dom.getAttrib(elm, 'rules'));

            var cls = ed.dom.getAttrib(elm, 'class');
            this.updateClassList(cls);

            $('#cols').val(cols);
            $('#rows').val(rowsAr.length);

            var border = trimSize(getStyle(elm, 'border', 'borderWidth'));
            
            // clean border
            border = border.replace(/[\D]/g, '');

            // set border
            if ($('#border').is(':checkbox')) {
                $('#border').prop('checked', border == 1);
            } else {
                $('#border').val(border);
            }

            $('#cellpadding').val(ed.dom.getAttrib(elm, 'cellpadding', ""));
            $('#cellspacing').val(ed.dom.getAttrib(elm, 'cellspacing', ""));
            $('#width').val(trimSize(getStyle(elm, 'width', 'width')));
            $('#height').val(trimSize(getStyle(elm, 'height', 'height')));
            $('#bordercolor').val(convertRGBToHex(getStyle(elm, 'bordercolor', 'borderLeftColor'))).change();
            $('#bgcolor').val(convertRGBToHex(getStyle(elm, 'bgcolor', 'backgroundColor'))).change();
            $('#id').val(ed.dom.getAttrib(elm, 'id'));
            $('#summary').val(ed.dom.getAttrib(elm, 'summary'));
            $('#style').val(ed.dom.serializeStyle(ed.dom.parseStyle(ed.dom.getAttrib(elm, "style"))));
            $('#dir').val(ed.dom.getAttrib(elm, 'dir'));
            $('#lang').val(ed.dom.getAttrib(elm, 'lang'));
            $('#backgroundimage').val(getStyle(elm, 'background', 'backgroundImage').replace(new RegExp("url\\(['\"]?([^'\"]*)['\"]?\\)", 'gi'), "$1"));

            $('#caption').prop('checked', elm.getElementsByTagName('caption').length > 0);

            this.orgTableWidth = $('#width').val();
            this.orgTableHeight = $('#height').val();

            $('#insert').button('option', 'label', tinyMCEPopup.getLang('update', 'Update', true));
        } else {
            $.Plugin.setDefaults(this.settings.defaults);
        }

        // Resize some elements
        if ($('#backgroundimagebrowser').is(':visible')) {
            $('#backgroundimage').width(180);
        }

        // Disable some fields in update mode
        if (action == "update") {
            $('#cols, #rows').prop('disabled', true);
        }
    },
    initRow: function() {
        var self = this, ed = tinyMCEPopup.editor, dom = tinyMCEPopup.dom;

        var trElm = dom.getParent(ed.selection.getStart(), "tr");
        var st = dom.parseStyle(dom.getAttrib(trElm, "style"));

        // Get table row data
        var rowtype = trElm.parentNode.nodeName.toLowerCase();
        var align = dom.getAttrib(trElm, 'align');
        var valign = dom.getAttrib(trElm, 'valign');
        var height = trimSize(getStyle(trElm, 'height', 'height'));
        var className = dom.getAttrib(trElm, 'class');
        var bgcolor = convertRGBToHex(getStyle(trElm, 'bgcolor', 'backgroundColor'));
        var backgroundimage = getStyle(trElm, 'background', 'backgroundImage').replace(new RegExp("url\\(['\"]?([^'\"]*)['\"]?\\)", 'gi'), "$1");
        var id = dom.getAttrib(trElm, 'id');
        var lang = dom.getAttrib(trElm, 'lang');
        var dir = dom.getAttrib(trElm, 'dir');

        $('#rowtype').change(function() {
            self.setActionforRowType();
        }).val(rowtype).change();

        // Any cells selected
        if (dom.select('td.mceSelected,th.mceSelected', trElm).length == 0) {

            $('#bgcolor').val(bgcolor).change();
            $('#backgroundimage').val(backgroundimage);
            $('#height').val(height);
            $('#id').val(id);
            $('#lang').val(lang);
            $('#style').val(dom.serializeStyle(st));

            $('#align').val(align);
            $('#valign').val(valign);
            
            // update class list
            this.updateClassList(className);

            $('#dir').val(dir);

            // Resize some elements
            if ($('#backgroundimagebrowser').is(':visible')) {
                $('#backgroundimage').width(180);
            }

            $('#insert').button('option', 'label', tinyMCEPopup.getLang('update', 'Update', true));
        } else {
            $('#action').hide();
        }
    },
    initCell: function() {
        var ed = tinyMCEPopup.editor, dom = ed.dom;

        var tdElm = dom.getParent(ed.selection.getStart(), "td,th");
        var st = dom.parseStyle(dom.getAttrib(tdElm, "style"));

        // Get table cell data
        var celltype = tdElm.nodeName.toLowerCase();
        var align = dom.getAttrib(tdElm, 'align');
        var valign = dom.getAttrib(tdElm, 'valign');
        var width = trimSize(getStyle(tdElm, 'width', 'width'));
        var height = trimSize(getStyle(tdElm, 'height', 'height'));
        var bordercolor = convertRGBToHex(getStyle(tdElm, 'bordercolor', 'borderLeftColor'));
        var bgcolor = convertRGBToHex(getStyle(tdElm, 'bgcolor', 'backgroundColor'));
        var className = dom.getAttrib(tdElm, 'class');
        var backgroundimage = getStyle(tdElm, 'background', 'backgroundImage').replace(new RegExp("url\\(['\"]?([^'\"]*)['\"]?\\)", 'gi'), "$1");
        var id = dom.getAttrib(tdElm, 'id');
        var lang = dom.getAttrib(tdElm, 'lang');
        var dir = dom.getAttrib(tdElm, 'dir');
        var scope = dom.getAttrib(tdElm, 'scope');

        if (!dom.hasClass(tdElm, 'mceSelected')) {
            $('#bordercolor').val(bordercolor).change();
            $('#bgcolor').val(bgcolor).change();
            $('#backgroundimage').val(backgroundimage);
            $('#width').val(width);
            $('#height').val(height);
            $('#id').val(id);
            $('#lang').val(lang);
            $('#style').val(dom.serializeStyle(st));

            $('#align').val(align);
            $('#valign').val(valign);
            
            // update class list
            this.updateClassList(className);

            $('#dir').val(dir);
            $('#celltype').val(celltype);
            $('#scope').val(scope);

            // Resize some elements
            if ($('#backgroundimagebrowser').is(':visible')) {
                $('#backgroundimage').width(180);
            }

            $('#insert').button('option', 'label', tinyMCEPopup.getLang('update', 'Update', true));
        } else {
            $('#action').hide();
        }
    },
    merge: function() {
        var func;

        tinyMCEPopup.restoreSelection();
        func = tinyMCEPopup.getWindowArg('onaction');

        func({
            cols: $('#numcols').val(),
            rows: $('#numrows').val()
        });

        tinyMCEPopup.close();
    },
    insertTable: function() {
        var ed = tinyMCEPopup.editor, dom = ed.dom;

        var elm = ed.dom.getParent(ed.selection.getNode(), "table");
        var action = tinyMCEPopup.getWindowArg('action');

        if (!action) {
            action = elm ? "update" : "insert";
        }

        var cols = 2, rows = 2, border = 0, cellpadding = -1, cellspacing = -1, align, width, height, className, caption, frame, rules;
        var html = '', capEl, elm;
        var cellLimit, rowLimit, colLimit;

        tinyMCEPopup.restoreSelection();

        if (!AutoValidator.validate($('form').get(0))) {
            tinyMCEPopup.alert(ed.getLang('invalid_data'));
            return false;
        }
        elm = dom.getParent(ed.selection.getNode(), 'table');

        // Get form data
        cols = $('#cols').val();
        rows = $('#rows').val();
        border = $('#border').val() != "" ? $('#border').val() : 0;
        cellpadding = $('#cellpadding').val() != "" ? $('#cellpadding').val() : "";
        cellspacing = $('#cellspacing').val() != "" ? $('#cellspacing').val() : "";
        align = $("#align").val();
        frame = $("#tframe").val();
        rules = $("#rules").val();
        width = $('#width').val();
        height = $('#height').val();
        bordercolor = $('#bordercolor').val();
        bgcolor = $('#bgcolor').val();
        className = $("#classes").val();
        id = $('#id').val();
        summary = $('#summary').val();
        style = $('#style').val();
        dir = $('#dir').val();
        lang = $('#lang').val();
        background = $('#backgroundimage').val();
        caption = $('#caption').is(':checked');
        cellLimit = tinyMCEPopup.getParam('table_cell_limit', false);
        rowLimit = tinyMCEPopup.getParam('table_row_limit', false);
        colLimit = tinyMCEPopup.getParam('table_col_limit', false);

        // Validate table size
        if (colLimit && cols > colLimit) {
            tinyMCEPopup.alert(ed.getLang('table_dlg.col_limit').replace(/\{\$cols\}/g, colLimit));
            return false;
        } else if (rowLimit && rows > rowLimit) {
            tinyMCEPopup.alert(ed.getLang('table_dlg.row_limit').replace(/\{\$rows\}/g, rowLimit));
            return false;
        } else if (cellLimit && cols * rows > cellLimit) {
            tinyMCEPopup.alert(ed.getLang('table_dlg.cell_limit').replace(/\{\$cells\}/g, cellLimit));
            return false;
        }

        // reset border if checkbox (html5)
        if ($('#border').is(':checkbox')) {
            border = $('#border').is(':checked') ? '1' : '';
        }

        // Update table
        if (action == "update") {
            ed.execCommand('mceBeginUndoLevel');

            if (!this.html5) {
                dom.setAttrib(elm, 'cellPadding', cellpadding, true);
                dom.setAttrib(elm, 'cellSpacing', cellspacing, true);
            }

            if (!this.isCssSize(border)) {
                dom.setAttrib(elm, 'border', border);
            } else {
                dom.setAttrib(elm, 'border', '');
            }

            if (border == '') {
                dom.setStyle(elm, 'border-width', '');
                dom.setStyle(elm, 'border', '');
                dom.setAttrib(elm, 'border', '');
            }

            dom.setAttrib(elm, 'align', align);
            dom.setAttrib(elm, 'frame', frame);
            dom.setAttrib(elm, 'rules', rules);
            dom.setAttrib(elm, 'class', className);
            dom.setAttrib(elm, 'style', style);
            dom.setAttrib(elm, 'id', id);
            dom.setAttrib(elm, 'summary', summary);
            dom.setAttrib(elm, 'dir', dir);
            dom.setAttrib(elm, 'lang', lang);
            capEl = ed.dom.select('caption', elm)[0];

            if (capEl && !caption) {
                capEl.parentNode.removeChild(capEl);
            }

            if (!capEl && caption) {
                capEl = elm.ownerDocument.createElement('caption');

                if (!tinymce.isIE) {
                    capEl.innerHTML = '<br data-mce-bogus="1"/>';
                }

                elm.insertBefore(capEl, elm.firstChild);
            }

            if (width && ed.settings.inline_styles) {
                dom.setStyle(elm, 'width', width);
                dom.setAttrib(elm, 'width', '');
            } else {
                dom.setAttrib(elm, 'width', width, true);
                dom.setStyle(elm, 'width', '');
            }

            // Remove these since they are not valid XHTML
            dom.setAttrib(elm, 'borderColor', '');
            dom.setAttrib(elm, 'bgColor', '');
            dom.setAttrib(elm, 'background', '');

            if (height && ed.settings.inline_styles) {
                dom.setStyle(elm, 'height', height);
                dom.setAttrib(elm, 'height', '');
            } else {
                dom.setAttrib(elm, 'height', height, true);
                dom.setStyle(elm, 'height', '');
            }

            if (background != '') {
                elm.style.backgroundImage = "url('" + background + "')";
            } else {
                elm.style.backgroundImage = '';
            }

            /*		if (tinyMCEPopup.getParam("inline_styles")) {
             if (width != '')
             elm.style.width = getCSSSize(width);
             }*/

            if (bordercolor != "") {
                elm.style.borderColor = bordercolor;
                elm.style.borderStyle = elm.style.borderStyle == "" ? "solid" : elm.style.borderStyle;
                elm.style.borderWidth = this.cssSize(border);
                
                dom.setAttrib(elm, 'border', '');
                
            } else {
                elm.style.borderColor = '';
            }

            elm.style.backgroundColor = bgcolor;
            elm.style.height = getCSSSize(height);

            ed.addVisual();

            // Fix for stange MSIE align bug
            //elm.outerHTML = elm.outerHTML;

            ed.nodeChanged();
            ed.execCommand('mceEndUndoLevel', false, {}, {
                skip_undo: true
            });

            // Repaint if dimensions changed
            if ($('#width').val() != this.orgTableWidth || $('#height').val() != this.orgTableHeight) {
                ed.execCommand('mceRepaint');
            }

            tinyMCEPopup.close();
            return true;
        }

        // Create new table
        html += '<table';
        html += this.makeAttrib('id', id);
        if (!this.isCssSize(border)) {
            html += this.makeAttrib('border', border);
        }
        html += this.makeAttrib('cellpadding', cellpadding);
        html += this.makeAttrib('cellspacing', cellspacing);
        html += this.makeAttrib('data-mce-new', '1');

        if (width && ed.settings.inline_styles) {
            if (style) {
                style += '; ';
            }

            // Force px
            if (/^[0-9\.]+$/.test(width)) {
                width += 'px';
            }

            style += 'width: ' + width;
        } else {
            html += this.makeAttrib('width', width);
        }

        /*	if (height) {
         if (style)
         style += '; ';
         
         style += 'height: ' + height;
         }*/

        //html += this.makeAttrib('height', height);
        //html += this.makeAttrib('bordercolor', bordercolor);
        //html += this.makeAttrib('bgcolor', bgcolor);
        html += this.makeAttrib('align', align);
        html += this.makeAttrib('frame', frame);
        html += this.makeAttrib('rules', rules);
        html += this.makeAttrib('class', className);
        html += this.makeAttrib('style', style);
        html += this.makeAttrib('summary', summary);
        html += this.makeAttrib('dir', dir);
        html += this.makeAttrib('lang', lang);
        html += '>';

        if (caption) {
            if (!tinymce.isIE) {
                html += '<caption><br data-mce-bogus="1"/></caption>';
            } else {
                html += '<caption></caption>';
            }
        }

        for (var y = 0; y < rows; y++) {
            html += "<tr>";

            for (var x = 0; x < cols; x++) {
                if (!tinymce.isIE) {
                    html += '<td><br data-mce-bogus="1"/></td>';
                } else {
                    html += '<td></td>';
                }
            }
            html += "</tr>";
        }
        html += "</table>";

        ed.execCommand('mceBeginUndoLevel');

        // Move table
        if (ed.settings.fix_table_elements) {
            var patt = '';

            ed.focus();
            ed.selection.setContent('<br class="_mce_marker" />');

            tinymce.each('h1,h2,h3,h4,h5,h6,p'.split(','), function(n) {
                if (patt) {
                    patt += ',';
                }
                patt += n + ' ._mce_marker';
            });


            tinymce.each(ed.dom.select(patt), function(n) {
                ed.dom.split(ed.dom.getParent(n, 'h1,h2,h3,h4,h5,h6,p'), n);
            });


            dom.setOuterHTML(dom.select('br._mce_marker')[0], html);
        } else {
            ed.execCommand('mceInsertContent', false, html);
        }

        tinymce.each(dom.select('table[data-mce-new]'), function(node) {
            var tdorth = dom.select('td,th', node);

            // Fixes a bug in IE where the caret cannot be placed after the table if the table is at the end of the document
            if (tinymce.isIE && node.nextSibling == null) {
                if (ed.settings.forced_root_block)
                    dom.insertAfter(dom.create(ed.settings.forced_root_block), node);
                else
                    dom.insertAfter(dom.create('br', {
                        'data-mce-bogus': '1'
                    }), node);
            }

            try {
                // IE9 might fail to do this selection 
                ed.selection.setCursorLocation(tdorth[0], 0);
            } catch (ex) {
                // Ignore
            }

            dom.setAttrib(node, 'data-mce-new', '');
        });


        ed.addVisual();
        ed.execCommand('mceEndUndoLevel', false, {}, {
            skip_undo: true
        });

        tinyMCEPopup.close();
    },
    updateCells: function() {
        var self = this, el, ed = tinyMCEPopup.editor, inst = ed, tdElm, trElm, tableElm;

        tinyMCEPopup.restoreSelection();
        el = ed.selection.getStart();
        tdElm = ed.dom.getParent(el, "td,th");
        trElm = ed.dom.getParent(el, "tr");
        tableElm = ed.dom.getParent(el, "table");

        // Cell is selected
        if (ed.dom.hasClass(tdElm, 'mceSelected')) {
            // Update all selected sells
            tinymce.each(ed.dom.select('td.mceSelected,th.mceSelected'), function(td) {
                self.updateCell(td);
            });


            ed.addVisual();
            ed.nodeChanged();
            inst.execCommand('mceEndUndoLevel');
            tinyMCEPopup.close();
            return;
        }

        ed.execCommand('mceBeginUndoLevel');

        switch ($('#action').val()) {
            case "cell":
                var celltype = $('#celltype').val();
                var scope = $('#scope').val();

                function doUpdate(s) {
                    if (s) {
                        self.updateCell(tdElm);

                        ed.addVisual();
                        ed.nodeChanged();
                        inst.execCommand('mceEndUndoLevel');
                        tinyMCEPopup.close();
                    }
                }
                ;

                if (ed.getParam("accessibility_warnings", 1)) {
                    if (celltype == "th" && scope == "") {
                        tinyMCEPopup.confirm(ed.getLang('table_dlg.missing_scope', '', true), doUpdate);
                    } else {
                        doUpdate(1);
                    }

                    return;
                }

                this.updateCell(tdElm);
                break;

            case "row":
                var cell = trElm.firstChild;

                if (cell.nodeName != "TD" && cell.nodeName != "TH") {
                    cell = this.nextCell(cell);
                }

                do {
                    cell = this.updateCell(cell, true);
                } while ((cell = this.nextCell(cell)) != null);

                break;

            case "all":
                var rows = tableElm.getElementsByTagName("tr");

                for (var i = 0; i < rows.length; i++) {
                    var cell = rows[i].firstChild;

                    if (cell.nodeName != "TD" && cell.nodeName != "TH") {
                        cell = this.nextCell(cell);
                    }

                    do {
                        cell = this.updateCell(cell, true);
                    } while ((cell = this.nextCell(cell)) != null);
                }

                break;
        }

        ed.addVisual();
        ed.nodeChanged();
        inst.execCommand('mceEndUndoLevel');
        tinyMCEPopup.close();
    },
    updateRow: function(tr_elm, skip_id, skip_parent) {
        var ed = tinyMCEPopup.editor, dom = ed.dom, doc = ed.getDoc(), v;

        var curRowType = tr_elm.parentNode.nodeName.toLowerCase();
        var rowtype = $('#rowtype').val();

        $.each(['id', 'align', 'valign', 'lang', 'dir', 'classes', 'style'], function(i, k) {
            v = $('#' + k).val();

            if (k == 'id' && skip_id) {
                return;
            }

            if (k == 'style') {
                v = dom.serializeStyle(dom.parseStyle(v));
            }

            if (k == 'classes') {
                k = 'class';
            }

            dom.setAttrib(tr_elm, k, v);
        });

        // Clear deprecated attributes
        $.each(['height', 'bgColor', 'background'], function(i, k) {
            ed.dom.setAttrib(tr_elm, k, null);
        });

        // Set styles
        tr_elm.style.height = getCSSSize($('#height').val());
        tr_elm.style.backgroundColor = $('#bgcolor').val();

        if ($('#backgroundimage').val() != "") {
            tr_elm.style.backgroundImage = "url('" + $('#backgroundimage').val() + "')";
        } else {
            tr_elm.style.backgroundImage = '';
        }

        // Setup new rowtype
        if (curRowType != rowtype && !skip_parent) {
            // first, clone the node we are working on
            var newRow = tr_elm.cloneNode(1);

            // next, find the parent of its new destination (creating it if necessary)
            var theTable = dom.getParent(tr_elm, "table");
            var dest = rowtype;
            var newParent = null;
            for (var i = 0; i < theTable.childNodes.length; i++) {
                if (theTable.childNodes[i].nodeName.toLowerCase() == dest) {
                    newParent = theTable.childNodes[i];
                }
            }

            if (newParent == null) {
                newParent = doc.createElement(dest);

                if (dest == "thead") {
                    if (theTable.firstChild.nodeName == 'CAPTION') {
                        ed.dom.insertAfter(newParent, theTable.firstChild);
                    } else {
                        theTable.insertBefore(newParent, theTable.firstChild);
                    }
                } else {
                    theTable.appendChild(newParent);
                }
            }

            // append the row to the new parent
            newParent.appendChild(newRow);

            // remove the original
            tr_elm.parentNode.removeChild(tr_elm);

            // set tr_elm to the new node
            tr_elm = newRow;
        }

        dom.setAttrib(tr_elm, 'style', dom.serializeStyle(dom.parseStyle(tr_elm.style.cssText)));
    },
    makeAttrib: function(attrib, value) {
        if (typeof (value) == "undefined" || value == null) {
            value = $('#' + attrib).val();
        }

        if (value == "") {
            return "";
        }

        // XML encode it
        value = value.replace(/&/g, '&amp;');
        value = value.replace(/\"/g, '&quot;');
        value = value.replace(/</g, '&lt;');
        value = value.replace(/>/g, '&gt;');

        return ' ' + attrib + '="' + value + '"';
    },
    updateRows: function() {
        var self = this, ed = tinyMCEPopup.editor, dom = ed.dom, trElm, tableElm;
        var action = $('#action').val();

        tinyMCEPopup.restoreSelection();
        trElm = dom.getParent(ed.selection.getStart(), "tr");
        tableElm = dom.getParent(ed.selection.getStart(), "table");

        // Update all selected rows
        if (dom.select('td.mceSelected,th.mceSelected', trElm).length > 0) {
            tinymce.each(tableElm.rows, function(tr) {
                var i;

                for (i = 0; i < tr.cells.length; i++) {
                    if (dom.hasClass(tr.cells[i], 'mceSelected')) {
                        self.updateRow(tr, true);
                        return;
                    }
                }
            });


            ed.addVisual();
            ed.nodeChanged();
            ed.execCommand('mceEndUndoLevel');
            tinyMCEPopup.close();
            return;
        }

        ed.execCommand('mceBeginUndoLevel');

        switch (action) {
            case "row":
                this.updateRow(trElm);
                break;

            case "all":
                var rows = tableElm.getElementsByTagName("tr");

                for (var i = 0; i < rows.length; i++) {
                    this.updateRow(rows[i], true);
                }

                break;

            case "odd":
            case "even":
                var rows = tableElm.getElementsByTagName("tr");

                for (var i = 0; i < rows.length; i++) {
                    if ((i % 2 == 0 && action == "odd") || (i % 2 != 0 && action == "even"))
                        this.updateRow(rows[i], true, true);
                }

                break;
        }

        ed.addVisual();
        ed.nodeChanged();
        ed.execCommand('mceEndUndoLevel');
        tinyMCEPopup.close();
    },
    updateCell: function(td, skip_id) {
        var ed = tinyMCEPopup.editor, dom = ed.dom, doc = ed.getDoc(), v;

        var curCellType = td.nodeName.toLowerCase();
        var celltype = $('#celltype').val();

        $.each(['id', 'align', 'valign', 'lang', 'dir', 'classes', 'scope', 'style'], function(i, k) {
            v = $('#' + k).val();

            if (k == 'id' && skip_id) {
                return;
            }

            if (k == 'style') {
                v = dom.serializeStyle(dom.parseStyle(v));
            }

            if (k == 'classes') {
                k = 'class';
            }

            if (v === '') {
                td.removeAttribute(k);
            } else {
                dom.setAttrib(td, k, v);
            }
        });

        // Clear deprecated attributes
        $.each(['width', 'height', 'bgColor', 'borderColor', 'background'], function(i, k) {
            ed.dom.setAttrib(td, k, null);
        });

        // Set styles
        td.style.width = getCSSSize($('#width').val());
        td.style.height = getCSSSize($('#height').val());

        if ($('#bordercolor').val() != "") {
            td.style.borderColor = $('#bordercolor').val();
            td.style.borderStyle = td.style.borderStyle == "" ? "solid" : td.style.borderStyle;
            td.style.borderWidth = td.style.borderWidth == "" ? "1px" : td.style.borderWidth;
        } else {
            td.style.borderColor = '';
        }

        td.style.backgroundColor = $('#bgcolor').val();

        if ($('#backgroundimage').val() != "") {
            td.style.backgroundImage = "url('" + $('#backgroundimage').val() + "')";
        } else {
            td.style.backgroundImage = '';
        }

        if (curCellType != celltype) {
            // changing to a different node type
            var newCell = doc.createElement(celltype);

            for (var c = 0; c < td.childNodes.length; c++)
                newCell.appendChild(td.childNodes[c].cloneNode(1));

            for (var a = 0; a < td.attributes.length; a++)
                ed.dom.setAttrib(newCell, td.attributes[a].name, ed.dom.getAttrib(td, td.attributes[a].name));

            td.parentNode.replaceChild(newCell, td);
            td = newCell;
        }

        dom.setAttrib(td, 'style', dom.serializeStyle(dom.parseStyle(td.style.cssText)));

        return td;
    },
    nextCell: function(elm) {
        while ((elm = elm.nextSibling) != null) {
            if (elm.nodeName == "TD" || elm.nodeName == "TH") {
                return elm;
            }
        }

        return null;
    },
    changedSize: function() {
        var st = tinyMCEPopup.dom.parseStyle($('#style').val());

        var height = $('#height').val();

        if (height != "") {
            st['height'] = this.cssSize(height);
        } else {
            st['height'] = "";
        }

        $('#style').val(tinyMCEPopup.dom.serializeStyle(st));
    },
    changedBackgroundImage: function() {
        var st = tinyMCEPopup.dom.parseStyle($('#style').val());

        st['background-image'] = "url('" + $('#backgroundimage').val() + "')";

        $('#style').val(tinyMCEPopup.dom.serializeStyle(st));
    },
    isCssSize: function(value) {
        return /^[0-9.]+(%|in|cm|mm|em|ex|pt|pc|px)$/.test(value);
    },
    cssSize: function(value, def) {
        value = tinymce.trim(value || def);

        if (!this.isCssSize(value)) {
            return parseInt(value, 10) + 'px';
        }

        return value;
    },
    changedBorder: function() {
        var st = tinyMCEPopup.dom.parseStyle($('#style').val());

        var bw = $('#border').val();

        if (bw != "" && (this.isCssSize(bw) || $('#bordercolor').val() != ""))
            st['border-width'] = this.cssSize(bw);
        else {
            if (!bw) {
                st['border'] = '';
                st['border-width'] = '';
            }
        }

        $('#style').val(tinyMCEPopup.dom.serializeStyle(st));
    },
    changedColor: function() {
        var dom = tinyMCEPopup.dom;

        var st = dom.parseStyle($('#style').val());

        st['background-color'] = $('#bgcolor').val();

        if ($('#bordercolor').val() != "") {
            st['border-color'] = $('#bordercolor').val();

            // Add border-width if it's missing
            if (!st['border-width']) {
                st['border-width'] = this.cssSize($('#border').val(), 1);
            }
        }

        $('#style').val(dom.serializeStyle(st));
    },
    changedStyle: function() {
        var dom = tinyMCEPopup.dom;
        var st = dom.parseStyle($('#style').val());

        if (st['background-image']) {
            $('#backgroundimage').val(st['background-image'].replace(new RegExp("url\\(['\"]?([^'\"]*)['\"]?\\)", 'gi'), "$1"));
        } else {
            $('#backgroundimage').val('');
        }
        if (st['width']) {
            $('#width').val(trimSize(st['width']));
        }

        if (st['height']) {
            $('#height').val(trimSize(st['height']));
        }
        if (st['background-color']) {
            $('#bgcolor').val(st['background-color']).change();
        }

        if (st['border-color']) {
            $('#bordercolor').val(st['border-color']).change();
        }

        if (st['border-spacing']) {
            $('#cellspacing').val(trimSize(st['border-spacing']));
        }

        if (st['border-collapse'] && st['border-collapse'] == 'collapse') {
            $('#cellspacing').val(0);
        }
    },
    setClasses: function(v) {
        $.Plugin.setClasses(v);
    },
    setActionforRowType: function() {
        var rowtype = $('#rowtype').val();

        if (rowtype === "tbody") {
            $('#action').prop('disabled', false);
        } else {
            $('#action').val('row').prop('disabled', true);
        }
    }

};
tinyMCEPopup.onInit.add(TableDialog.init, TableDialog);
