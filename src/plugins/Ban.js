var ChatPluginBan = (function (Listener, Event, $, Handlebars) {
    "use strict";
    var defaults = {
        label: 'Ban',
        buttonClass: 'button-ban',
        userNodeIndicator: '.chat-user',
        template: {
            ip: Handlebars.compile('<small class="user-ip">{{ip}}</small>'),
            button: Handlebars.compile('<button class="btn btn-small {{buttonClass}}">{{label}}</button>')
        },
        methods: {
            button: function (node, button) {
                node.find(".dropdown-menu, .btn-group").first().append(button);
            },
            ip: function (node, ip) {
                node.find(".btn-group").first().before(ip);
            }
        }
    };
    return function (params) {
        Listener.apply(this, arguments);

        var self = this,
            options = $.extend(true, {}, defaults, params),
            allowBan = false,
 
        // handle user ban
            afterBan = function (response) {
                if (response === void 0) {
                    return;
                }
                if (!response.hasOwnProperty('ban')) {
                    return;
                }
                // check whether user is allowed to ban others
                self.dispatcher.notifyUntil(
                    new Event(self, "info_box.display", {
                        message: response.ban[0]
                    })
                );
            },

            banUser = function (nick) {
                // not allowed to ban users? Skip...
                if (!allowBan) {
                    return;
                }
                // fetch user data
                var data = self.dispatcher.notifyUntil(
                        new Event(self, "users_list.user.get", {
                            nick: nick
                        })
                    ).getReturnValue(),
                    user = data.name;
                if (data.id > 0) {
                    user = data.id;
                }
                self.dispatcher.notifyUntil(
                    new Event(self, "send_message.send", {
                        message: {
                            message: "$ban user" + user
                        },
                        success: afterBan
                    })
                );
            },

        // handle init
            success = function (response) {
                allowBan = response.response.console[0] !== "Access denied" && response.response.console[0];
                // handle clicking on button
                if (!allowBan) {
                    return;
                }
                var buttonSelector =  '.' + options.buttonClass;
                // show hidden buttons
                $("body " + buttonSelector + ":hidden").show();
                // handle 'click' events on 'Ban' buttons
                $("body").on('click', buttonSelector, function (e) {
                    banUser($(e.target).closest(options.userNodeIndicator).get(0).dataset.nick);
                });
            },

            init = function () {
                // check whether user is allowed to ban others
                self.dispatcher.notifyUntil(
                    new Event(self, "send_message.send", {
                        message: {
                            message: "$console allowed ban user"
                        },
                        success: success
                    })
                );
            },

            // handle response to ban command
            response = function (event) {
                afterBan(event.parameter("response"));
            },

            // add Ban button and IP information
            filter = function (event, node) {
                var data = event.parameter("message"),

                // HOOK: check whether IP could be displayed
                    ip = self.dispatcher.filter(
                        new Event(self, "ban.ip.filter", {message: data}),
                        data.from.ip
                    ).getReturnValue();

                // append IP (if allowed)
                if (ip.length > 0) {
                    options.methods.ip(node, options.template.ip(data.from));
                }

                // add ban button (always, will be hidden when not allowed)
                options.methods.button(node, $(options.template.button(options)).toggle(allowBan));

                return node;
            };

        this.mapping = function () {
            return {
                "chat.init": init,
                "users_list.node.filter": filter,
                "form.response.success": response
            };
        };

    };
}(Listener, Event, $, Handlebars));
