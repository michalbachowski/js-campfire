var ChatPluginTabbedInbox = (function (jQuery, Listener, Event, Handlebars) {
    "use strict";
    var defaults = {
        template: {
            tabBox: Handlebars.compile('<div class="tabbable">' +
                '<ul class="nav nav-tabs row-fluid" id="{{id}}" />' +
                '<div class="tab-content row-fluid"></div>' +
                '</div>'),
            tab: Handlebars.compile('<li class="{{className}}">' +
                    '<a href="#{{target}}" data-toggle="tab">{{label}}</a>' +
                    '<small class="badge badge-warning hidden"></small>' +
                '</li>'),
            inbox: Handlebars.compile('<div id="{{target}}" />')
        },

        methods: (function () {
            var classes;
            return {
                displayTabBox: function (box) {
                    // display tabbox
                    box.appendTo('#body');
                    // move inbox inside of tab-content
                    jQuery("#inbox").appendTo(".tab-content").addClass("active");
                },

                displayTab: function (tab, tabBox) {
                    tabBox.find('.nav-tabs').append(tab);
                },

                findBadge: function (node) {
                    return node.next().filter(".badge");
                },

                prepareInbox: function (box) {
                    if (classes === void 0) {
                        classes = box.removeClass("well").attr("class");
                    }
                    return box.removeClass(box.attr("class")).addClass("tab-pane well");
                },

                displayInbox: function (box) {
                    box.appendTo('.tab-content');
                },

                notify: function (inbox, tabBox, msgs) {
                    tabBox.find("a[href*=" + inbox.attr("id") + "]").next().removeClass("hidden").text(msgs);
                }
            };
        }()),

        options: {
            tabBox: {
                id: "tabs"
            },
            tab: {
                label: 'Tab',
                target: '',
                className: ''
            }
        }
    };

    return function (params) {
        Listener.apply(this, arguments);
        
        var self   = this,
            options = jQuery.extend(true, {}, defaults, params),
            tabs = {},
            hasActiveTab = false,
            $tabBox,
            msgs = {},
            createTab = function (params) {
                var data = jQuery.extend(true, {}, options.options.tab, params);
                if (tabs.hasOwnProperty(data.target)) {
                    throw '"target" has been used already';
                }
                tabs[data.target] = jQuery(options.template.tab(data));
                options.methods.displayTab(tabs[data.target], $tabBox);
                tabs[data.target].find('a[data-toggle="tab"]').on("shown", function (e) {
                    msgs[e.target.href.split('#')[1]] = 0;
                    options.methods.findBadge(jQuery(e.target)).addClass("hidden");
                });
                return tabs[data.target];
            },
            chooseInbox = function (event, inbox) {
                if (inbox.is(':visible')) {
                    return inbox;
                }
                var id = inbox.attr("id");
                // notify about new priv
                if (!msgs.hasOwnProperty(id)) {
                    msgs[id] = 0;
                }
                msgs[id] = msgs[id] + 1;
                options.methods.notify(inbox, $tabBox, msgs[id]);
                return inbox;
            },
            // filters inbox
            filterInbox = function (event, inbox) {
                // add tab
                var tab = createTab(jQuery.extend(true, {}, event.parameters(), {target: inbox.attr("id")}));
                options.methods.prepareInbox(inbox);
                if (!hasActiveTab) {
                    hasActiveTab = true;
                    tab.addClass("active");
                    inbox.addClass("active");
                }
                return inbox;
            },
            moveInbox = function (event) {
                options.methods.displayInbox(event.parameter('inbox'));
                return true;
            },
            // creates inbox
            createInbox = function (event, params) {
                var inbox = filterInbox(event, jQuery(options.template.inbox(
                    jQuery.extend(true, {}, options.options.tab, params)
                )));
                options.methods.displayInbox(inbox);
                return inbox;
            },
            // adds new tab
            addTab = function (event) {
                event.setReturnValue({
                    tab: createTab(event.parameters()),
                    inbox: createInbox(event.parameters())
                });
                return true;
            },
            // initializes new tabbed inbox
            init = function (event) {
                // display tab box
                $tabBox = self.dispatcher.filter(
                    new Event(self, "separate_direct_messages.tabs.filter", {event: event}),
                    jQuery(options.template.tabBox(options.options.tabBox))
                ).getReturnValue();
                options.methods.displayTabBox($tabBox);
            };

        this.mapping = function () {
            return {
                "display_message.inbox.filter": [filterInbox, 100],
                "display_message.inbox.displayed": moveInbox,
                "display_message.inbox.pick": [chooseInbox, 300],
                "tabbed_inbox.tab.add": addTab,
                "chat.init": [init, 110]
            };
        };
    };
}(jQuery, Listener, Event, Handlebars));
