function ChatPluginDispatcher() {
    Listener.apply(this, arguments);

    this.mapping = function() {
        return {
            "chat.message.dispatch": dispatch
        };
    };

    var self = this;

    var dispatch = function(event) {
        // HOOK: filter massage
        var message = self.dispatcher.filter(new Event(self, "dispatcher.message.filter", {}), event.parameter("message")).getReturnValue();
        // HOOK: display
        var evt = self.dispatcher.notifyUntil(new Event(self, "dispatcher.message.display", {message: message}));
        if ( !evt.isProcessed() ) {
            return;
        }
        // HOOK: message displayed
        self.dispatcher.notify(new Event(self, "dispatcher.message.displayed", {message: message}));
        return true;
    };
}
