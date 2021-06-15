/**
 * Cookie bar logic
 */

define([
    'uiCollection',
    'jquery',
    'uiRegistry',
    'underscore',
    'mage/translate',
    'Amasty_GdprCookie/js/model/cookie',
    'Magento_Ui/js/modal/modal',
    'Amasty_GdprCookie/js/action/create-modal',
    'Amasty_GdprCookie/js/action/information-modal',
    'Amasty_GdprCookie/js/action/save',
    'Amasty_GdprCookie/js/action/allow',
    'Amasty_GdprCookie/js/model/cookie-data-provider',
    'Amasty_GdprCookie/js/storage/essential-cookie'
], function (
    Collection,
    $,
    registry,
    _,
    $t,
    cookieModel,
    modal,
    createModal,
    informationModal,
    actionSave,
    actionAllow,
    cookieDataProvider,
    essentialStorage
) {
    'use strict';

    var scrolled = false;

    return Collection.extend({
        defaults: {
            isNotice: 0,
            template: 'Wetrust_GdprCookie/cookiebar',
            allowLink: '/',
            websiteInteraction: null,
            firstShowProcess: '0',
            cookiesName: [],
            domainName: '',
            barSelector: '[data-amcookie-js="bar"]',
            settingsFooterLink: '[data-amcookie-js="footer-link"]',
            settingsGdprLink: '[data-amgdpr-js="cookie-link"]',
            showClass: '-show',
            setupModalTitle: $t('Select Cookies'),
            isScrollBottom: false,
            isPopup: false,
            isDeclineEnabled: false,
            barLocation: null,
            names: {
                setupModal: '.setup-modal',
                cookieTable: '.cookie-table'
            },
            popup: {
                cssClass: 'amgdprcookie-groups-modal'
            },
            setupModal: null
        },

        initialize: function () {
            this._super();

            cookieDataProvider.getCookieData().done(function (cookieData) {
                essentialStorage.update(cookieData);
            });
            cookieModel.deleteDisallowedCookie();
            cookieModel.blockInteraction();
            this.initSettingsLink();
            this.addSettingsListener();

            return this;
        },

        initObservable: function () {
            this._super()
                .observe({
                    isScrollBottom: false
                });

            return this;
        },

        /**
         * Create click event on settings links
         */
        initSettingsLink: function () {
            var elem = $(this.settingsFooterLink + ',' + this.settingsGdprLink);

            $(elem).addClass(this.showClass).on('click', function (event) {
                event.preventDefault();
                this.openModal();
            }.bind(this));
        },

        /**
         * On save callback
         * @param {Object} element
         * @param {Object} modalContext
         */
        saveCookie: function (element, modalContext) {
            this._performSave(element, modalContext);
        },

        allowAllAndClose: function(modalContext) {
            actionAllow().done(function () {

                if (modalContext.closeModal) {
                    $('.amgdprcookie-groups-modal, .modals-overlay').fadeOut(1000);
                    setTimeout(function() { 
                        modalContext.closeModal();
                        $('body').removeClass('_has-modal');
                    }, 1000);
                }

                $('.amgdprcookie-bar-template').fadeOut();

                if (this.websiteInteraction == 1) {
                    cookieModel.restoreInteraction();
                }
            });
        },

        /**
         * Open Setup Cookie Modal
         */
        openModal: function () {
            if (!this.setupModal) {
                this.getModalData();

                return;
            }

            this.setupModal.openModal();
        },

        /**
         * Get Setup Modal Data
         */
        getModalData: function () {
            cookieDataProvider.getCookieData().done(function (cookieData) {
                this.initModal(cookieData);
            }.bind(this));
        },

        /**
         * Create Setup Modal Component
         */
        initModal: function (data) {
            createModal.call(
                this,
                data,
                '',
                this.popup.cssClass,
                false,
                'Wetrust_GdprCookie/cookie-settings',
                this.name + this.names.setupModal,
                this.setupModalTitle
            );

            registry.async(this.name + this.names.setupModal)(function (modal) {
                this.setupModal = modal;
            }.bind(this));
        },

        /**
         * Create/Open Information Modal Component.
         */
        getInformationModal: function (data) {
            informationModal.call(this, this.names.cookieTable, data, this.popup.cssClass);
        },

        /**
         * On allow all cookies callback
         */
        allowCookies: function () {
            actionAllow().done(function () {
                $(this.barSelector).fadeOut();
                cookieModel.triggerAllow();

                if (this.websiteInteraction == 1) {
                    cookieModel.restoreInteraction();
                }
            }.bind(this));
        },

        detectScroll: function () {
            var that = this;

            if (this.barLocation == 1 || this.isPopup) {
                return;
            }

            this.elementBar = $(this.barSelector);
            $(window).on('scroll', _.throttle(this.scrollBottom, 200).bind(this));
        },

        scrollBottom: function () {
            var scrollHeight = window.innerHeight + window.pageYOffset,
                pageHeight = document.documentElement.scrollHeight;

            if (scrollHeight >= pageHeight - this.elementBar.innerHeight()) {
                this.isScrollBottom(true);

                return;
            }

            this.isScrollBottom(false);
        },

        isShowNotificationBar: function () {
            return cookieModel
                .isShowNotificationBar(
                    this.isNotice, this.websiteInteraction, this.firstShowProcess
                );
        },

        declineCookie: function (element, modalContext) {
            var formData = cookieModel.getEssentialGroups();

            this._performSave(element, modalContext, formData);
        },

        _performSave: function (element, modalContext, formData) {
            actionSave(element, formData).done(function () {
                if (modalContext.closeModal) {
                    $('.amgdprcookie-groups-modal, .modals-overlay').fadeOut(1000);
                    setTimeout(function() { 
                        modalContext.closeModal();
                        $('body').removeClass('_has-modal');
                    }, 1000);
                }
            });

            $(this.barSelector).fadeOut();

            if (this.websiteInteraction == 1) {
                cookieModel.restoreInteraction();
            }
        },

        showText: function() {
            // show description content + toggle active class with .prev().find('a') to the 'a' element clicked.
           $('#amgdprcookie-text-' + this.groupId).animate({height: "toggle", opacity: "toggle"}, "200").prev().find('a').toggleClass('active');

        },

        addSettingsListener: function() {
            var that = this;
            $('body').on('click', '.show-gdpr-cookiebar-settings', function() {
                that.openModal();
                $('.amgdprcookie-groups-modal, .modals-overlay').show();
            })
        }

    });
});
