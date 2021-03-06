var ChatPluginButtonBar = (function ($, Listener, Handlebars) {
    "use strict";

    var defaults = {
        template: {
            bar: '<div class="buttonbar span5" />',
            button: Handlebars.compile('<span class="btn-group">' +
                '<a href="{{href}}" class="btn {{className}}" {{{attrs}}}>' +
                    '{{{label}}}' +
                    '{{#if split}} ' +
                    '{{else}}' +
                        '{{#if options}}' +
                            ' <i class="caret" />' +
                        '{{/if}}' +
                    '{{/if}}' +
                '</a>' +
                '{{#if split}}' +
                    '<span class="btn dropdown-toggle" data-toggle="dropdown">' +
                        ' <i class="caret" />' +
                    '</span>' +
                '{{/if}}' +
                '{{#if options}}' +
                    '<ul class="dropdown-menu {{options.className}}">' +
                        '{{#each options.alternatives}}' +
                            '<li>' +
                                '<a href="{{#if this.href}}{{this.href}}{{else}}#{{/if}}" data-value="{{this.value}}" {{#if this.attrs}}{{{this.attrs}}}{{/if}}>{{{this.label}}}</a>' +
                            '</li>' +
                        '{{/each}}' +
                    '</ul>' +
                '{{/if}}' +
                '</span>')
        },
        methods: {
            display: function (bar) {
                $("#chat-form").append(bar).tooltip({selector: "[rel=tooltip]", placement: 'bottom'});
            }
        },
        defaults: {
            attrs: {
                className: 'unknown',
                attrs: '',
                href: '#',
                split: false,
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
                "chat.init": [init, 50],
                "buttonbar.button.attach": attach
            };
        };

    };
}($, Listener, Handlebars));
