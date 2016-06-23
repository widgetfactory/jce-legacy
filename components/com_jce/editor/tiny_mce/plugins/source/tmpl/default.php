<?php

/**
 * @copyright 	Copyright (c) 2009-2016 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('_JEXEC') or die('RESTRICTED');
?>
<div class="source-editor">
  <div class="ui-navbar ui-navbar-attached">
    <div class="ui-navbar-content ui-padding-remove">
        <button class="ui-button" data-action="undo" title="<?php echo WFText::_('WF_SOURCE_UNDO', 'Undo');?>"><i class="ui-icon ui-icon-undo"></i></button>
        <button class="ui-button" data-action="redo" title="<?php echo WFText::_('WF_SOURCE_REDO', 'Redo');?>"><i class="ui-icon ui-icon-redo"></i></button>

        <button class="ui-button ui-button-checkbox" data-action="highlight" title="<?php echo WFText::_('WF_SOURCE_HIGHLIGHT', 'Highlight');?>"><i class="ui-icon ui-icon-highlight"></i></button>
        <button class="ui-button ui-button-checkbox" data-action="linenumbers" title="<?php echo WFText::_('WF_SOURCE_LINENUMBERS', 'Line Numbers');?>"><i class="ui-icon ui-icon-linenumbers"></i></button>
        <button class="ui-button ui-button-checkbox" data-action="wrap" title="<?php echo WFText::_('WF_SOURCE_WRAP', 'Wrap Lines');?>"><i class="ui-icon ui-icon-wrap"></i></button>
        <button class="ui-button" data-action="format" title="<?php echo WFText::_('WF_SOURCE_FORMAT', 'Format Code');?>"><i class="ui-icon ui-icon-format"></i></button>

        <button class="ui-button ui-button-checkbox" data-action="fullscreen" title="<?php echo WFText::_('WF_SOURCE_FULLSCREEN', 'Fullscreen');?>"><i class="ui-icon ui-icon-fullscreen"></i></button>
    </div>
    <div class="ui-navbar-content ui-navbar-flip ui-padding-left-remove">
      <div class="ui-form ui-margin-remove ui-display-inline-block">
        <input id="source_search_value" placeholder="<?php echo WFText::_('WF_SOURCE_SEARCH', 'Search');?>" type="text" />
        <button class="ui-button" data-action="search" title="<?php echo WFText::_('WF_SOURCE_SEARCH', 'Search');?>"><i class="ui-icon ui-icon-search"></i></button>
        <button class="ui-button" data-action="search-previous" title="<?php echo WFText::_('WF_SOURCE_SEARCH_PREV', 'Search Previous');?>"><i class="ui-icon ui-icon-search-previous"></i></button>
      </div>

        <div class="ui-form ui-margin-remove ui-display-inline-block">
          <input id="source_replace_value" placeholder="<?php echo WFText::_('WF_SOURCE_REPLACE', 'Replace');?>" type="text" />
          <button class="ui-button" data-action="replace" title="<?php echo WFText::_('WF_SOURCE_REPLACE', 'Replace');?>"><i class="ui-icon ui-icon-replace"></i></button>
          <button class="ui-button" data-action="replace-all" title="<?php echo WFText::_('WF_SOURCE_REPLACE_ALL', 'Replace All');?>"><i class="ui-icon ui-icon-replace-all"></i></button>
          <label><input type="checkbox" id="source_search_regex" /><?php echo WFText::_('WF_SOURCE_SOURCE_REGEX', 'Regular Expression');?></label>
        </div>
    </div>
  </div>
  <div class="source-editor-container"></div>
</div>
