<?php

declare(strict_types=1);

namespace Wetrust\GdprCookie\Model\Layout\Modal;

use Amasty\GdprCookie\Model\Layout\LayoutProcessorInterface;
use Magento\Framework\Stdlib\ArrayManager;

class CookieSettings implements LayoutProcessorInterface
{
    public const COMPONENT_NAME = 'wetrust-gdpr-cookie-settings-modal';
    public const COMPONENT_JS = 'Wetrust_GdprCookie/js/modal/cookie-settings';
    protected const LOCATION_PATH_IN_LAYOUT = 'jsComponents/components/gdpr-cookie-modal';

    /**
     * @var ArrayManager
     */
    protected ArrayManager $arrayManager;

    public function __construct(
        ArrayManager $arrayManager
    ) {
        $this->arrayManager = $arrayManager;
    }

    public function process(array $jsLayout): array
    {
        $mainModal = $this->arrayManager->get(self::LOCATION_PATH_IN_LAYOUT, $jsLayout);
        if (!$mainModal) {
            return $jsLayout;
        }

        $component = [
            self::COMPONENT_NAME => [
                'component' => self::COMPONENT_JS,
            ]
        ];

        $mainModal['children'] = $component;

        return $this->arrayManager->set(
            self::LOCATION_PATH_IN_LAYOUT,
            $jsLayout,
            $mainModal
        );
    }
}
