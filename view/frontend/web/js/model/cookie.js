/**
 * Cookie Model
 */

define([
    'jquery',
    'underscore',
    'Amasty_GdprCookie/js/model/cookie-data-provider',
    'Amasty_GdprCookie/js/storage/cookie',
    'Amasty_GdprCookie/js/storage/essential-cookie',
    'Amasty_GdprCookie/js/action/allow',
    'Amasty_GdprCookie/js/action/ga-initialize',
    'mage/cookies',
    'jquery/jquery-storageapi'
], function ($, _, cookieDataProvider, cookieStorage, essentialStorage, actionAllow) {
    'use strict';

    return {
        initEventHandlers: function () {
            var body = $('body');

            body.on('amcookie_save', function () {
                this.setLastCookieAcceptance();
            }.bind(this));
            body.on('amcookie_allow', function () {
                this.setLastCookieAcceptance();
            }.bind(this));
        },

        isShowNotificationBar: function (firstShowProcess, lastUpdate, forbiddenCountries) {
            return !this.isCurrentCountryForbidden(forbiddenCountries)
                && this.isNeedShowOnUpdate(lastUpdate)
                && this.isNeedFirstShow(firstShowProcess, lastUpdate)
                && $.mage.cookies.get('amcookie_allowed') === null;
        },

        isNeedFirstShow: function (firstShowProcess, lastUpdate) {
            $.localStorage.set('amCookieBarFirstShowTime', lastUpdate);
            if (firstShowProcess === '0') {
                return true;
            }

            if (!$.localStorage.get('amCookieBarFirstShow')) {
                $.localStorage.set('amCookieBarFirstShow', 1);

                return true;
            }

            return false;
        },

        isNeedShowOnUpdate: function (lastUpdate) {
            if (!lastUpdate) {
                return true;
            }

            return this.isNeedShowAfterLastVisit(lastUpdate) || this.isNeedShowAfterLastAccept(lastUpdate)
        },

        isNeedShowAfterLastVisit: function (lastUpdate) {
            var needToShowAfterLastVisit = lastUpdate > $.localStorage.get('amCookieBarFirstShowTime');
            if (needToShowAfterLastVisit) {
                $.localStorage.set('amCookieBarFirstShow', null);
                $.mage.cookies.clear('amcookie_allowed');
            }

            return needToShowAfterLastVisit;
        },

        isNeedShowAfterLastAccept: function (lastUpdate) {
            var needToShowAfterLastAccept = true;
            if ($.localStorage.get('am-last-cookie-acceptance')) {
                needToShowAfterLastAccept = lastUpdate > $.localStorage.get('am-last-cookie-acceptance');
            }

            return needToShowAfterLastAccept;
        },

        deleteDisallowedCookie: function () {
            var disallowedCookie = $.mage.cookies.get('amcookie_disallowed');

            if (!disallowedCookie) {
                return;
            }

            disallowedCookie.split(',').forEach(function (name) {
                if (!essentialStorage.isEssential(name)) {
                    cookieStorage.delete(name);
                }
            });
        },

        getEssentialGroups: function () {
            var groups,
                filteredGroups;

            cookieDataProvider.getCookieData().done(function (cookieData) {
                groups = cookieData;
            });

            filteredGroups = _.filter(groups, function (group) {
                return group.isEssential;
            });

            return {
                'groups': filteredGroups.map(function (group) {
                    return group.groupId;
                })
            };
        },

        isCookieAllowed: function (cookieName) {
            var allowedGroups = $.mage.cookies.get('amcookie_allowed'),
                disallowedCookie = $.mage.cookies.get('amcookie_disallowed') || '',
                isCookiePolicyAllowed = $.mage.cookies.get('amcookie_policy_restriction') === 'allowed';

            if (!isCookiePolicyAllowed || essentialStorage.isEssential(cookieName)) {
                return true;
            }

            return !((!allowedGroups && !disallowedCookie)
                || disallowedCookie.split(',').indexOf(cookieName) !== -1);
        },

        setLastCookieAcceptance: function () {
            cookieDataProvider.getCookieData().done(function (cookieData) {
                $.localStorage.set('am-last-cookie-acceptance', cookieData.lastUpdate);
            });
        },

        triggerSave: function () {
            $('body').trigger('amcookie_save');
        },

        triggerAllow: function () {
            $('body').trigger('amcookie_allow');
        },

        isCurrentCountryForbidden: function (forbiddenCountries) {
            let currentCountry = $.localStorage.get('currentGeoIpCountry');
            if(forbiddenCountries.length == 0 || !currentCountry) {
                return false;
            }
            if(forbiddenCountries.includes(currentCountry) === true) {
                actionAllow();
                return true;
            }
            return false;
        }
    };
});
