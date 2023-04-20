/**
 * Action Save Cookie
 */

define([
    'jquery',
    'underscore',
    'mage/url',
    'Amasty_GdprFrontendUi/js/model/cookie-data-provider',
    'Amasty_GdprFrontendUi/js/model/cookie',
    'Amasty_GdprFrontendUi/js/model/manageable-cookie',
    'Amasty_GdprFrontendUi/js/action/ga-initialize'
], function (
    $,
    _,
    urlBuilder,
    cookieDataProvider,
    cookieModel,
    manageableCookie,
    gaInitialize
) {
    'use strict';

    var options = {
        selectors: {
            formContainer: '[data-amcookie-js="form-cookie"]',
            toggleFieldSelector: '[data-amcookie-js="field"]'
        },
        googleAnalyticsCookieName: '_ga'
    };

    return function (element, formData) {
        const url = urlBuilder.build('amcookie/cookie/savegroups'),
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
                cookieDataProvider.updateCookieData().done(function (cookieData) {
                    manageableCookie.updateGroups(cookieData);
                    manageableCookie.processManageableCookies();
                }).fail(function () {
                    manageableCookie.setForce(true);
                    manageableCookie.processManageableCookies();
                });

                if (cookieModel.isCookieAllowed(options.googleAnalyticsCookieName) && gaInitialize.deferrer.resolve) {
                    gaInitialize.deferrer.resolve();
                }
            },
            cookieDatalayerPush: function(data) {
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
