/**
 * Action Save Cookie
 */

 define([
    'jquery',
    'underscore',
    'mage/url',
    'Amasty_GdprCookie/js/model/cookie-data-provider',
    'Amasty_GdprCookie/js/model/cookie',
    'Amasty_GdprCookie/js/action/ga-initialize'
], function ($, _, urlBuilder, cookieDataProvider, cookieModel, gaInitialize) {
    'use strict';

    var options = {
        selectors: {
            formContainer: '[data-amcookie-js="form-cookie"]',
            toggleFieldSelector: '[data-amcookie-js="field"]'
        },
        googleAnalyticsCookieName: '_ga'
    };

    return function (element, formData) {
        var url = urlBuilder.build('gdprcookie/cookie/savegroups'),
            disabledFields = $(options.selectors.toggleFieldSelector + ':disabled'),
            form = $(element).closest(options.selectors.formContainer);

        if (_.isUndefined(formData)) {
            disabledFields.removeAttr('disabled');
            formData = form.serialize();
        }

        return $.ajax({
            showLoader: false,
            method: 'POST',
            url: url,
            data: formData,
            success: function (data) {
                this.cookieDatalayerPush(data.data);
                disabledFields.attr('disabled', true);
                cookieModel.triggerSave();
                cookieDataProvider.updateCookieData();

                if (cookieModel.isCookieAllowed(options.googleAnalyticsCookieName) && gaInitialize.deferrer.resolve) {
                    gaInitialize.deferrer.resolve();
                }
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
