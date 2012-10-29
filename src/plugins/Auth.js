var ChatPluginAuth = (function ($, Listener, Event, Handlebars) {
    "use strict";

    return function (params) {
        Listener.apply(this, arguments);

        var self = this,
            options = $.extend(
                true,
                {
                    url: {
                        login: '/chat/entrance.json',
                        logout: '/chat/exit.json'
                    },
                    lang: {
                        header: 'Login',
                        label: "Nickname",
                        placeholder: "Nickname…",
                        desc: '',
                        close: 'Close',
                        submit: 'Submit'
                    }
                },
                params
            ),
            notifyLoggedOut = function (message) {
                self.dispatcher.notify(
                    new Event(self, "auth.logout", message)
                );
            },
            notifyLoggedIn = function (message) {
                self.dispatcher.notify(
                    new Event(self, "auth.login", message)
                );
            },
            whoami = function (response) {
                if (response.status !== 1 || !response.response.hasOwnProperty('whoami')) {
                    return;
                }
                if (response.response.whoami[0].hasAccount) {
                    notifyLoggedOut(response.response.whoami[0].name);
                } else {
                    notifyLoggedIn(response.response.whoami[0].name);
                }
                self.dialog.hide();
            },
            onError = function (response, e) {
                if (403 === response.status) {
                    self.login();
                }
            },
            init = function () {
                var message = {
                    message: { message: "$whoami tell" },
                    success: whoami,
                    error: onError
                };
                self.dispatcher.notifyUntil(
                    new Event(self, "send_message.send", message)
                );
            };

        /**
         * public methods
         */
        self.dialog = (function () {
            var $dialog,
                initDialog = function () {
                    if ($dialog !== void 0) {
                        return;
                    }
                    $dialog = Handlebars.compile(' ' +
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
                        '</form>')(options.lang);
                };
            return {
                show: function () {
                    initDialog();
                    $dialog.modal('show');
                },

                hide: function () {
                    initDialog();
                    $dialog.modal('hide');
                }
            };
        }());

        self.login = function (nick) {
            if (!nick) {
                self.dialog.show();
                return;
            }

            var message = {
                url: options.url.login,
                message: { login: nick },
                success: function (response) {
                    init();
                    notifyLoggedIn(response.response.auth[0]);
                },
                error: onError
            };
            self.dispatcher.notifyUntil(
                new Event(self, "send_message.send", message)
            );
        };

        self.logout = function () {
            var message = {
                url: options.url.logout,
                message: {},
                success: function (response) {
                    self.login();
                    notifyLoggedOut(response.response.auth[0]);
                },
                error: onError
            };
            self.dispatcher.notifyUntil(
                new Event(self, "send_message.send", message)
            );
        };

        self.mapping = function () {
            return {
                "chat.init": init
            };
        };

        return self;
    };
}(jQuery, Listener, Event, Handlebars));
