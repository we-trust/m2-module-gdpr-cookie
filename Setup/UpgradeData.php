<?php 
namespace Wetrust\GdprCookie\Setup;
  
use Magento\Framework\Setup\UpgradeDataInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Framework\Setup\ModuleContextInterface;
 
class UpgradeData implements UpgradeDataInterface
{
    public function upgrade(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $setup->startSetup();
 
        /** 
         * \Magento\Framework\DB\Adapter\AdapterInterface 
         */
        $conn = $setup->getConnection(); 
 
        $tableName = $setup->getTable('amasty_gdprcookie_group');
        
        if($conn->isTableExists($tableName) != false){
        
            /**
             * Inserting data using the DB Adapter class
             */
            $data = [
                    [
                        'name' => 'Strictly Necessary Cookies',
                        'description' => 'These cookies are necessary for the website to function and cannot be deactivated. They are usually set to provide a service you have requested, such as personalising your privacy preferences, logging in or filling in forms.',
                        'is_essential' => '1',
                        'is_enabled' => '1',
                        'sort_order' => '0'
                    ],
                    [
                        'name' => 'Personalization cookies',
                        'description' => 'These cookies allow the website to offer increased functionality and personalization. They may be defined by {{CLIENT}} or by service providers who enrich the services offered by the website.',
                        'is_essential' => '0',
                        'is_enabled' => '1',
                        'sort_order' => '0'
                    ],
                    [
                        'name' => 'Targeting cookies',
                        'description' => 'These cookies allow {{CLIENT}} to count visits and traffic sources so the performance of the site can be measured and improved.',
                        'is_essential' => '0',
                        'is_enabled' => '1',
                        'sort_order' => '0'
                    ],
                    [
                        'name' => 'Performance Cookies',
                        'description' => 'These cookies may be set by advertising partners. They are used by these companies to allow {{CLIENT}} to gather some personal information in order to display targeted advertisements based on topics that seem to be of interest to you.',
                        'is_essential' => '0',
                        'is_enabled' => '1',
                        'sort_order' => '0'
                    ]
            ];

            

            $conn->insertMultiple($tableName, $data);

        }   
         
        $setup->endSetup();
    }
}