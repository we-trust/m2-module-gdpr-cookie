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
            cookieDatalayerPush: function (data) {
                let cookiePersonalization = !!(data.includes('2')) || !!(data.includes('0'));
                let cookiePerformances = !!(data.includes('3')) || !!(data.includes('0'));
                let cookieMarketing = !!(data.includes('4')) || !!(data.includes('0'));
                let consentementALL = (cookiePerformances === true && cookiePersonalization === true && cookieMarketing === true);

                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'cookieconsent',
                    'consent': this.setConsent(data),
                    'consentementALL': consentementALL,
                    'cookiePersonalization': cookiePersonalization,
                    'cookiePerformances': cookiePerformances,
                    'cookieMarketing': cookieMarketing
                });
            },
            setConsent: function (data) {
                const consent = {
                    necessary: true,
                    marketing: false,
                    ad_user_data: false,
                    ad_personalization: false,
                    analytics: false,
                    preferences: false

                };

                consent.preferences = !!(data.includes('2')) || !!(data.includes('0')) ? "granted" : "denied";
                consent.analytics = !!(data.includes('3')) || !!(data.includes('0')) ? "granted" : "denied";
                consent.marketing = !!(data.includes('4')) || !!(data.includes('0')) ? "granted" : "denied";
                consent.ad_user_data = consent.marketing;
                consent.ad_personalization = consent.marketing;

                const consentMode = {
                    'functionality_storage': consent.necessary,
                    'security_storage': consent.necessary,
                    'ad_storage': consent.marketing,
                    'analytics_storage': consent.analytics,
                    'personalization': consent.preferences,
                    'ad_user_data': consent.ad_user_data,
                    'ad_personalization': consent.ad_personalization
                };

                localStorage.setItem('consent-mode', JSON.stringify(consentMode));

                gtag('consent', 'update', consentMode);
            }
        });
    };
});
