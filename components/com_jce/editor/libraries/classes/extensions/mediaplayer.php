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

wfimport('editor.libraries.classes.extensions');

class WFMediaPlayerExtension extends WFExtension {

    protected static $instance;

    /**
     * @access  protected
     */
    public function __construct($config = array()) {
        $default = array(
            'name' => '',
            'title' => '',
            'params' => array()
        );

        $config = array_merge($default, $config);

        parent::__construct($config);
    }

    /**
     * Returns a reference to a manager object
     *
     * This method must be invoked as:
     *    <pre>  $manager =MediaManager::getInstance();</pre>
     *
     * @access  public
     * @return  MediaManager  The manager object.
     * @since 1.5
     */
    public static function getInstance($name = '') {
        if (!isset(self::$instance)) {
            self::$instance = new WFMediaPlayerExtension();
        }

        return self::$instance;
    }

    public function isEnabled() {
        return false;
    }

    public function getName() {
        return $this->get('name');
    }

    public function getTitle() {
        return $this->get('title');
    }

    public function getParams() {
        return $this->params;
    }

    /**
     * 
     * @param object $player
     * @return 
     */
    public function loadTemplate($tpl = '') {
        return '';
    }
}