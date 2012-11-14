var ChatPluginPuppet = (function (Listener, $, Event, Handlebars) {
    "use strict";
    var defaults = {
        title: 'puppet',
        appendBefore: '#chat-form input[name=message]',
        button: {
            className: 'button-puppet',
            puppet: 'unknown'
        },
        template: {
            button: Handlebars.compile('<span class="btn {{className}}" data-toggle="button">{{puppet}}</span>')
        }
    };

    return function (params) {
        Listener.apply(this, arguments);

        var self = this,
            options = $.extend(true, {}, defaults, params),
            input,
            button,
            hasPuppet = false,
            as_puppet = false,

            // callback for init method
            callback = function (response) {
                var form = self.dispatcher.notifyUntil(
                        new Event(self, "form.get", {})
                    ),
                    button = $(options.template.button(
                        $.extend(true, {}, options.button, {puppet: response.response.puppet[0][0]})
                    ));
                if (!form.isProcessed()) {
                    return;
                }
                $(options.appendBefore).before(button);
                $("body").on("click", "." + options.button.className, function (e) {
                    as_puppet = !as_puppet;
                    form.getReturnValue().find("input[type=text]").first().focus();
                });
                hasPuppet = true;
            },

            // filter out IP information from puppets
            filterIp = function (event, ip) {
                var data = event.parameter("message");
                if (data.hasOwnProperty('as_puppet') && data.as_puppet) {
                    return '';
                }
                return ip;
            },

            // change user`s title to puppet title
            filterTitle = function (event, title) {
                var data = event.parameter("message");
                if (data.hasOwnProperty('as_puppet') && data.as_puppet) {
                    return options.title;
                }
                return title;
            },

            // initialize plugin - check available puppets
            init = function () {
                self.dispatcher.notifyUntil(
                    new Event(self, "send_message.send", {
                        message: {message: "$puppet get"},
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
                "chat.init": init,
                "users_list.title.filter": filterTitle,
                "form.message.filter": filterMessage,
                "ban.ip.filter": filterIp
            };
        };
    };
}(Listener, $, Event, Handlebars));
