<?php

/**
 * @package     JCE
 * @subpackage  System.jce
 *
 * @copyright   Copyright (C) 2015 Ryan Demmer. All rights reserved.
 * @copyright   Copyright (C) 2005 - 2014 Open Source Matters, Inc. All rights reserved.
 * @license     GNU General Public License version 2 or later
 */
defined('JPATH_BASE') or die;

/**
 * JCE
 *
 * @package     JCE
 * @subpackage  System.jce
 * @since       2.5.5
 */
class PlgSystemJce extends JPlugin {

    /**
     * Constructor
     *
     * @param   object  &$subject  The object to observe
     * @param   array   $config    An array that holds the plugin configuration
     *
     * @since   1.5
     */
    public function __construct(& $subject, $config) {
        parent::__construct($subject, $config);
    }

    protected function getLink() {
        require_once(JPATH_ADMINISTRATOR . '/components/com_jce/helpers/browser.php');

        $link = WFBrowserHelper::getMediaFieldLink('', 'images');

        return $link;
    }

    public function onAfterDispatch() {
        $version = new JVersion;

        if (!$version->isCompatible('3.4')) {
            return true;
        }

        $document = JFactory::getDocument();
        $document->addScriptDeclaration('(function($){$(window).ready(function(){$(".wf-media-input").removeAttr("readonly");});})(jQuery);');
    }

    /**
     * adds additional fields to the user editing form
     *
     * @param   JForm  $form  The form to be altered.
     * @param   mixed  $data  The associated data for the form.
     *
     * @return  boolean
     *
     * @since   1.6
     */
    public function onContentPrepareForm($form, $data) {
        $version = new JVersion;

        if (!$version->isCompatible('3.4')) {
            return true;
        }

        if (!($form instanceof JForm)) {
            $this->_subject->setError('JERROR_NOT_A_FORM');

            return false;
        }
        
        // get form name.
        $name = $form->getName();

        $valid = array(
            'com_content.article', 
            'com_categories.categorycom_content', 
            'com_templates.style', 
            'com_tags.tag', 
            'com_banners.banner', 
            'com_contact.contact', 
            'com_newsfeeds.newsfeed'
        );

        // only allow some forms :(
        if (!in_array($name, $valid)) {
            return true;
        }

        $config = JFactory::getConfig();
        $user = JFactory::getUser();

        if ($user->getParam('editor', $config->get('editor')) !== "jce") {
            return true;
        }

        if (!JPluginHelper::getPlugin('editors', 'jce')) {
            return true;
        }

        $link = $this->getLink();

        if ($link) {
            $fields = $form->getFieldset();

            foreach ($fields as $field) {
                $type = $field->getAttribute('type');

                if (strtolower($type) === "media") {
                    $name   = $field->getAttribute('name');
                    $group  = (string) $field->group;
                    $form->setFieldAttribute($name, 'link', $link, $group);
                    $form->setFieldAttribute($name, 'class', 'input-large wf-media-input', $group);
                }
            }
        }

        return true;
    }
}