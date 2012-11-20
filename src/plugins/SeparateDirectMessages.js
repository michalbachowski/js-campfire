var ChatPluginSeparateDirectMessages = (function (jQuery, Listener, Event, Handlebars) {
    "use strict";
    var defaults = {
        template: {
            tabs: Handlebars.compile('<ul class="nav nav-tabs row-fluid" id="{{id}}">' +
                '{{#each tabs}}' +
                    '<li {{#if this.className}}class="{{this.className}}"{{/if}}>' +
                        '<a href="#{{this.target}}" data-toggle="tab">{{this.label}}</a>' +
                    '</li>' +
                '{{/each}}' +
                '</ul>'),
            privInbox: '<div class="tab-pane" id="priv"></div>'
        },

        methods: (function () {
            var classes;
            return {
                displayTabs: function (box, $privInbox) {
                    box.insertBefore($privInbox.parent());
                },

                prepareInbox: function (box) {
                    if (classes === void 0) {
                        classes = box.removeClass("well").attr("class");
                    }
                    return box.removeClass(box.attr("class")).addClass("tab-pane well");
                },

                displayPrivInbox: function (box) {
                    jQuery("#inbox")
                        .addClass("active")
                        .wrap(jQuery('<div class="tabbable"><div class="tab-content row-fluid"></div></div>').addClass(classes))
                        .after(box);
                }
            };
        }()),

        options: {
            tabs: {
                id: "tabs",
                tabs: [
                    {label: 'Inbox', target: 'inbox', className: 'active'},
                    {label: 'Priv', target: 'priv'}
                ]
            }
        }
    };

    return function (params) {
        Listener.apply(this, arguments);
        
        var self   = this,
            options = jQuery.extend(true, {}, defaults, params),
            $privInbox,
            $tabs,
            filterInbox = function (event, inbox) {
                return options.methods.prepareInbox(inbox);
            },
            chooseInbox = function (event, inbox) {
                var data = event.parameter('message');
                if (data.hasOwnProperty('to') && data.to.length > 0) {
                    return $privInbox;
                }
                return inbox;
            },
            init = function (event) {
                // create priv inbox
                $privInbox = self.dispatcher.filter(
                    new Event(self, "display_message.inbox.filter", {event: event}),
                    jQuery(options.template.privInbox)
                ).getReturnValue();
                // display priv inbox
                options.methods.displayPrivInbox($privInbox);
                // display tabs (AFTER $privInbox!)
                $tabs = self.dispatcher.filter(
                    new Event(self, "separate_direct_messages.tabs.filter", {event: event}),
                    jQuery(options.template.tabs(options.options.tabs))
                ).getReturnValue();
                options.methods.displayTabs($tabs, $privInbox);
            };

        this.mapping = function () {
            return {
                "display_message.inbox.pick": chooseInbox,
                "display_message.inbox.filter": [filterInbox, 100],
                "chat.init": [init, 80]
            };
        };
    };
}(jQuery, Listener, Event, Handlebars));
