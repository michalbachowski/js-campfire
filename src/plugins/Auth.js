var ChatPluginAuth = (function ($, Listener, Event, Handlebars) {
    "use strict";
    var defaults = {
        url: {
            login: '/chat/entrance.json',
            logout: '/chat/exit.json'
        },
        options: {
            dialog: {
                header: 'Login',
                label: "Nickname",
                placeholder: "Nickname…",
                desc: '',
                close: 'Close',
                submit: 'Submit'
            },
            userInfo: {
                nick: 'Guest',
                logoutLabel: 'logout',
                loginLabel: 'login',
                logged: false
            }
        },
        template: {
            dialog: Handlebars.compile(' ' +
                '<form class="modal hide fade form-horizontal" tabindex="-1" role="dialog" aria-hidden="true">' +
                '   <div class="modal-header">' +
                '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
                '       <h3>{{header}}</h3>' +
                '   </div>' +
                '   <div class="modal-body">' +
                '       <div class="text control-group">' +
                '           <label class="control-label">{{label}}</label>' +
                '           <div class="controls">' +
                '               <input type="text" placeholder="{{placeholder}}">' +
                '               <p class="help-block">{{desc}}</p>' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '   <div class="modal-footer">' +
                '       <a href="#" class="btn" data-dismiss="modal" aria-hidden="true">{{close}}</a>' +
                '       <button type="submit" class="btn btn-primary">{{submit}}</button>' +
                '   </div>' +
                '</form>'),
            userInfo: Handlebars.compile(' ' +
                '<div class="btn-group pull-right">' +
                    '<a class="btn btn-warning button-username" href="#">' +
                        '<i class="icon icon-user"></i>' +
                        '{{nick}}' +
                    '</a>' +
                    '<button class="btn btn-warning dropdown-toggle" data-toggle="dropdown">' +
                        '<span class="caret"></span>' +
                    '</button>' +
                    '<ul class="dropdown-menu">' +
                        '{{#if logged}}' +
                        '<li><a href="#" class="button-logout">{{logoutLabel}}</a></li>' +
                        '{{else}}' +
                        '<li><a href="#" class="button-login">{{loginLabel}}</a></li>' +
                        '{{/if}}' +
                    '</ul>' +
                '</div>')
        },
        methods: {
            showDialog: function (dialog) {
                dialog.modal('show');
            },

            hideDialog: function (dialog) {
                dialog.modal('hide');
            },

            showUserInfo: function (box) {
                $(".navbar-inner .container-fluid").append(box);
            },

            selectNick: function (form) {
                return $(form).find("input[type=text]").val();
            }
        }
    };

    return function (params) {
        Listener.apply(this, arguments);

        var self = this,
            options = $.extend(true, {}, defaults, params),
            $dialog,
            $userInfo,
            // send notifications
            initUserInfo = function (nick) {
                if ($userInfo !== void 0) {
                    $userInfo.remove();
                    $userInfo = void 0;
                }
                var user = {};
                if (nick !== void 0) {
                    user = {
                        nick: nick,
                        logged: true
                    };
                }
                $userInfo = $(options.template.userInfo($.extend(true, {}, options.options.userInfo, user)));
                return $userInfo;
            },
            notifyLoggedOut = function (message) {
                var box = initUserInfo();
                options.methods.showUserInfo(box);
                self.dispatcher.notify(
                    new Event(self, "auth.logout", {nick: message, box: box})
                );
            },
            notifyLoggedIn = function (message) {
                var box = initUserInfo(message);
                options.methods.showUserInfo(box);
                self.dispatcher.notify(
                    new Event(self, "auth.login", {nick: message, box: box})
                );
            },
            // check information about user
            whoami = function (response) {
                if (response.status !== 1 || !response.response.hasOwnProperty('whoami')) {
                    return;
                }
                if (response.response.whoami[0].logged) {
                    notifyLoggedIn(response.response.whoami[0].name);
                } else {
                    notifyLoggedOut(response.response.whoami[0].name);
                    self.login();
                }
                self.dialog.hide();
            },
            onError = function (response, e) {
                if (403 === response.status) {
                    notifyLoggedOut();
                    self.login();
                }
            },
            checkStatus = function () {
                var message = {
                    message: { message: "$whoami tell" },
                    success: whoami,
                    error: onError
                };
                self.dispatcher.notifyUntil(
                    new Event(self, "send_message.send", message)
                );
            },
            // caled on chat init
            init = function (event) {
                // check login status
                checkStatus();

                // handle login/logout buttons
                $('body').on('click', '.button-logout', function (e) {
                    self.logout();
                    return;
                }).on('click', '.button-login', function (e) {
                    self.login();
                    return;
                });
            },
            // dialog initialization
            initDialog = function () {
                if ($dialog === void 0) {
                    $dialog = $(options.template.dialog(options.options.dialog)).on("submit", function (e) {
                        self.login(options.methods.selectNick(e.target));
                        return false;
                    });
                }
                return $dialog;
            };

        /**
         * public methods
         */
        // show/hide dialog
        self.dialog = {
            show: function () {
                options.methods.showDialog(initDialog());
            },

            hide: function () {
                options.methods.hideDialog(initDialog());
            }
        };
        // login guest
        self.login = function (nick) {
            if (!nick) {
                self.dialog.show();
                return;
            }

            var message = {
                url: options.url.login,
                message: { login: nick },
                success: function (response) {
                    checkStatus();
                },
                error: onError
            };
            self.dispatcher.notifyUntil(
                new Event(self, "send_message.send", message)
            );
        };
        // logout guest
        self.logout = function () {
            var message = {
                url: options.url.logout,
                message: {},
                success: function (response) {
                    checkStatus();
//                    notifyLoggedOut(response.response.auth[0]);
//                    self.login();
                },
                error: onError
            };
            self.dispatcher.notifyUntil(
                new Event(self, "send_message.send", message)
            );
        };

        // event mapping
        self.mapping = function () {
            return {
                "chat.init": init
            };
        };

        return self;
    };
}(jQuery, Listener, Event, Handlebars));
