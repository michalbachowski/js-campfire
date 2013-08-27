var ChatPluginDirect = (function (Listener, $, Handlebars, Event) {
    "use strict";
    var defaults = {
        inputSelector: '#chat-form input[type=text]',
        userNodeSelector: '.chat-user',
        button: {
            label: '<i class="icon icon-comment" />',
            className: 'button-direct',
            attrs: 'rel="tooltip" data-toggle="button" data-original-title="Private message"'
        }
    };

    return function (params) {
        Listener.apply(this, arguments);

        var self = this,
            options = $.extend(true, {}, defaults, params),
            $clickedButton = void 0,
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

            remove_recipient = function ($input) {
                var val = $input.val(),
                    has_lead = val.substr(0, 1) === '>',
                    separator_position = val.indexOf(':');
                if (!has_lead) {
                    return;
                }
                $input.val(val.substr(separator_position + 1).trimLeft());
            },

            nick_from_button = function ($button) {
                return $button.closest(options.userNodeSelector).get(0).dataset.nick;
            },

            on_clear = function (event) {
                if ($clickedButton === void 0) {
                    return false;
                }
                var name = nick_from_button($clickedButton),
                    val = $input.val();
                $input.focus().val('>' + name + ': ' + val);
            },

            init = function (event) {
                // set input field (here, because form might not be set previously)
                $input = $(options.inputSelector);
                // handle clicks on "Priv" button
                $("body").on("click", "." + options.button.className, function (e) {
                    var $target = $(e.target).closest(".btn");
                    // have active session
                    if ($clickedButton !== void 0) {
                        remove_recipient($input);
                        // same button clicked - stop private session and
                        // forget clickedButton, so new session with same user might be established
                        if ($target.get(0) === $clickedButton.get(0)) {
                            $clickedButton = void 0;
                            return false;
                        }
                        $clickedButton.button('toggle');
                    }
                    // other button clicked;
                    $clickedButton = $target;
                    // prepend message form with recipient name
                    on_clear();
                    return false;
                });
            };

        this.mapping = function () {
            return {
                "display_message.node.filter": display,
                "users_list.node.filter": [filter, 50],
                "display_message.name.filter": username,
                "form.message.cleared": on_clear,
                "chat.init": [init, 350]
            };
        };
    };
}(Listener, $, Handlebars, Event));
