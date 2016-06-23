<?php

/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2015 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('_JEXEC') or die('RESTRICTED');

require_once(WF_EDITOR_LIBRARIES . '/classes/manager.php');

class WFFileBrowserPlugin extends WFMediaManager {
    /*
     * @var string
     */
    protected $_filetypes = 'word=doc,docx;powerpoint=ppt,pptx;excel=xls,xlsx;image=gif,jpeg,jpg,png;acrobat=pdf;archive=zip,tar,gz;flash=swf;winrar=rar;quicktime=mov,mp4,qt;windowsmedia=wmv,asx,asf,avi;audio=wav,mp3,aiff;openoffice=odt,odg,odp,ods,odf;text=rtf,txt,csv';

    public function __construct($config = array()) {
        $config = array(
          'layout' => 'browser',
          'can_edit_images' => 1,
          'show_view_mode' => 1
        );

        parent::__construct($config);

        // get the plugin that opened the file browser
        $caller     = JRequest::getWord('caller', 'browser');
        $filter     = JRequest::getVar('filter', 'files');

        // clean filter value
        $filter = (string) preg_replace('/[^\w_,]/i', '', $filter);

        if ($filter == 'images') {
            $filetypes = 'images=jpg,jpeg,png,gif';
        } else if ($filter === 'media') {
            $filetypes = 'windowsmedia=avi,wmv,wm,asf,asx,wmx,wvx;quicktime=mov,qt,mpg,mpeg,m4a;flash=swf;shockwave=dcr;real=rm,ra,ram;divx=divx;video=mp4,ogv,ogg,webm,flv,f4v;audio=mp3,ogg,wav;silverlight=xap';
        } else if ($filter === 'html') {
            $filetypes = 'html=html,htm,txt';
        } else {
            if (strpos($filter, ',') !== false) {
                $filetypes = 'custom=' . $filter;
            } else {
                $filetypes = $this->get('_filetypes');
            }
        }

        // get filetypes from params
        $filetypes = $this->getParam($caller.'.extensions', $filetypes);

        // set filetypes
        $this->setFileTypes($filetypes);
    }

    /**
     * Display the plugin
     * @access public
     */
    public function display() {
        parent::display();

        if (JRequest::getCmd('dialog') === "editor") {
          return;
        }

        $document = WFDocument::getInstance();
        $settings = $this->getSettings();

        $document->addScript(array('browser'), 'plugins');

        if ($document->get('standalone') == 1) {
            $document->addScript(array('browser.min'), 'component');
            $document->addStyleSheet(array('browser.min'), 'component');

            $element = JRequest::getCmd('element', JRequest::getCmd('fieldid', ''));

            $options = array(
                'plugin' => array(
                    'root' => JURI::root(),
                    'site' => JURI::base(true) . '/'
                ),
                'filebrowser' => $settings,
                'element'     => $element
            );

            $document->addScriptDeclaration('jQuery(document).ready(function($){$.WFBrowserWidget.init(' . json_encode($options) . ');});');

        } else {
            $document->addScriptDeclaration('BrowserDialog.settings=' . json_encode($settings) . ';');
        }
    }
}
