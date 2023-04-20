/**
 * Cookie bar logic
 */

define([
    'uiCollection',
    'jquery',
    'uiRegistry',
    'Amasty_GdprFrontendUi/js/model/cookie',
    'Amasty_GdprFrontendUi/js/action/create-modal',
    'Amasty_GdprFrontendUi/js/action/information-modal',
    'Amasty_GdprFrontendUi/js/action/save',
    'Amasty_GdprFrontendUi/js/action/allow',
    'Amasty_GdprFrontendUi/js/model/cookie-data-provider',
    'Amasty_GdprFrontendUi/js/model/manageable-cookie',
    'Amasty_GdprFrontendUi/js/storage/essential-cookie',
    'Amasty_GdprFrontendUi/js/modal-show'
], function (
    Collection,
    $,
    registry,
    cookieModel,
    createModal,
    informationModal,
    actionSave,
    actionAllow,
    cookieDataProvider,
    manageableCookie,
    essentialStorage,
    modalShowConfig
) {
    'use strict';

    return Collection.extend({
        defaults: {
            firstShowProcess: '0',
            showClass: '-show',
            isScrollBottom: false,
            isPopup: false,
            isDeclineEnabled: false,
            names: {
                setupModal: '.setup-modal',
                cookieTable: '.cookie-table'
            },
            selectors: {
                settingsFooterLink: '[data-amcookie-js="footer-link"]',
                settingsGdprLink: '[data-amgdpr-js="cookie-link"]'
            },
            popup: {
                cssClass: 'amgdprcookie-groups-modal'
            },
            templates: {
                buttons: 'Amasty_GdprFrontendUi/components/buttons',
                button: 'Amasty_GdprFrontendUi/components/button',
                toggle: 'Amasty_GdprFrontendUi/components/toggle',
                popup: 'Amasty_GdprFrontendUi/components/popup'
            },
            additionalClasses: {},
            setupModal: null,
        },

        initialize: function () {
            this._super();

            this.initSettingsLink();

            return this;
        },

        initModalWithData: function () {
            return cookieDataProvider.getCookieData().fail(function () {
                manageableCookie.setForce(true);
                manageableCookie.processManageableCookies();
            }).done(function (cookieData) {
                manageableCookie.updateGroups(cookieData);
                manageableCookie.processManageableCookies();
                essentialStorage.update(cookieData.groupData);
                var config = modalShowConfig({isSecond: true, lastUpdate: cookieData.lastUpdate});
                cookieModel.deleteDisallowedCookie();
                cookieModel.initEventHandlers();
                this.initButtonsEvents(config.buttons);
            }.bind(this));
        },

        actionSave: function (button, elem, event) {
            event.preventDefault();
            this[button.action](elem, this);
        },

        /**
         * On save callback
         * @param {Object} element
         * @param {Object} modalContext
         */
        saveCookie: function (element, modalContext) {
            this._performSave(element, modalContext);
        },

        /**
         * Create/Open Information Modal Component.
         */
        getInformationModal: function (data) {
            return informationModal.call(this, this.names.cookieTable, data, this.popup.cssClass);
        },

        /**
         * On allow all cookies callback
         */
        allowCookies: function (element, modalContext) {
            return actionAllow().done(function () {
                cookieModel.triggerAllow();
                if (modalContext.closeModal) {
                    modalContext.closeModal();
                }
            }.bind(this));
        },

        declineCookie: function (element, modalContext) {
            var formData = cookieModel.getEssentialGroups();

            this._performSave(element, modalContext, formData);
        },

        _performSave: function (element, modalContext, formData) {
            return actionSave(element, formData).done(function () {
                if (modalContext.closeModal) {
                    modalContext.closeModal();
                }
            });
        },

        focus: function (element) {
            if (element.classList.contains('-save')) {
                $(element).focus();
            }
        },

        /**
         * Create Setup Modal Component
         */
        initSetupModal: function (data) {
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
         * Create click event on settings links
         */
        initSettingsLink: function () {
            var elem = $(this.selectors.settingsFooterLink + ',' + this.selectors.settingsGdprLink);

            $(elem).addClass(this.showClass).on('click', this.getSettingsModal.bind(this));
        }
    });
});
