var ChatPluginSeparateDirectMessages = (function (jQuery, Listener, Event, Handlebars) {
    "use strict";
    var defaults = {
        methods: {
            notifyPriv: function (box, tabs, msgs) {
                tabs.find("a[href*=" + box.attr("id") + "]").next().removeClass("hidden").text(msgs);
            }
        },

        options: {
            privInbox: {
                label: 'Priv',
                target: 'priv'
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
            chooseInbox = function (event, inbox) {
                var data = event.parameter('message');
                // return inbox for ordinal message
                if (data.hasOwnProperty('to') && data.to.length > 0) {
                    return $privInbox;
                }
                return inbox;
            },
            init = function (event) {
                // display tab and priv inbox
                $privInbox = self.dispatcher.notifyUntil(
                    new Event(self, "tabbed_inbox.tab.add", options.options.privInbox)
                ).getReturnValue();
            };

        this.mapping = function () {
            return {
                "display_message.inbox.pick": chooseInbox,
                "chat.init": [init, 80]
            };
        };
    };
}(jQuery, Listener, Event, Handlebars));
