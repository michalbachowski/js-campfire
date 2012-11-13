var ChatPluginBan = (function (Listener, Event, $, Handlebars) {
    "use strict";
    var defaults = {
        label: 'Ban',
        buttonClass: 'ban-button',
        userNodeIndicator: '.chat-user',
        template: {
            ip: Handlebars.compile('<small class="user-ip">{{ip}}</small>'),
            button: Handlebars.compile('<button class="btn {{buttonClass}}">{{label}}</button>')
        }
    };
    return function (params) {
        Listener.apply(this, arguments);

        var self = this,
            options = $.extend(true, {}, defaults, params),
            allowBan = false,

        // handle init
            success = function (response) {
                allowBan = response.response.console[0] !== "Access denied" && response.response.console[0];
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
        
        // handle user ban
            afterBan = function (response) {
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

            response = function (event) {
                afterBan(event.parameter("response"));
            },

            filter = function (event, node) {
                var data = event.parameter("message"),

                // HOOK: check whether IP could be displayed
                    ip = self.dispatcher.filter(
                        new Event(self, "ban.ip.filter", {message: data}),
                        data.from.ip
                    ).getReturnValue();

                // append IP (if allowed)
                if (ip.length > 0) {
                    node.append(options.template.ip(data.from));
                }

                // add ban button (if allowed)
                if (allowBan) {
                    node.append(options.template.button(options));
                }

                return node;
            };

        // handle clicking on 
        $("body").on('click', '.' + options.buttonClass, function (e) {
            banUser($(e.target).closest(options.userNodeIndicator).get(0).dataset.nick);
        });

        this.mapping = function () {
            return {
                "chat.init": init,
                "users_list.node.filter": filter,
                "form.response.success": response
            };
        };

    };
}(Listener, Event, $, Handlebars));
