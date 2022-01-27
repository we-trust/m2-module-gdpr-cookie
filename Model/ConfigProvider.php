<?php

namespace Wetrust\GdprCookie\Model;

use Amasty\GdprCookie\Model\Config\Source\CookiePolicyBarStyle;

class ConfigProvider extends \Amasty\GdprCookie\Model\ConfigProvider
{

    const COOKIE_POLICY_DISABLE_SETTINGS = 'cookie_policy/disable_settings';
    const TITLE_TEXT_GENERAL = 'cookie_bar_customisation/title_text_general';
    const NOTIFICATION_TEXT_GENERAL = 'cookie_bar_customisation/notification_text_general';
    const TITLE_TEXT_CUSTOM = 'cookie_bar_customisation/title_text_custom';
    const NOTIFICATION_TEXT_CUSTOM = 'cookie_bar_customisation/notification_text_custom';
    const FORBIDDEN_COUNTRIES_PATH = 'cookie_policy/forbid_countries';
    const GEO_IP_COUNTRY_PATH = 'cookie_policy/geoip_country';

    protected $pathPrefix = 'amasty_gdprcookie/';

    /**
     * @param null $scopeCode
     * @return int
     */
    public function getCookiePolicyDisableSettings($scopeCode = null)
    {
        return (int)$this->getValue(self::COOKIE_POLICY_DISABLE_SETTINGS, $scopeCode);
    }

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

    /**
     * @return false|string[]
     */
    public function getForbiddenCountriesConfig($scopeCode = null)
    {
        return (string)$this->getValue(self::FORBIDDEN_COUNTRIES_PATH, $scopeCode);
    }

    /**
     * @param null|string $scopeCode
     *
     * @return null|string
     */
    public function getGeoIpCountryUrl($scopeCode = null)
    {
        return (string)$this->getValue(self::GEO_IP_COUNTRY_PATH, $scopeCode);
    }
}
