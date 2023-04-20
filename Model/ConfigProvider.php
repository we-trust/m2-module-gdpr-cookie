<?php

namespace Wetrust\GdprCookie\Model;

class ConfigProvider extends \Amasty\GdprCookie\Model\ConfigProvider
{
    const TITLE_TEXT_GENERAL = 'cookie_bar_customisation/title_text_general';
    const NOTIFICATION_TEXT_GENERAL = 'cookie_bar_customisation/notification_text_general';
    const TITLE_TEXT_CUSTOM = 'cookie_bar_customisation/title_text_custom';
    const NOTIFICATION_TEXT_CUSTOM = 'cookie_bar_customisation/notification_text_custom';
    protected $pathPrefix = 'amasty_gdprcookie/';

    /**
     * @param null|string $scopeCode
     *
     * @return null|string
     */
    public function getTitleTextGeneral($scopeCode = null)
    {
        return $this->getValue(self::TITLE_TEXT_GENERAL, $scopeCode);
    }

    /**
     * @param null|string $scopeCode
     *
     * @return null|string
     */
    public function getNotificationTextGeneral($scopeCode = null)
    {
        return (string)$this->getValue(self::NOTIFICATION_TEXT_GENERAL, $scopeCode);
    }

    /**
     * @param null|string $scopeCode
     *
     * @return null|string
     */
    public function getTitleTextCustom($scopeCode = null)
    {
        return $this->getValue(self::TITLE_TEXT_CUSTOM, $scopeCode);
    }

    /**
     * @param null|string $scopeCode
     *
     * @return null|string
     */
    public function getNotificationTextCustom($scopeCode = null)
    {
        return (string)$this->getValue(self::NOTIFICATION_TEXT_CUSTOM, $scopeCode);
    }
}
