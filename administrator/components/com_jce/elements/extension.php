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
 * Renders a text element
 *
 * @package 	JCE
 */
class WFElementExtension extends WFElement {

    /**
     * Element name
     *
     * @access	protected
     * @var		string
     */
    var $_name = 'Extension';

    private function mapValue($value) {
      $data = array();

      if (strpos($value, "=") === false) {
          return array("" => $value);
      }

      foreach (explode(';', $value) as $group) {
          $items = explode("=", $group);

          if (substr(trim($group), 0, 1) === '-') {
            array_walk($items, function(&$item) {
                $item = "-" . $item;
            });
          }

          $data[$items[0]] = $items[1];
      }

      return $data;
    }

    private function cleanValue($value) {
      $data = $this->mapValue($value);
      // get array values only
      $values = array_values($data);
      // convert to string
      $string = implode(",", $values);
      // return single array
      return explode(",", $string);
    }

    private function mapIcon($name) {
      return $name;
    }

    function fetchElement($name, $value, &$node, $control_name) {
        $value    = htmlspecialchars_decode($value, ENT_QUOTES);
        $class    = ((string) $node->attributes()->class ? 'class="' . (string) $node->attributes()->class . '"' : '' );

        // default extensions list
        $default  = (string) $node->attributes()->default;
        // create default array
        $default  = $this->cleanValue($default);

        if (!empty($value)) {
          $data   = $this->cleanValue($value);
        }

        $output = array();

        $output[] = '<div class="extensions">';
        $output[] = '<input type="text" name="' . $control_name . '[' . $name . ']" id="' . $control_name . $name . '" value="' . $value . '" ' . $class . ' /><button class="btn btn-link extension_edit"><span class="icon-apply"></span></button>';
        $output[] = '<ul>';

        foreach ($data as $item) {
            $custom = array();

              $checked = '';

              $item = strtolower($item);

              if (empty($value) || in_array($item, $default)) {
                  $checked = ' checked="checked"';
              }

              // clear minus sign
              $item = str_replace("-", "", $item);

              if (in_array($item, $default)) {
                $output[] = '<li><input type="checkbox" value="' . $item . '"' . $checked . ' /><span class="file ' . $item . '"></span><label>' . $item . '</label></li>';
              } else {
                $custom[] = '<li class="extension-custom"><span class="file ' . $item . '"></span><input type="text" value="' . $item . '" pattern="[a-zA-Z0-9]{2,4}" placeholder="' . WFText::_('WF_EXTENSION_MAPPER_TYPE_NEW', 'Add new type...') . '" /><button class="btn btn-link extension-add"><span class="icon-plus-2"></span></button><button class="btn btn-link extension-remove"><span class="icon-trash"></span></button></li>';
              }
        }
        $output[] = implode("", $custom);
        $output[] = '<li class="extension-custom"><span class="file"></span><input type="text" value="" pattern="[a-zA-Z0-9]{2,4}" placeholder="' . WFText::_('WF_EXTENSION_MAPPER_TYPE_NEW', 'Add new type...') . '" /><button class="btn btn-link extension-add"><span class="icon-plus-2"></span></button><button class="btn btn-link extension-remove"><span class="icon-trash"></span></button></li>';

        $output[] = '</ul>';
        $output[] = '</div>';

        return implode("\n", $output);
    }

}

?>
