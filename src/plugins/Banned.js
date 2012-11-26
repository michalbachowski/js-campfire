var ChatPluginBanned = (function (PluginUtility, Event, $, Handlebars) {
    "use strict";
    var defaults = {
        button: {
            label: '<i class="icon icon-trash" /> Banned users',
            className: 'button-banned',
            href: "#ban-banned-dialog",
            attrs: 'data-toggle="modal"'
        },
        template: {
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
                    '<caption>{{header}}</caption>' +
                    '<thead><tr><th>{{type}}</th><th>{{param}}</th><th>{{date}}</th></tr></thead>' +
                    '<tbody>' +
                    '{{#each users}}' +
                    '<tr><td>{{this.type}}</td><td>{{this.param}}</td><td>{{this.date}}</td></tr>' +
                    '{{/each}}' +
                    '</tbody>' +
                '</table>')
        },
        methods: {
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
                header: 'Banned users',
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
            $dialog,
 
        // handle init
            showBanned = function (response) {
                options.methods.appendBanned($dialog, options.template.banned(
                    $.extend(true, {}, options.options.banned, {users: response.response.ban[0]})
                ));
            },

            success = function (response) {
                // attach button
                self.dispatcher.notifyUntil(
                    new Event(
                        self,
                        "auth.button.attach",
                        options.button
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

            init = function (event) {
                // check whether user is allowed to view banned users
                self.dispatcher.notifyUntil(
                    new Event(self, "send_message.send", {
                        message: {
                            message: "$console allowed ban users"
                        },
                        success: success
                    })
                );
            };

        this.mapping = function () {
            return {
                "auth.login": [init, 520],
                "auth.logout": [init, 520]
            };
        };

    };
}(PluginUtility, Event, $, Handlebars));
