<?php
/**
 * @author Amasty Team
 * @copyright Copyright (c) 2021 Amasty (https://www.amasty.com)
 * @package Amasty_GdprCookie
 */


namespace Wetrust\GdprCookie\Controller\Cookie;

use Magento\Framework\Controller\Result\RawFactory;
use Amasty\GdprCookie\Api\CookieManagementInterface;
use Amasty\GdprCookie\Model\Consent\AllowedGroupFormatter;
use Amasty\GdprCookie\Model\CookieManager;
use Amasty\GdprCookie\Model\CookieConsentLogger;
use Magento\Customer\Model\Session;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Message\ManagerInterface;
use Magento\Store\Model\StoreManagerInterface;
use Amasty\GdprCookie\Model\ResourceModel\CookieGroup\CollectionFactory as GroupCollectionFactory;
use Magento\Framework\Controller\Result\JsonFactory;

class SaveGroups extends \Amasty\GdprCookie\Controller\Cookie\SaveGroups
{
    /**
     * @var RequestInterface
     */
    private $request;

    /**
     * @var CookieManager
     */
    private $cookieManager;

    /**
     * @var Session
     */
    private $session;

    /**
     * @var RawFactory
     */
    private $rawFactory;

    /**
     * @var CookieConsentLogger
     */
    private $consentLogger;

    /**
     * @var StoreManagerInterface
     */
    private $storeManager;

    /**
     * @var ManagerInterface
     */
    private $messageManager;

    /**
     * @var AllowedGroupFormatter
     */
    private $allowedStatusFormatter;

    /**
     * @var CookieManagementInterface
     */
    private $cookieManagement;

    /**
     * @var GroupCollectionFactory
     */
    private $groupCollectionFactory;

    /**
     * @var JsonFactory
     */
    private $resultJsonFactory;

    public function __construct(
        RequestInterface $request,
        Session $session,
        RawFactory $rawFactory,
        StoreManagerInterface $storeManager,
        CookieManager $cookieManager,
        ManagerInterface $messageManager,
        CookieConsentLogger $consentLogger,
        AllowedGroupFormatter $allowedStatusFormatter,
        CookieManagementInterface $cookieManagement,
        GroupCollectionFactory $groupCollectionFactory,
        JsonFactory $resultJsonFactory
    ) {
        $this->request = $request;
        $this->session = $session;
        $this->rawFactory = $rawFactory;
        $this->storeManager = $storeManager;
        $this->cookieManager = $cookieManager;
        $this->consentLogger = $consentLogger;
        $this->messageManager = $messageManager;
        $this->allowedStatusFormatter = $allowedStatusFormatter;
        $this->cookieManagement = $cookieManagement;
        $this->groupCollectionFactory = $groupCollectionFactory;
        $this->resultJsonFactory = $resultJsonFactory;
        parent::__construct($request, $session, $rawFactory, $storeManager, $cookieManager, $messageManager, $consentLogger, $allowedStatusFormatter, $cookieManagement);
    }

    public function execute()
    {
        $response = $this->rawFactory->create();
        $storeId = (int)$this->storeManager->getStore()->getId();
        $allowedCookieGroupIds = (array)$this->request->getParam('groups');
        $allowedAll = (bool)$this->request->getParam('all');
        $resultJson = $this->resultJsonFactory->create();

        if($allowedAll) {
            $groupCollection = $this->groupCollectionFactory->create();
            foreach($groupCollection as $group) {
                $allowedCookieGroupIds[] = $group->getId();
            }
        }

        if (!$allowedCookieGroupIds) {
            $rejectedCookieNames = array_map(function ($cookie) {
                return $cookie->getName();
            }, $this->cookieManagement->getCookies($storeId));
            $this->cookieManager->deleteCookies($rejectedCookieNames);
            $this->cookieManager->updateAllowedCookies(CookieManager::ALLOWED_NONE);

            if ($customerId = $this->session->getCustomerId()) {
                $this->consentLogger->logCookieConsent(
                    $customerId,
                    __('None cookies allowed')
                );
            }

            return $resultJson->setData(['data' => array()]);
        }

        if ($customerId = $this->session->getCustomerId()) {
            $consentStatus = $this->allowedStatusFormatter->format($storeId, $allowedCookieGroupIds);

            $this->consentLogger->logCookieConsent(
                $customerId,
                $consentStatus
            );
        }

        $rejectedCookieNames = array_map(function ($cookie) {
            return $cookie->getName();
        }, $this->cookieManagement->getNotAssignedCookiesToGroups($storeId, $allowedCookieGroupIds));
        $this->cookieManager->deleteCookies($rejectedCookieNames);
        $this->cookieManager->updateAllowedCookies(implode(',', $allowedCookieGroupIds));

        return $resultJson->setData(['data' => $allowedCookieGroupIds]);
    }
}
