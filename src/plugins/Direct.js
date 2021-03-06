var ChatPluginDirect = (function (Listener, $, Handlebars, Event) {
    "use strict";
    var defaults = {
        inputSelector: '#chat-form input[type=text]',
        userNodeSelector: '.chat-user',
        button: {
            label: '<i class="icon icon-comment" />',
            className: 'button-direct',
            attrs: 'rel="tooltip" data-original-title="Private message"'
        }
    };

    return function (params) {
        Listener.apply(this, arguments);

        var self = this,
            options = $.extend(true, {}, defaults, params),
            $input,

            // append "Priv" button to each user node on users list
            filter = function (event, node) {
                self.dispatcher.notifyUntil(
                    new Event(self, "users_list.button.add",
                        $.extend(true, options.button, {nick: node.get(0).dataset.nick}))
                );
                return node;
            },

            // add "direct-message" class to each message that is direct
            display = function (event, node) {
                var data = event.parameter("message");
                if (data.hasOwnProperty('to') && data.to.length > 0) {
                    node.addClass('direct-message');
                }
                return node;
            },

            // alter username on message node - add information that this is direct message (">")
            username = function (event, username) {
                var data = event.parameter("message");
                if (data.hasOwnProperty('to') && data.to.length > 0) {
                    username = username + ' > ' + data.to;
                }
                return username;
            },

            init = function (event) {
                // set input field (here, because form might not be set previously)
                $input = $(options.inputSelector);
                // handle clicks on "Priv" button
                $("body").on("click", "." + options.button.className, function (e) {
                    var name = $(e.target).closest(options.userNodeSelector).get(0).dataset.nick,
                        val = $input.val();
                    if (val.substr(0, 1) === '>') {
                        return false;
                    }
                    $input.focus().val('>' + name + ': ' + val);
                    return false;
                });
            };

        this.mapping = function () {
            return {
                "display_message.node.filter": display,
                "users_list.node.filter": [filter, 50],
                "display_message.name.filter": username,
                "chat.init": [init, 350]
            };
        };
    };
}(Listener, $, Handlebars, Event));
