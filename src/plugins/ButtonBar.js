var ChatPluginButtonBar = (function ($, Listener, Handlebars) {
    "use strict";

    var defaults = {
        appendTo: '#chat-form',
        template: {
            bar: '<div class="btn-group buttonbar" />',
            button: Handlebars.compile('<span class="btn {{className}}" {{{attrs}}}>{{label}}</span>')
        },
        defaults: {
            attrs: {
                className: 'unknown',
                attrs: '',
                label: 'click'
            }
        }
    };

    return function (params) {
        Listener.apply(this, arguments);

        var self = this,
            options = $.extend(true, {}, defaults, params),
            box = $(options.template.bar),
            buttons = [],

            attach = function (event) {
                var name = event.parameter('className'),
                    button;
                if (buttons.indexOf(name) !== -1) {
                    throw ('Name ' + name + ' has been used already');
                }
                buttons.push(name);
                button = $(options.template.button(
                    $.extend(true, {}, options.defaults.attrs, event.parameters())
                ));
                box.append(button);
                event.setReturnValue(button);
                return true;
            },

            init = function () {
                $(options.appendTo).append(options.template.bar);
            };

        this.mapping = function () {
            return {
                "chat.init": [init, 400],
                "buttonbar.button.attach": attach
            };
        };

    };
}($, Listener, Handlebars));
