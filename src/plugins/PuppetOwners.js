var ChatPluginPuppetOwners = (function (PluginUtility, Event, $, Handlebars) {
    "use strict";
    var defaults = {
        button: {
            label: '<i class="icon icon-user" /> Puppet owners',
            className: 'button-puppetowners',
            href: "#puppet-owners-dialog",
            attrs: 'data-toggle="modal" rel="tooltip" title="Users that owns puppets"'
        },
        template: {
            dialog: Handlebars.compile(' ' +
                '<div class="modal hide fade" id="puppet-owners-dialog" tabindex="-1" role="dialog" aria-hidden="true">' +
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
                    '<thead><tr><th>{{owner}}</th><th>{{name}}</th><th>{{avatar}}</th></tr></thead>' +
                    '<tbody>' +
                    '{{#each rows}}' +
                    '<tr><td>{{this.owner}}</td><td>{{this.puppet}}</td><td><img src="{{this.avatar}}" /></td></tr>' +
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
                header: 'Puppet owners',
                close: 'Close'
            },
            list: {
                header: 'Puppet owners',
                owner: 'Owner',
                name: 'Name',
                avatar: 'Avatar',
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
                    $.extend(true, {}, options.options.list, {rows: response.puppet})
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
                                    message: "$puppet users"
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
                            message: "$console allowed puppet users"
                        },
                        success: success
                    })
                );
            };

        this.mapping = function () {
            return {
                "auth.login": [init, 510],
                "auth.logout": [init, 510]
            };
        };

    };
}(PluginUtility, Event, $, Handlebars));
