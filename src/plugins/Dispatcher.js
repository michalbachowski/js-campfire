var ChatPluginDispatcher = (function (Listener, Event) {
    "use strict";
    return function () {
        Listener.apply(this, arguments);

        var self = this,
            dispatch = function (event) {
                // HOOK: filter massage
                var message = self.dispatcher.filter(
                        new Event(
                            self,
                            "dispatcher.message.filter",
                            {}
                        ),
                        event.parameter("message")
                    ).getReturnValue(),
                    // HOOK: display
                    evt = self.dispatcher.notifyUntil(
                        new Event(
                            self,
                            "dispatcher.message.display",
                            {message: message}
                        )
                    );
                if (!evt.isProcessed()) {
                    return;
                }
                // HOOK: message displayed
                self.dispatcher.notify(new Event(self, "dispatcher.message.displayed", {message: message}));
                return true;
            };

        this.mapping = function () {
            return {
                "chat.message.dispatch": dispatch
            };
        };
    };
}(Listener, Event));
