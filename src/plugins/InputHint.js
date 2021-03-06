var ChatPluginInputHint = (function (Listener, $, Event) {
    "use strict";
    var defaults = {
        methods: {
            getInput: function (form) {
                return form.find("input[name=message]");
            }
        },
        options: {
            typeahead: {
                source: [],
                minLength: 1
            }
        }
    };

    return function (params) {
        Listener.apply(this, arguments);

        var self = this,
            options = $.extend(true, {}, defaults, params),
            nicks = [],
            commands = [],
            
            // methods returns source list for typeahead
            source = function (query, process) {
                if (query[0] === '$') {
                    return commands;
                }
                if (query[0] === '>') {
                    return nicks;
                }
                return [];
            },

            // callback for init method
            callback = function (response) {
                if (!response.hasOwnProperty('console')) {
                    return;
                }
                var input,
                    i,
                    tmp = response.console,
                    item;
                for (i = 0; i < tmp.length; i = i + 1) {
                    item = tmp[i];
                    commands.push('$' + item.plugin + ' ' + item.action + ' ' + item.args);
                }
            },

            // initialize plugin - check available puppets
            init = function () {
                var form = self.dispatcher.notifyUntil(
                        new Event(self, "form.get", {})
                    );
                if (!form.isProcessed()) {
                    throw "No form available";
                }
                // turn on type ahead plugin
                options.methods.getInput(form.getReturnValue()).typeahead(
                    $.extend(true, {}, options.options.typeahead, {source: source})
                );
                // load list of commands
                self.dispatcher.notifyUntil(
                    new Event(self, "send_message.send", {
                        message: {message: "$console list_commands"},
                        success: callback
                    })
                );
            },

            addNick = function (event, nick) {
                var tmp = '>' + nick + ':';
                if (nicks.indexOf(tmp) === -1) {
                    nicks.push(tmp);
                }
                return nick;
            };

        this.mapping = function () {
            return {
                "users_list.nick.filter": [addNick, 500],
                "chat.init": init
            };
        };
    };
}(Listener, $, Event, Handlebars));
