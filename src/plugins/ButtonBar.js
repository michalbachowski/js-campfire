var ChatPluginButtonBar = (function ($, Listener, Handlebars) {
    "use strict";

    var defaults = {
        template: {
            bar: '<div class="btn-group buttonbar span4" />',
            button: Handlebars.compile('<span class="btn {{className}}" {{{attrs}}}>' +
                '{{label}}' +
                '{{#if options}}' +
                    ' <i class="caret" />' +
                '{{/if}}' +
                '</span>' +
                '{{#if options}}' +
                    '<ul class="dropdown-menu {{options.className}}">' +
                    '{{#each options.alternatives}}' +
                    '<li><a href="#" data-value="{{this.value}}">{{this.label}}</a></li>' +
                    '{{/each}}' +
                '</ul>' +
                '{{/if}}')
        },
        methods: {
            display: function (bar) {
                $("#chat-form").append(bar);
            }
        },
        defaults: {
            attrs: {
                className: 'unknown',
                attrs: '',
                label: 'click',
                options: void 0
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
                options.methods.display(box);
            };

        this.mapping = function () {
            return {
                "chat.init": [init, 400],
                "buttonbar.button.attach": attach
            };
        };

    };
}($, Listener, Handlebars));
