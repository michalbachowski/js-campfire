var ChatPluginIgnore = (function ($, PluginUtility, Event, Handlebars) {
    "use strict";
    var defaults = {
        userNodeSelector: '.chat-user',
        button: {
            label: '<i class="icon icon-filter" />',
            className: 'button-ignore',
            attrs: 'data-toggle="modal" rel="tooltip" title="Ignore"',
            href: '#ignore-config',
            options: {}
        },
        buttonUser: {
            label: '<i class="icon icon-filter" />',
            className: 'button-ignore-add',
            attrs: 'rel="tooltip" title="Ignore user"'
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
            },

            setIgnoredUsers: function (form, users) {
                return $(form).find('textarea#ignored-users').val(users);
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

            addIgnored = function (user) {
                ignored.push(user);
                writeConfig(ignored);
                // print information about about ban status
                self.alert('User ' + user + ' added to ignore list', 'success');
                return true;
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
                $dialog = $(options.template.dialog(options.options.dialog))
                    .on("submit", function () {
                        ignored = prepareIgnored(options.methods.getIgnoredUsers(this));
                        // save configuration
                        writeConfig(ignored);
                        $dialog.modal("hide");
                        return false;
                    }).on("show", function () {
                        options.methods.setIgnoredUsers(this, ignored.join(','));
                    // focus nick field
                    }).on("shown", function (e) {
                        $(e.target).find("textarea").focus();
                    // focus message input field
                    }).on("hidden", function (e) {
                        var ev = self.dispatcher.notifyUntil(new Event(self, 'form.get'));
                        if (!ev.isProcessed()) {
                            return;
                        }
                        ev.getReturnValue().find("input[type=text]").focus();
                    });
                $("body").append($dialog);
                
                // handle clicks on "Ignore" button on users list
                $("body").on("click", "." + options.buttonUser.className, function (e) {
                    addIgnored($(e.target).closest(options.userNodeSelector).get(0).dataset.nick);
                    return false;
                });
            },

            // filter out ignored messages
            filter = function (event) {
                var data = event.parameter("message");
                if (ignored.indexOf(data.from.name) !== -1) {
                    return true;
                }
            },

            // append "Ignore" button to each user node on users list
            filterUser = function (event, node) {
                self.dispatcher.notifyUntil(
                    new Event(self, "users_list.button.add",
                        $.extend(true, options.buttonUser, {nick: node.get(0).dataset.nick}))
                );
                return node;
            };


        this.mapping = function () {
            return {
                "dispatcher.message.display": [filter, 500],
                "users_list.node.filter": filterUser,
                "chat.init": [init, 390]
            };
        };
    };
}(jQuery, PluginUtility, Event, Handlebars));
