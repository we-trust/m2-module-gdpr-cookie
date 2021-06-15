<?php

namespace Wetrust\GdprCookie\Block\Widget;

use Amasty\GdprCookie\Model\ConfigProvider;
use Amasty\GdprCookie\Model\Cookie;
use Amasty\GdprCookie\Model\CookieGroup;
use Amasty\GdprCookie\Model\CookiePolicy;
use Amasty\GdprCookie\Model\Cookie\CookieData;
use Magento\Framework\DataObject\IdentityInterface;
use Magento\Widget\Block\BlockInterface;

class Settings extends \Amasty\GdprCookie\Block\Widget\Settings implements BlockInterface, IdentityInterface
{
    /**
     * @var ConfigProvider
     */
    private $configProvider;

    /**
     * @var CookieData
     */
    private $cookieData;

    /**
     * @var CookiePolicy
     */
    private $cookiePolicy;

    public function __construct(
        ConfigProvider $configProvider,
        CookieData $cookieData,
        \Magento\Framework\View\Element\Template\Context $context,
        CookiePolicy $cookiePolicy,
        array $data = []
    ) {
        $this->setTemplate('Wetrust_GdprCookie::widget/settings.phtml');
        parent::__construct($configProvider, $cookieData, $context, $cookiePolicy, $data);
        $this->configProvider = $configProvider;
        $this->cookieData = $cookieData;
        $this->cookiePolicy = $cookiePolicy;
    }

    public function getIdentities()
    {
        // TODO: Implement getIdentities() method.
    }
}
