var ChatPluginDisplayMessage = (function (jQuery, Listener, Event) {
    "use strict";
    return function (inboxId) {
        Listener.apply(this, arguments);
        
        var self   = this,
            $inbox = jQuery(inboxId || "#inbox"),
            createNode = function (from, displayName, message, id) {
                return jQuery("<p />")
                    .addClass("const")
                    .data("chat-user", from)
                    .attr("id", "m" + id)
                    .attr("data-author", from.name) // CSS
                    .hide()
                    .append(jQuery("<strong />").append(displayName).addClass("user-name"))
                    .append(jQuery("<span />").append(" ").append(message).addClass("message"));
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
                ).getReturnValue();

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
}(jQuery, Listener, Event));
