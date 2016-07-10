<?php

/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2016 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('JPATH_BASE') or die('RESTRICTED');

/**
 * Renders a select element
 */
class WFElementPopups extends WFElement {

    /**
     * Element type
     *
     * @access	protected
     * @var		string
     */
    var $_name = 'Popups';

    public function fetchElement($name, $value, &$node, $control_name) {
        jimport('joomla.filesystem.folder');
        jimport('joomla.filesystem.file');

        $language = JFactory::getLanguage();

        // "Default" list
        if ($name == 'default') {
            // path to directory
            $path = WF_EDITOR_EXTENSIONS . '/popups';

            $filter = '\.xml$';
            $files  = JFolder::files($path, '\.xml', false, true);

            // get all installed plugins
            $installed = JPluginHelper::getPlugin('jce');

            if (!empty($installed)) {
                foreach ($installed as $p) {
                    // check for delimiter, only load "extensions"
                    if (strpos($p->name, 'popups-') !== false) {
                        $path = JPATH_PLUGINS . '/jce/' . $p->name;

                        // Joomla 1.5!!
                        if (!defined('JPATH_PLATFORM')) {
                            $path = JPATH_PLUGINS . '/jce';
                        }

                        $files[] = $path . '/' . $p->name . '.xml';
                    }
                }
            }

            $options = array();
            $options[] = JHTML::_('select.option', '', WFText::_('WF_OPTION_NOT_SET'));

            foreach ($files as $file) {
                if (strpos($file, 'build.xml') !== false) {
                    continue;
                }

                $filename = basename($file, '.xml');
                // get file name without extension type
                $parts    = explode("-", $filename);
                $filename = array_pop($parts);

                // legacy
                $language->load('com_jce_popups_' . $filename, JPATH_SITE);
                // new
                $language->load('plg_jce_popups_' . $filename, JPATH_SITE);

                $xml        = WFXMLHelper::parseInstallManifest($file);
                $options[]  = JHTML::_('select.option', $filename, WFText::_($xml['name']));
            }

            return JHTML::_('select.genericlist', $options, '' . $control_name . '[' . $name . ']', 'class="inputbox plugins-default-select"', 'value', 'text', $value);
        }
    }

}

?>
