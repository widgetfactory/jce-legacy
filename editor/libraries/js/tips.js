/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2013 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

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
	
    $.support.canvas = false;//!!document.createElement('canvas').getContext;
    
    // http://www.abeautifulsite.net/blog/2011/11/detecting-mobile-devices-with-javascript/
    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
	
    $.widget("ui.tips", {
		
        options: {
            speed: 150,
            position: 'top center',
            opacity: 0.9,
            className: '',
            offsets: {
                'x': 16,
                'y': 16
            },
            width: 200,
            fixed: true,
            parent : 'body',
            trigger : 'hover',
            show : $.noop,
            hide : $.noop,
            disabled : ':disabled, .disabled'
        },
		
        /**
		 * Initialise the tooltip
		 * @param {Object} elements
		 * @param {Object} options
		 */
        _init: function(options) {
            var self = this;
			
            $.extend(this.options, options);
			
            // cancel on drag/drop/sortable		
            if ($(this.element).hasClass('wf-tooltip-cancel-ondrag')) {
                this._cancelOnDrag();
            }
                           
            $(this.element).click(function(e) {					
                if (self.options.trigger == 'click' && $(this).is(self.options.disabled)) {
                    return;
                }
                
                // don't pin tip if a link or parent of a link
                if (this.nodeName == 'A' || $('a', this).length || $(this).hasClass('wf-tooltip-cancel-ondrag')) {
                    return;
                }
                
                if (self.options.trigger == 'click') {
                    if ($('#jce-tooltip').is(':visible')) {
                        return self._end();
                    }

                    self._start(e);
                }
			
                if ($('#jce-tooltip').hasClass('sticky')) {
                    self._unpin();
                } else {
                    self._pin();
                }
            });
            
            if (this.options.trigger == 'hover') {
                $(this.element).hover(
                    function (e) {
                        if ($('#jce-tooltip').hasClass('sticky') || $(this).hasClass('nohover')) {
                            return;
                        } 
                        return self._start(e);
                    },
                    function (e) {                        
                        if ($('#jce-tooltip').hasClass('sticky') || $(this).hasClass('nohover')) {
                            return;
                        }
                        return self._end();
                    }
                    );
            }
        },
		
        /**
	 	* Create the tooltip div
	 	*/
        _createTips: function() {
            var self = this, $tips = $('#jce-tooltip');
	
            if (!$tips.get(0)) {				
                $tips = $('<div id="jce-tooltip" role="tooltip" aria-hidden="true">' +
                    '<span class="ui-icon ui-icon-close" title="Close"></span>' +	
                    '<div class="jce-tooltip-content"></div>' +
                    '</div>').appendTo(this.options.parent);
                
                $('#jce-tooltip').append('<div class="jce-tooltip-pointer"></div>');
                
                if ($.support.leadingWhitespace === false) {
                    $('#jce-tooltip div.jce-tooltip-pointer').append('<div class="jce-tooltip-pointer-inner"></div>');
                }
								
                $('span.ui-icon-close', $tips).click(function() {
                    self._end();
                }).hide();

                if ($.support.cssFloat) {
                    $tips.css('opacity', 0);
                }
            }
            
            $tips.removeAttr('class').addClass('jce-tooltip').addClass(this.options.className);
        },
		
        /**
		 * Show the tooltip and build the tooltip text
		 * @param {Object} e  Event
		 * @param {Object} el Target Element
		 */
        _start: function(e) {
            var self = this;
            // Create tooltip if it doesn't exist
            this._createTips();
	
            var $tips = $('#jce-tooltip');
            // store element
            $tips.data('source', this.element);
            
            if (this.options.content) {
                var h = this.options.content;
            } else {
                // Get tooltip text from title
                var text = $(this.element).attr('title') || '', title = '';
			
                // Split tooltip text ie: title::text
                if (/::/.test(text)) {
                    var parts = text.split('::');
                    title 	= $.trim(parts[0]);
                    text 	= $.trim(parts[1]);
                }
                // Store original title and remove
                $(this.element).data('title',  $(this.element).attr('title')).attr('title', '');
                // add aria description
                $(this.element).attr('aria-describedby', 'jce-tooltip');
			
                var h = '';
                // Set tooltip title html
                if (title) {
                    h += '<h4>' + title + '</h4>';
                }
                // Set tooltip text html
                if (text) {
                    h += '<p>' + text + '</p>';
                }
            }
	
            // Set tooltip html
            $('div.jce-tooltip-content', $tips).html(h);
	
            /*$('div.jce-tooltip-pointer-down-inner', $tips).css({
                'border-top-color' : $tips.css('background-color')
            });*/

            // Set visible
            $tips.show().attr('aria-hidden', 'false');
	
            if ($.support.cssFloat) {
                $tips.animate({
                    'opacity': this.options.opacity
                }, this.options.speed);
            } else {
                if (!window.XMLHttpRequest) {
                    $tips.css('width', 200);
                }
            }
            
            this._trigger('show');
            
            window.setTimeout(function() {
                /*if (self.options.fixed) {
                    self._position();
                } else {
                    self._locate(e);
                }*/
                
                self._position();
                
                $tips.css('visibility', 'visible');
                
            }, 1);
        },
        
        close : function() {
            return this._end();
        },
		
        /**
		 * Fade Out and hide the tooltip
		 * Restore the original element title
		 * @param {Object} el Element
		 */
        _end: function() {
            var $tips = $('#jce-tooltip'), element = $tips.data('source') || this.element;

            if ($(element).data('title')) {
                // Restore title
                $(element).attr('title', $(element).data('title'));
            }

            // remove aria
            $(element).removeAttr('aria-describedby');			
            // Fade out tooltip and hide			
            $tips.css('visibility', 'hidden').attr('aria-hidden', 'true').hide();
			
            if ($.support.cssFloat) {
                $tips.css('opacity', 0);
            }
            
            this._trigger('hide');
			
            this._unpin();
        },
        
        _cancelOnDrag : function() {
            var self = this;
            
            $(this.element).bind('mousedown', function() {
                $(this).addClass('nohover');
                // hide tooltip
                self._end();
                        
                // Store original title and remove
                $(this).data('title',  $(this).attr('title')).attr('title', '');
      
            }).bind('mouseup', function() {
                $(this).removeClass('nohover');
                        
                // Restore title
                $(this).attr('title', $(this).data('title'));
            });
        },
		
        _pin : function() {
            var self = this;
            
            $('#jce-tooltip').addClass('sticky');
            $('span.ui-icon-close', '#jce-tooltip').show();
            
            // add blur handler
            $(window).on('click.tooltip-blur', function(e) {                
                var el = $(self.element).get(0), n = e.target;
                
                if (n == el || (el.nodeName == 'LABEL' && $(el).attr('for') && n == $('#' + $(el).attr('for')).get(0)) || n == $('#jce-tooltip').get(0)) {
                    return;
                }
                    
                if ($(n).parents('#jce-tooltip').length === 0) {
                    self._end();
                }
            });
        },
		
        _unpin : function() {
            $('#jce-tooltip').removeClass('sticky');
            $('span.ui-icon-close', '#jce-tooltip').hide();
            
            $(window).off('click.tooltip-blur');
        },
		
        _position: function() {
            var $tips       = $('#jce-tooltip');
            var $pointer    = $('.jce-tooltip-pointer', $tips);
            var o           = this.options.offsets;	
			
            var tip = {
                'width'  : $tips.outerWidth(),
                'height' : $tips.outerHeight()
            };

            // reset
            $($pointer).attr('style', '');
            
            // get position
            var position = this.options.position;
            
            // remove center
            var at = position.replace(/\s*center\s*/, '');
            
            // flip position
            var my = at.replace(/(left|right|top|bottom)/, function(s) {
               switch(s) {
                   case 'left':
                       return 'right-' + o.x;
                       break;
                   case 'right':
                       return 'left+' + o.x;
                       break; 
                   case 'top':
                       return 'bottom-' + o.y;
                       break;
                   case 'bottom':
                       return 'top+' + o.y;
                       break;
               }
            });
            
            // get window dimensions
            var pos = {}, ww = Math.round($(window).width()), wh = Math.round($(window).height()), pw = 10, ph = 10, st = $(window).scrollTop();

            $tips.position({
                my  : my,
                at  : at,
                of  : $(this.element),
                collision : 'flipfit flipfit',
                using : function(props, fb) {                                                            
                    if (Math.round(props.top) == 0) {
                        props.top += 10;
                    }
                    
                    if (Math.round(props.left) == 0) {
                        props.left += 10;
                    }
                    
                    if (Math.round(props.top + tip.height) == wh) {
                        props.top -= 10;
                    }
                    
                    if (Math.round(props.left + tip.width) == ww) {
                        props.left -= 10;
                    }
                    
                    // re-position pointer
                    if (/left|right/.test(position)) {                                                
                        $pointer.css('top', Math.round(fb.target.top - fb.element.top) + fb.target.height / 2);
                    }

                    if (/top|bottom/.test(position) && Math.round(fb.element.left) == 0) {                        
                        $pointer.css('left', fb.target.left + Math.round(fb.target.width / 2) - pw);
                    }
                    
                    if (fb.element.left < fb.target.left) {
                        position = position.replace('right', 'left');
                    } else {
                        position = position.replace('left', 'right');
                    }
                    
                    if (fb.element.top < fb.target.top) {
                        position = position.replace('bottom', 'top');
                    } else {
                        position = position.replace('top', 'bottom');
                    }

                    $tips.css(props);
                }
            });
            
            // set pointer
            $pointer.removeClass('top right bottom left center').addClass(position);
            
            // create pointer    
            /*if ($.support.canvas) {
                this._createPointer(position);
            }*/
        },
		
        _createPointer : function(position) {
            var $tips = $('#jce-tooltip'), canvas = $('canvas', $tips).get(0), context = canvas.getContext('2d');
			
            var w = canvas.width, h = canvas.height;
			
            // clear context
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Set the style properties.
            context.fillStyle   = $tips.css('background-color');
            context.strokeStyle = $tips.css('border-top-color');
            context.lineWidth   = 1.8;

            context.beginPath();
            
            var pos = /(top|bottom|left|right)/.exec(position) || ['', 'top'];
		
            switch(pos[1]) {
                case 'top':
                    context.moveTo(0, 0);
                    context.lineTo(w/2, h);
                    context.lineTo(w, 0);
                    break;
                case 'bottom':
                    context.moveTo(0, h);
                    context.lineTo(w/2, 0);
                    context.lineTo(w, h);
                    break;
                case 'left':
                    context.moveTo(0, 0);
                    context.lineTo(w, h/2);
                    context.lineTo(0, h);
                    break;
                case 'right':
                    context.moveTo(w, 0);
                    context.lineTo(0, h/2);
                    context.lineTo(w, h);
                    break;
            }    

            context.fill();
            context.stroke();
            context.closePath();
        },
		
        /**
		 * Position the tooltip
		 * @param {Object} e Event trigger
		 */
        _locate: function(e) {
            this._createTips();

            var $tips 	= $('#jce-tooltip');
            var o 	= this.options.offsets;
			
            var page = {
                'x': e.pageX,
                'y': e.pageY
            };
			
            var tip = {
                'x': $tips.outerWidth(),
                'y': $tips.outerHeight()
            };
			
            var offset = $(e.target).offset();
			
            var pos = {
                'x': page.x + o.x,
                'y': page.y + o.y
            };
			
            var position 	= this.options.position;
            var scrollTop 	= $(document).scrollTop();
			
            // Switch from bottom to top
            if ((pos.y - tip.y) < 0 || offset.top < (scrollTop + tip.y)) {
                $tips.removeClass('jce-' + this.options.className + '-top');
                position = position.replace('top', 'bottom');
                $tips.addClass('jce-' + this.options.className + '-bottom');
            } else {
                $tips.removeClass('jce-' + this.options.className + '-bottom');
                position = position.replace('bottom', 'top');
                $tips.addClass('jce-' + this.options.className + '-top');
            }

            switch (position) {
                case 'top center':
                    pos.x = (page.x - Math.round((tip.x / 2))) + o.x;
                    pos.y = (page.y - tip.y) - o.y;
                    break;
                case 'bottom center':
                    pos.x = (page.x - (tip.x/2)) + o.x;
                    pos.y = page.y + o.y;
                    break;
            }
			
            // nudge right or left
            if (pos.x < 0) { 
                pos.x = 5;
            }
			
            if (pos.x > parseFloat($(window).width())) {
                pos.x = parseFloat($(window).width()) - (tip.x / 2 + 5);
            }

            $tips.css({
                top : pos.y,
                left: pos.x
            });
        },
		
        destroy: function() {
            $.Widget.prototype.destroy.apply( this, arguments );
        }
    });
	
    $.extend($.ui.tips, {
        version: "@@version@@"
    });
})(jQuery);
