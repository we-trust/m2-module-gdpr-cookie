<?php

namespace Wetrust\GdprCookie\Controller\Cookie;

use Amasty\GdprCookie\Api\CookieManagementInterface;
use Amasty\GdprCookie\Model\CookieConsentLogger;
use Amasty\GdprCookie\Model\CookieManager;
use Magento\Customer\Model\Session;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Controller\Result\Json;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\Message\ManagerInterface;
use Magento\Store\Model\StoreManagerInterface;

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
     * @var CookieManagementInterface
     */
    private $cookieManagement;

    /**
     * @var ResultFactory
     */
    protected $resultFactory;

    public function __construct(
        RequestInterface $request,
        Session $session,
        StoreManagerInterface $storeManager,
        CookieManager $cookieManager,
        ManagerInterface $messageManager,
        CookieConsentLogger $consentLogger,
        CookieManagementInterface $cookieManagement,
        ResultFactory $resultFactory
    ) {
        $this->request = $request;
        $this->session = $session;
        $this->storeManager = $storeManager;
        $this->cookieManager = $cookieManager;
        $this->consentLogger = $consentLogger;
        $this->messageManager = $messageManager;
        $this->cookieManagement = $cookieManagement;
        $this->resultFactory = $resultFactory;
        parent::__construct(
            $request,
            $session,
            $storeManager,
            $cookieManager,
            $messageManager,
            $consentLogger,
            $cookieManagement,
            $resultFactory
        );
    }

    public function execute()
    {
        /** @var Json $response */
        $response = $this->resultFactory->create(ResultFactory::TYPE_JSON);
        $result = [];
        $storeId = (int)$this->storeManager->getStore()->getId();
        $allowedCookieGroupIds = (array)$this->request->getParam('groups');
        $allowedAll = $this->request->getParam('all');
        $customerId = (int)$this->session->getCustomerId();

        if ($allowedAll) {
            $groupCollection = $this->cookieManagement->getGroups();
            foreach ($groupCollection as $group) {
                $allowedCookieGroupIds[] = $group->getId();
            }
        }

        if (!$allowedCookieGroupIds) {
            $rejectedCookieNames = array_map(function ($cookie) {
                return $cookie->getName();
            }, $this->cookieManagement->getCookies($storeId));
            $this->cookieManager->deleteCookies($rejectedCookieNames);
            $this->cookieManager->updateAllowedCookies(CookieManager::ALLOWED_NONE);

            $this->consentLogger->logCookieConsent($customerId);
            $result['data'] = [];
            $result['success'] = true;

            return $response->setData($result);
        }

        $this->consentLogger->logCookieConsent($customerId, $allowedCookieGroupIds);

        $rejectedCookieNames = array_map(function ($cookie) {
            return $cookie->getName();
        }, $this->cookieManagement->getNotAssignedCookiesToGroups($storeId, $allowedCookieGroupIds));
        $this->cookieManager->deleteCookies($rejectedCookieNames);
        $this->cookieManager->updateAllowedCookies(implode(',', $allowedCookieGroupIds));
        $result['data'] = $allowedCookieGroupIds;
        $result['success'] = true;

        return $response->setData($result);
    }
}
