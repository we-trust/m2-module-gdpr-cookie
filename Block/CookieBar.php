<?php
/**
 * @author Amasty Team
 * @copyright Copyright (c) 2021 Amasty (https://www.amasty.com)
 * @package Amasty_GdprCookie
 */


declare(strict_types=1);

namespace Wetrust\GdprCookie\Block;

use Amasty\GdprCookie\Model\ConfigProvider;
use Amasty\GdprCookie\Model\CookiePolicy;
use Magento\Cms\Model\Template\Filter as CmsTemplateFilter;
use Magento\Framework\Serialize\Serializer\Json;
use Magento\Framework\UrlInterface;
use Magento\Framework\View\Element\Template;

class CookieBar extends \Amasty\GdprCookie\Block\CookieBar
{
    /**
     * @var ConfigProvider
     */
    private $configProvider;

    /**
     * @var CmsTemplateFilter
     */
    private $cmsTemplateFilter;

    /**
     * @var Json
     */
    private $jsonSerializer;

    public function __construct(
        ConfigProvider $configProvider,
        Template\Context $context,
        Json $jsonSerializer,
        CmsTemplateFilter $cmsTemplateFilter,
        CookiePolicy $cookiePolicy,
        array $data = []
    ) {
        $this->setTemplate('Wetrust_GdprCookie::cookiebar.phtml');
        parent::__construct($configProvider, $context, $jsonSerializer, $cmsTemplateFilter, $cookiePolicy, $data);
        $this->configProvider = $configProvider;
        $this->cmsTemplateFilter = $cmsTemplateFilter;
        $this->jsonSerializer = $jsonSerializer;
    }

    /**
     * @return int
     */
    public function getCookiePolicyDisableSettings()
    {
        return $this->configProvider->getCookiePolicyDisableSettings();
    }

    /**
     * @return string
     */
    public function getTitleTextGeneral()
    {
        return $this->configProvider->getTitleTextGeneral();
    }

    /**
     * @return string
     */
    public function getNotificationTextGeneral()
    {
        $text = $this->cmsTemplateFilter->filter($this->configProvider->getNotificationTextGeneral());

        return $this->jsonSerializer->serialize($text);
    }

    /**
     * @return string
     */
    public function getTitleTextCustom()
    {
        return $this->configProvider->getTitleTextCustom();
    }

    /**
     * @return string
     */
    public function getNotificationTextCustom()
    {
        $text = $this->cmsTemplateFilter->filter($this->configProvider->getNotificationTextCustom());

        return $this->jsonSerializer->serialize($text);
    }
}
