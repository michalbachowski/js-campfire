var ChatPluginSeparateDirectMessages = (function (jQuery, Listener, Event, Handlebars) {
    "use strict";
    var defaults = {
        template: {
            tabs: Handlebars.compile('<ul class="nav nav-tabs row-fluid" id="{{id}}">' +
                '{{#each tabs}}' +
                    '<li {{#if this.className}}class="{{this.className}}"{{/if}}>' +
                        '<a href="#{{this.target}}" data-toggle="tab">{{this.label}}</a>' +
                        '<small class="badge badge-warning hidden">{{msgIndicator}}</small>' +
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

                displayPrivInbox: function (box, tabs) {
                    jQuery("#inbox")
                        .addClass("active")
                        .wrap(jQuery('<div class="tabbable"><div class="tab-content row-fluid"></div></div>').addClass(classes))
                        .after(box);
                },

                notifyPriv: function (box, tabs, msgs) {
                    tabs.find("a[href*=" + box.attr("id") + "]").next().removeClass("hidden").text(msgs);
                }
            };
        }()),

        options: {
            tabs: {
                id: "tabs",
                msgIndicator: '!!',
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
            msgs = {},
            filterInbox = function (event, inbox) {
                return options.methods.prepareInbox(inbox);
            },
            chooseInbox = function (event, inbox) {
                var data = event.parameter('message'),
                    $box,
                    id;
                // return inbox for ordinal message
                if (!data.hasOwnProperty('to') || data.to.length === 0) {
                    $box = inbox;
                } else {
                    $box = $privInbox;
                }
                id = $box.attr("id");
                // notify about new priv
                if ($box.is(":hidden")) {
                    if (!msgs.hasOwnProperty(id)) {
                        msgs[id] = 0;
                    }
                    msgs[id] = msgs[id] + 1;
                    options.methods.notifyPriv($box, $tabs, msgs[id]);
                }
                // return $privInbox for private message
                return $box;
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
                // hide badge
                $tabs.find('a[data-toggle="tab"]').on("shown", function (e) {
                    msgs[e.target.href.split('#')[1]] = 0;
                    jQuery(e.target).next().filter(".badge").addClass("hidden");
                });
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
