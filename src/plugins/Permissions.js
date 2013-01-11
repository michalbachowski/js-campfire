var ChatPluginPermissions = (function (PluginUtility, Event, $, Handlebars) {
    "use strict";
    var defaults = {
        button: {
            label: '<i class="icon icon-minus-sign" /> Permissions',
            className: 'button-permissions',
            href: "#permissions-dialog",
            attrs: 'data-toggle="modal"'
        },
        template: {
            dialog: Handlebars.compile(' ' +
                '<div class="modal hide fade" id="permissions-dialog" tabindex="-1" role="dialog" aria-hidden="true">' +
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
            list: Handlebars.compile(' ' +
                '<table class="table table-hover">' +
                    '<caption>{{header}}</caption>' +
                    '<thead><tr><th>{{plugin}}</th><th>{{action}}</th><th>{{users}}</th></tr></thead>' +
                    '<tbody>' +
                    '{{#each rows}}' +
                    '<tr><td>{{this.plugin}}</td><td>{{this.action}}</td><td>{{this.users}}</td></tr>' +
                    '{{/each}}' +
                    '</tbody>' +
                '</table>')
        },
        methods: {
            appendList: function (dialog, list) {
                dialog.find(".modal-body").find("table").remove().end().append(list);
            }
        },
        options: {
            dialog: {
                header: 'Permissions',
                close: 'Close'
            },
            list: {
                header: 'Permissions',
                users: 'Users',
                plugin: 'Plugin name',
                action: 'Action',
                rows: []
            }
        }
    };
    return function (params) {
        PluginUtility.apply(this, arguments);

        var self = this,
            options = $.extend(true, {}, defaults, params),
            $dialog,
 
        // handle init
            showList = function (response) {
                options.methods.appendList($dialog, options.template.list(
                    $.extend(true, {}, options.options.list, {rows: response.console})
                ));
            },

            success = function (response) {
                if (!response.console) {
                    return;
                }
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
                                    message: "$console list_perms"
                                },
                                success: showList
                            })
                        );
                    });
                $("body").append($dialog);
            },

            init = function (event) {
                // check whether user is allowed to view users colors
                self.dispatcher.notifyUntil(
                    new Event(self, "send_message.send", {
                        message: {
                            message: "$console allowed console list_perms"
                        },
                        success: success
                    })
                );
            };

        this.mapping = function () {
            return {
                "auth.login": [init, 540],
                "auth.logout": [init, 540]
            };
        };

    };
}(PluginUtility, Event, $, Handlebars));
