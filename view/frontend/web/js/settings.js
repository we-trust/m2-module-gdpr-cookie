/**
 * Cookie settings widget logic
 */
define([
    'jquery',
    'uiCollection',
    'Amasty_GdprCookie/js/modal',
    'Amasty_GdprCookie/js/action/save',
    'Amasty_GdprCookie/js/action/allow',
    'Amasty_GdprCookie/js/model/cookie',
    'Amasty_GdprCookie/js/action/information-modal',
    'Amasty_GdprCookie/js/storage/essential-cookie',
    'Amasty_GdprCookie/js/model/cookie-data-provider',
], function (
    $,
    Collection,
    ModalData,
    actionSave,
    actionAllow,
    cookieModel,
    informationModal,
    essentialStorage,
    cookieDataProvider
) {
    'use strict';

    return Collection.extend({
        defaults: {
            template: {
                name: 'Wetrust_GdprCookie/widget/settings'
            },
            names: {
                cookieTable: '.cookie-table'
            },
            popup: {
                cssClass: 'amgdprcookie-groups-modal'
            },
            groups: [],
        },

        initialize: function () {
            this._super();

            cookieDataProvider.getCookieData().done(function (cookieData) {
                this.groups(cookieData);
                essentialStorage.update(cookieData);
                cookieModel.deleteDisallowedCookie();
            }.bind(this));

            $("body").on('amcookie_save', function () {
                this.refreshCookieData();
            }.bind(this));

            return this;
        },

        initObservable: function () {
            this._super()
                .observe(['groups']);

            return this;
        },

        refreshCookieData: function () {
            cookieDataProvider.updateCookieData().done(function (cookieData) {
                this.groups(cookieData);
            }.bind(this));
        },

        getInformationModal: function (data) {
            informationModal.call(this, this.names.cookieTable, data, this.popup.cssClass);
        },

        allowCookies: function () {
            actionAllow().done(function () {
                cookieModel.triggerAllow();
                this.refreshCookieData();
            }.bind(this));
        },

        saveCookie: function (element) {
            actionSave(element).done(function () {
                cookieDataProvider.getCookieData().done(function (cookieData) {
                    ModalData().initSetupModal(cookieData);
                }.bind(this));
            }.bind(this));
        },
    });
});
