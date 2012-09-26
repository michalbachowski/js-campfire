var ChatPluginButtonBar = (function (jQuery, Listener) {
    "use strict";
    return function (appendTo) {
        Listener.apply(this, arguments);

        var className = "button-bar",
            barTag = "<div />",
            buttonTag = "<span />",
            box,
            buttons = {},
            self = this,

            wrap = function (callback) {
                return function (e) {
                    jQuery(this).text(callback(e));
                };
            },

            attach = function (event) {
                var callbacks = event.parameter("callbacks"),
                    i,
                    button = jQuery('<span />').text(event.parameter("label")),
                    args = [];

                for (i = 0; i < callbacks.length; i += 1) {
                    args.push(wrap(callbacks[i]));
                }
                jQuery.fn.toggle.apply(button, args);
                box.append(button);
                return true;
            },

            init = function () {
                box = jQuery("<div />").addClass("button-bar");
                jQuery(appendTo || "#chat-form").append(box);
            };
        this.mapping = function () {
            return {
                "chat.init": [init, 400],
                "buttonbar.button.attach": attach
            };
        };

    };
}(jQuery, Listener));
