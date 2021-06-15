/**
 * Action Allow All Cookies
 */

 define([
    'jquery',
    'mage/url',
    'Amasty_GdprCookie/js/model/cookie-data-provider',
    'Amasty_GdprCookie/js/action/ga-initialize'
], function ($, urlBuilder, cookieDataProvider, gaInitialize) {
    'use strict';

    return function () {
        var url = urlBuilder.build('gdprcookie/cookie/savegroups');

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

                cookieDataProvider.updateCookieData();
            },
            cookieDatalayerPush: function(data) {
                var consent = true;
                var cookiePersonalization = (data.includes('2')) ? true : false;
                var cookiePerformances = (data.includes('3')) ? true : false;
                var cookieMarketing = (data.includes('4')) ? true : false;
                var consentementALL = (cookiePerformances === true && cookiePersonalization === true && cookieMarketing === true) ? true : false;

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
