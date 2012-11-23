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
                minLength: 1,
                matcher: function (item) {
                    if (" " === this.query) {
                        return false;
                    }
                    if ("  " === this.query) {
                        return false;
                    }
                    if ("   " === this.query) {
                        return false;
                    }
                    return ~item.toLowerCase().indexOf(this.query.toLowerCase());
                }
            }
        }
    };

    return function (params) {
        Listener.apply(this, arguments);

        var self = this,
            options = $.extend(true, {}, defaults, params),

            // callback for init method
            callback = function (response) {
                if (typeof response.response.console[0] !== 'object') {
                    return;
                }
                var form = self.dispatcher.notifyUntil(
                        new Event(self, "form.get", {})
                    ),
                    input,
                    i,
                    source = [],
                    tmp = response.response.console[0],
                    item;
                if (!form.isProcessed()) {
                    throw "No form available";
                }
                for (i = 0; i < tmp.length; i = i + 1) {
                    item = tmp[i];
                    source.push('$' + item.plugin + ' ' + item.method + ' ' + item.args);
                }
                options.methods.getInput(form.getReturnValue()).typeahead(
                    $.extend(true, {}, options.options.typeahead, {source: source})
                );
            },

            // initialize plugin - check available puppets
            init = function () {
                self.dispatcher.notifyUntil(
                    new Event(self, "send_message.send", {
                        message: {message: "$console list_commands"},
                        success: callback
                    })
                );
            },

            // add information that message is being sent as puppet
            filterMessage = function (event, data) {
                if (hasPuppet && as_puppet) {
                    data.as_puppet = 1;
                }
                return data;
            };
        
        this.mapping = function () {
            return {
                "chat.init": init
            };
        };
    };
}(Listener, $, Event, Handlebars));
