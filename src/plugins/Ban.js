var ChatPluginBan = (function (Listener, Event, $, Handlebars, window) {
    "use strict";
    var defaults = {
        button: {
            label: 'Ban',
            className: 'button-ban',
            attrs: 'data-toggle="dropdown"',
            options: {
                time: [
                    {label: 'a minute', seconds: 60},
                    {label: '5 minutes', seconds: 300},
                    {label: '10 minutes', seconds: 600},
                    {label: 'quater of and hour', seconds: 900},
                    {label: 'half an hour', seconds: 1800},
                    {label: 'an hour', seconds: 3600},
                    {lbael: '3 hours', seconds: 10800},
                    {label: '6 hours', seconds: 21600},
                    {label: 'half of a day', seconds: 43200},
                    {label: '1 day', seconds: 86400},
                    {label: '2 days', seconds: 172800},
                    {label: '3 days', seconds: 259200},
                    {label: '4 days', seconds: 345600},
                    {label: 'a week', seconds: 604800},
                    {label: '2 weeks', seconds: 1209600},
                    {label: '4 weeks', seconds: 2419200},
                    {label: 'quarter', seconds: 7776000},
                    {label: 'half a year', seconds: 15724800},
                    {label: 'custom', seconds: 'custom'}
                ]
            }
        },
        defaultBanDuration: 60,
        clickEventSelctor: '.ban-options a',
        userNodeIndicator: '.chat-user',
        customDurationPrompt: 'Enter numer of seconds user should be banned',
        template: {
            caret: ' <i class="caret" />',
            ip: Handlebars.compile('<small class="user-ip">{{ip}}</small>'),
            options: Handlebars.compile('<ul class="dropdown-menu ban-options">{{#each time}}<li><a href="#" data-seconds="{{this.seconds}}">{{this.label}}</a></li>{{/each}}</ul>')
        },
        methods: {
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

            banUser = function (nick, seconds) {
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
                if (isNaN(parseInt(seconds, 10))) {
                    seconds = options.defaultBanDuration;
                }
                self.dispatcher.notifyUntil(
                    new Event(self, "send_message.send", {
                        message: {
                            message: "$ban user " + user + " " + seconds
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
                // show hidden buttons
                $("body ." + options.button.className + ":hidden").show();
                // handle 'click' events on 'Ban' buttons
                $("body").on('click', options.clickEventSelctor, function (e) {
                    var seconds = e.target.dataset.seconds;
                    while (isNaN(parseInt(seconds, 10))) {
                        seconds = window.prompt(options.customDurationPrompt);
                    }
                    banUser(
                        $(e.target).closest(options.userNodeIndicator).get(0).dataset.nick, // who
                        seconds // for how long
                    );
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
                self.dispatcher.notifyUntil(
                    new Event(self, "users_list.button.add",
                        $.extend(true, options.button, {nick: node.get(0).dataset.nick}))
                ).getReturnValue().toggle(allowBan);

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
}(Listener, Event, $, Handlebars, window));
