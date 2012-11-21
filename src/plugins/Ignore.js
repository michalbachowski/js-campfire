var ChatPluginIgnore = (function ($, PluginUtility, Event, Handlebars) {
    "use strict";
    var defaults = {
        button: {
            label: '<i class="icon icon-trash" />',
            className: 'button-ignore',
            attrs: 'data-toggle="modal" rel="tooltip" data-placement="bottom" title="Ignore"',
            href: '#ignore-config',
            options: {}
        },
        template: {
            dialog: Handlebars.compile(' ' +
                '<form class="modal hide fade form-horizontal" id="ignore-config" tabindex="-1" role="dialog" aria-hidden="true">' +
                '   <div class="modal-header">' +
                '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
                '       <h3>{{header}}</h3>' +
                '   </div>' +
                '   <div class="modal-body">' +
                '       <div class="text control-group">' +
                '           <label class="control-label" for="ignored-users">{{label}}</label>' +
                '           <div class="controls">' +
                '               <textarea name="ignored-users" id="ignored-users">{{ignored}}</textarea>' +
                '               <p class="help-block">{{desc}}</p>' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '   <div class="modal-footer">' +
                '       <a href="#" class="btn" data-dismiss="modal" aria-hidden="true">{{close}}</a>' +
                '       <button type="submit" class="btn btn-primary">{{submit}}</button>' +
                '   </div>' +
                '</form>')
        },
        options: {
            dialog: {
                header: 'Set ignored users',
                label: 'Ignored users',
                desc: 'Comma-separated list of nicknames of users to ignore',
                close: 'Close',
                submit: 'Save',
                users: ''
            }
        },
        methods: {
            getIgnoredUsers: function (form) {
                return $(form).find('textarea#ignored-users').val();
            }
        }
    };

    return function (params) {
        PluginUtility.apply(this, arguments);

        var options = $.extend(true, {}, defaults, params),
            self = this,
            ignored = [],
            $button,
            $dialog,

            prepareIgnored = function (ignored) {
                return (ignored || '').split(',').map($.trim);
            },

            writeConfig = function (ignored) {
                self.config.write('ignore.users', ignored.join(','));
                return false;
            },

            init = function () {
                // attach button
                $button = self.dispatcher.notifyUntil(
                    new Event(
                        self,
                        "buttonbar.button.attach",
                        options.button
                    )
                ).getReturnValue();
                // read config
                var ignoredTmp = self.config.read('ignore.users');
                if (ignoredTmp !== void 0) {
                    ignored = prepareIgnored(ignoredTmp);
                } else {
                    ignoredTmp = ignored;
                }
                // append modal
                $dialog = $(options.template.dialog($.extend(true, {}, options.options.dialog, {ignored: ignored.join(',')})))
                    .on("submit", function () {
                        ignored = prepareIgnored(options.methods.getIgnoredUsers(this));
                        // save configuration
                        writeConfig(ignored);
                        $dialog.modal("hide");
                        return false;
                    });
                $("body").append($dialog);
            },

            filter = function (event) {
                var data = event.parameter("message");
                if (ignored.indexOf(data.from.name) !== -1) {
                    return true;
                }
            };

        this.mapping = function () {
            return {
                "dispatcher.message.display": [filter, 500],
                "chat.init": init
            };
        };
    };
}(jQuery, PluginUtility, Event, Handlebars));
