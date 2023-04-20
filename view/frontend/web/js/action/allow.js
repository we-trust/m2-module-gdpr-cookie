/**
 * Action Allow All Cookies
 */

define([
    'jquery',
    'mage/url',
    'Amasty_GdprFrontendUi/js/model/cookie-data-provider',
    'Amasty_GdprFrontendUi/js/model/manageable-cookie',
    'Amasty_GdprFrontendUi/js/action/ga-initialize'
], function ($, urlBuilder, cookieDataProvider, manageableCookie, gaInitialize) {
    'use strict';

    return function () {
        const url = urlBuilder.build('amcookie/cookie/savegroups');

        return $.ajax({
            showLoader: false,
            method: 'POST',
            url: url,
            data: { all : 'true'},
            success: function (data) {
                this.cookieDatalayerPush(data.data);
                if (gaInitialize.deferrer.resolve) {
                    gaInitialize.deferrer.resolve();
                }

                cookieDataProvider.updateCookieData().done(function (cookieData) {
                    manageableCookie.updateGroups(cookieData);
                    manageableCookie.processManageableCookies();
                }).fail(function () {
                    manageableCookie.setForce(true);
                    manageableCookie.processManageableCookies();
                });
            },

            cookieDatalayerPush: function (data) {
                let consent = true;
                let cookiePersonalization = !!(data.includes('2')) || !!(data.includes('0'));
                let cookiePerformances = !!(data.includes('3')) || !!(data.includes('0'));
                let cookieMarketing = !!(data.includes('4')) || !!(data.includes('0'));
                let consentementALL = (cookiePerformances === true && cookiePersonalization === true && cookieMarketing === true);

                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'cookieconsent',
                    'consent': consent,
                    'consentementALL':consentementALL,
                    'cookiePersonalization':cookiePersonalization,
                    'cookiePerformances':cookiePerformances,
                    'cookieMarketing':cookieMarketing
                });
            }
        });
    };
});
