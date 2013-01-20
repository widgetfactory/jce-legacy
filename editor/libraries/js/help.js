/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2013 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function($){
    $.jce = {
        Help : {
            options : {
                url : '',
                key : [],
                pattern : ''
            },
            init: function(options) {
                var key, id, n, self = this;
                
                $.extend(this.options, options);

                // add ui-jce class to body
                $('body').addClass('ui-jce');
            	
                // init layout
                $('#jce').height($(window).height() - 20);
            	
                // add resize
                $(window).bind('resize', function() {
                    $('#jce').height($(window).height() - 20);
                    // resize frame
                    self.resizeFrame();
                });

                if ($('#help-menu')) {
					
                    $('dd.subtopics', '#help-menu').click(function() {
                        // hide all
                        $(this).parent('dl').children('dl').addClass('hidden');
                        // toggle clicked
                        $(this).next('dl').removeClass('hidden');
                    });
					
                    this.nodes = $('dd[id]', '#help-menu').click(function(e) {
                        if (this.id == '') {
                            return;
                        }
                        
                        $('dd.loading', '#help-menu').removeClass('loading');
						
                        self.loadItem(e.target);
                    });
					
                    $('iframe#help-iframe').load(function() {
                        $('.loading', '#help-menu').removeClass('loading');
                    });
	
                    key = this.options.key;
					
                    if (!key.length) {
                        n = this.nodes[0];
                    } else {
                        id 	= key.join('.');	
                        n 	= document.getElementById(id) || this.nodes[0];
                    }
                    if (n) {
                        this.loadItem(n);
                    }
                }
                
                $('#help-menu-toggle div.toggle-handle').click(function() {
                    var n = this;
                    
                    $(n).toggleClass('collapsed');
                    
                    $('#help-menu').parent().toggle().css('width', '');
                    $('#help-frame').parent().toggleClass('span8 span12');
                    
                    // resize frame
                    self.resizeFrame();
                });
                
                $("#help-menu-toggle").draggable({
                    'opacity': 0.7, 
                    'helper': function() {
                        return $('<div id="help-menu-toggle-clone" />').height($('#help-menu-toggle').height());
                    }, 
                    //'handle' : "div.resize-handle", 
                    'axis': "x",
                    'containment' : "parent",
                    start : function() {
                        $('#help-frame').css('visibility', 'hidden');
                    },
                    stop: function(e, ui) {
                        $('#help-frame').css('visibility', 'visible');
                        
                        var pos = Math.max(Math.round(ui.position.left) - 10, 0);
                        
                        if (pos === 0) {
                            return $('#help-menu-toggle div.toggle-handle').click();
                        }

                        var size = Math.round(ui.position.left);

                        $('#help-menu').parent().css('width', size);
                        $('#help-frame').parent().css('width', $('div.row-fluid').width() - size - 14);
                    }
                }).disableSelection();
                
                // resize help frame
                this.resizeFrame();
            },
            
            resizeFrame : function() {
                var self = this, s;
                
                $('#help-frame').parent().css('width', function() {
                    if ($("#help-menu-toggle div.toggle-handle").hasClass('collapsed')) {
                        s = $("#help-menu-toggle").outerWidth(true);
                    }
                       
                    return $('div.row-fluid').width() - self.getMenuSize(s);
                });
            },
            
            getMenuSize : function(pos) {
                if (typeof pos == 'undefined') {
                    pos = $('#help-menu').parent().outerWidth() + 14; 
                }
                
                return pos;
            },
			
            loadItem: function(el) {
                var s, n, keys, p, map;
                $(el).addClass('loading');
                var id = $(el).attr('id');
	
                if (this.options.pattern) {
                    keys = id.split('.');
                    map = {
                        'section' 	: keys[0] || '',
                        'category' 	: keys[1] || '',
                        'article'	: keys[2] || ''
                    };
                    p = this.options.pattern;	
                    s = p.replace(/\{\$([^\}]+)\}/g, function(a, b) {
                        return map[b] || '';
                    });
                } else {
                    s = id;
                }
	
                $('iframe#help-iframe').attr('src', this.options.url + s);
            }
        }
    };
})(jQuery);