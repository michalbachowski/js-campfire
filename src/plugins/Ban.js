var ChatPluginBan = (function (PluginUtility, Event, $, Handlebars, window) {
    "use strict";
    var defaults = {
        button: {
            label: 'Ban',
            className: 'button-ban',
            attrs: 'data-toggle="dropdown"',
            options: {
                className: 'ban-options',
                alternatives: [
                    {label: 'a minute', value: 60},
                    {label: '5 minutes', value: 300},
                    {label: '10 minutes', value: 600},
                    {label: 'quater of an hour', value: 900},
                    {label: 'half an hour', value: 1800},
                    {label: 'an hour', value: 3600},
                    {lbael: '3 hours', value: 10800},
                    {label: '6 hours', value: 21600},
                    {label: 'half of a day', value: 43200},
                    {label: '1 day', value: 86400},
                    {label: '2 days', value: 172800},
                    {label: '3 days', value: 259200},
                    {label: '4 days', value: 345600},
                    {label: 'a week', value: 604800},
                    {label: '2 weeks', value: 1209600},
                    {label: '4 weeks', value: 2419200},
                    {label: 'quarter', value: 7776000},
                    {label: 'half a year', value: 15724800},
                    {label: 'custom', value: 'custom'}
                ]
            }
        },
        buttonBanned: {
            label: '<i class="icon icon-trash" />',
            className: 'button-banned',
            href: "#ban-banned-dialog",
            attrs: 'data-toggle="modal" rel="tooltip" title="Banned users"'
        },
        defaultBanDuration: 60,
        clickEventSelctor: '.ban-options a',
        userNodeIndicator: '.chat-user',
        customDurationPrompt: 'Enter numer of seconds user should be banned',
        template: {
            caret: ' <i class="caret" />',
            ip: Handlebars.compile('<small class="user-ip muted">{{ip}}</small>'),
            options: Handlebars.compile('<ul class="dropdown-menu ban-options">{{#each time}}<li><a href="#" data-seconds="{{this.seconds}}">{{this.label}}</a></li>{{/each}}</ul>'),
            dialog: Handlebars.compile(' ' +
                '<div class="modal hide fade" id="ban-banned-dialog" tabindex="-1" role="dialog" aria-hidden="true">' +
                '   <div class="modal-header">' +
                '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
                '       <h3>{{header}}</h3>' +
                '   </div>' +
                '   <div class="modal-body">' +
                '   </div>' +
                '   <div class="modal-footer">' +
                '       <a href="#" class="btn" data-dismiss="modal" aria-hidden="true">{{close}}</a>' +
                '   </div>' +
                '</div>'),
            banned: Handlebars.compile(' ' +
                '<table class="table table-hover">' +
                    '<thead><tr><th>{{type}}</th><th>{{param}}</th><th>{{date}}</th></tr></thead>' +
                    '<tbody>' +
                    '{{#each users}}' +
                    '<tr><td>{{this.type}}</td><td>{{this.param}}</td><td>{{this.date}}</td></tr>' +
                    '{{/each}}' +
                    '</tbody>' +
                '</table>')
        },
        methods: {
            ip: function (node, ip) {
                node.find(".btn-group").first().before(ip);
            },
            appendBanned: function (dialog, banned) {
                dialog.find(".modal-body").find("table").remove().end().append(banned);
            }
        },
        options: {
            dialog: {
                header: 'Banned users',
                close: 'Close'
            },
            banned: {
                param: 'Banned value',
                type: 'Banned parameter',
                date: 'Ban end',
                users: []
            }
        }
    };
    return function (params) {
        PluginUtility.apply(this, arguments);

        var self = this,
            options = $.extend(true, {}, defaults, params),
            allowBan = false,
            $dialog,
 
        // handle user ban
            afterBan = function (response) {
                if (response === void 0) {
                    return;
                }
                if (!response.hasOwnProperty('ban')) {
                    return;
                }
                // print information about about ban status
                self.alert(response.ban[0]);
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
                    var seconds = e.target.dataset.value;
                    while (isNaN(parseInt(seconds, 10))) {
                        seconds = window.prompt(options.customDurationPrompt);
                    }
                    banUser(
                        $(e.target).closest(options.userNodeIndicator).get(0).dataset.nick, // who
                        seconds // for how long
                    );
                });
            },

            showBanned = function (response) {
                options.methods.appendBanned($dialog, options.template.banned(
                    $.extend(true, {}, options.options.banned, {users: response.response.ban[0]})
                ));
            },

            banned = function (response) {
                // attach button
                self.dispatcher.notifyUntil(
                    new Event(
                        self,
                        "buttonbar.button.attach",
                        options.buttonBanned
                    )
                ).getReturnValue();
                // append modal
                $dialog = $(options.template.dialog(options.options.dialog))
                    .on("show", function () {
                        self.dispatcher.notifyUntil(
                            new Event(self, "send_message.send", {
                                message: {
                                    message: "$ban users"
                                },
                                success: showBanned
                            })
                        );
                    });
                $("body").append($dialog);
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
                // check whether user is allowed to view banned users
                self.dispatcher.notifyUntil(
                    new Event(self, "send_message.send", {
                        message: {
                            message: "$console allowed ban users"
                        },
                        success: banned
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
                ).getReturnValue().filter(".btn").toggle(allowBan);

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
}(PluginUtility, Event, $, Handlebars, window));
