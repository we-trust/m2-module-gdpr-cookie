<?php
namespace Wetrust\GdprCookie\Controller\Cookie;

use Amasty\GdprCookie\Api\CookieManagementInterface;
use Amasty\GdprCookie\Model\CookieManager;
use Amasty\GdprCookie\Model\CookieConsentLogger;
use Magento\Customer\Model\Session;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Message\ManagerInterface;
use Magento\Store\Model\StoreManagerInterface;
use Amasty\GdprCookie\Model\ResourceModel\CookieGroup\CollectionFactory as GroupCollectionFactory;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Controller\ResultFactory;

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
        StoreManagerInterface $storeManager,
        CookieManager $cookieManager,
        ManagerInterface $messageManager,
        CookieConsentLogger $consentLogger,
        CookieManagementInterface $cookieManagement,
        GroupCollectionFactory $groupCollectionFactory,
        JsonFactory $resultJsonFactory,
        ResultFactory $resultFactory
    ) {
        $this->request = $request;
        $this->session = $session;
        $this->storeManager = $storeManager;
        $this->cookieManager = $cookieManager;
        $this->consentLogger = $consentLogger;
        $this->cookieManagement = $cookieManagement;
        $this->groupCollectionFactory = $groupCollectionFactory;
        $this->resultJsonFactory = $resultJsonFactory;
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
        $response = $this->resultFactory->create(ResultFactory::TYPE_JSON);
        $result = [];
        $storeId = (int)$this->storeManager->getStore()->getId();
        $allowedCookieGroupIds = (array)$this->request->getParam('groups');
        $allowedAll = (bool)$this->request->getParam('all');

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

            return $response->setData(['data' => $result]);
        }

        if ($customerId = $this->session->getCustomerId()) {
            $this->consentLogger->logCookieConsent($customerId, $allowedCookieGroupIds);
        }

        $rejectedCookieNames = array_map(function ($cookie) {
            return $cookie->getName();
        }, $this->cookieManagement->getNotAssignedCookiesToGroups($storeId, $allowedCookieGroupIds));
        $this->cookieManager->deleteCookies($rejectedCookieNames);
        $this->cookieManager->updateAllowedCookies(implode(',', $allowedCookieGroupIds));
        $result = $allowedCookieGroupIds;

        return $response->setData(['data' => $result]);
    }
}
