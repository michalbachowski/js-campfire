function ChatPluginTitleAlert( params ) {
    Listener.apply( this, arguments );

    var self = this;
    this.mapping = function() {
        return {
            "dispatcher.message.displayed": notify
        };
    };

    var options = jQuery.extend(
        {
            duration: 0,
            interval: 700,
            stopOnFocus: true,
            requireBlur: true,
            stopOnMouseMove: true,
            message: "@ " + document.title,
            initialText: document.title
        },
        params
    );
    var notify = function(event) {
        // HOOK: check whether alert can be triggered
        var allow = self.dispatcher.filter(
            new Event(self, "title_alert.allow.filter", {message: event.parameter("message")}),
            true).getReturnValue();
        if (!allow) {
            return;
        }
        $.titleAlert(options.message, options);
    };
}
