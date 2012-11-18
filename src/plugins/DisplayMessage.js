var ChatPluginDisplayMessage = (function (jQuery, Listener, Event, Handlebars) {
    "use strict";
    var defaults = {
        inbox: "#inbox",
        template: {
            message: Handlebars.compile('<p id="{{id}}" class="const" data-author="{{from.name}}">' +
                '<strong class="user-name">{{displayName}}</strong> ' +
                '<span class="message">{{{message}}}</span>' +
                '</p>'),
            inbox: '<div class="span12 well" id="inbox"></div>'
        },
        methods: {
            displayInbox: function (inbox) {
                inbox.appendTo("#body");
            }
        }
    };

    return function (params) {
        Listener.apply(this, arguments);
        
        var self   = this,
            options = jQuery.extend(true, {}, defaults, params),
            $inbox,
            createNode = function (from, displayName, message, id) {
                return jQuery(options.template.message({id: id, from: from, displayName: displayName, message: message}));
            },
            display = function (event) {
                var message = event.parameter("message"),
                    userName,
                    content,
                    node,
                    inbox;
                if (message === void 0) {
                    return;
                }
                if ($inbox.find("#m" + message.id).length > 0) {
                    return;
                }

                // HOOK: prepare username
                userName = self.dispatcher.filter(
                    new Event(self, "display_message.name.filter", {message: message}),
                    message.from.name
                ).getReturnValue();

                // HOOK: prepare message
                content = self.dispatcher.filter(
                    new Event(self, "display_message.message.filter", {message: message}),
                    message.message
                ).getReturnValue();

                // HOOK: prepare node
                node = self.dispatcher.filter(
                    new Event(self, "display_message.node.filter", {message: message}),
                    createNode(message.from, userName, content, message.id)
                ).getReturnValue().hide();

                // HOOK: prepare inbox (it is possible to append message to other container)
                inbox = self.dispatcher.filter(
                    new Event(self, "display_message.index.filter", {event: event, message: message, node: node}),
                    $inbox
                ).getReturnValue();

                // append node
                inbox.prepend(node);
                node.slideDown("slow");

                return true;
            },
            init = function (event) {
                $inbox = self.dispatcher.filter(
                    new Event(self, "display_message.inbox.filter", {event: event}),
                    jQuery(options.template.inbox)
                ).getReturnValue();
                options.methods.displayInbox($inbox);
            };

        this.mapping = function () {
            return {
                "dispatcher.message.display": display,
                "chat.init": [init, 100]
            };
        };
    };
}(jQuery, Listener, Event, Handlebars));
