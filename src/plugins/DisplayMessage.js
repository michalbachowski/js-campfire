var ChatPluginDisplayMessage = (function (jQuery, Listener, Event, Handlebars) {
    "use strict";
    var defaults = {
        inbox: "#inbox",
        template: {
            message: Handlebars.compile('<p id="{{id}}" class="const" data-author="{{from.name}}">' +
                '<strong class="user-name">{{displayName}}</strong> ' +
                '<span class="message">{{{message}}}</span>' +
                '</p>')
        }
    };

    return function (params) {
        Listener.apply(this, arguments);
        
        var self   = this,
            options = jQuery.extend(true, {}, defaults, params),
            $inbox = jQuery(options.inbox),
            createNode = function (from, displayName, message, id) {
                return jQuery(options.template.message({id: id, from: from, displayName: displayName, message: message}));
            },
            display = function (event) {
                var message = event.parameter("message"),
                    userName,
                    content,
                    node;
                if (message === void 0) {
                    return;
                }
                if ($inbox.find("#m" + message.id).length > 0) {
                    return;
                }

                // HOOK: prepare username
                userName = self.dispatcher.filter(
                    new Event(self, "display_message.name.filter", {"message": message}),
                    message.from.name
                ).getReturnValue();

                // HOOK: prepare message
                content = self.dispatcher.filter(
                    new Event(self, "display_message.message.filter", {"message": message}),
                    message.message
                ).getReturnValue();

                // HOOK: prepare node
                node = self.dispatcher.filter(
                    new Event(self, "display_message.node.filter", {"message": message}),
                    createNode(message.from, userName, content, message.id)
                ).getReturnValue().hide();

                // append node
                $inbox.prepend(node);
                node.slideDown("slow");

                return true;
            };

        this.mapping = function () {
            return {
                "dispatcher.message.display": display
            };
        };
    };
}(jQuery, Listener, Event, Handlebars));
