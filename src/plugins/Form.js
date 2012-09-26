function ChatPluginForm(formId) {
    Listener.apply(this, arguments);

    this.mapping = function() {
        return {
            "form.get": getForm
        };
    };

    var self = this;

    var form = jQuery(formId || "#chat-form").bind("submit", function(e) {
        e.stopPropagation();
        onSubmit();
        return false;
    }).bind("keypress", function(e) {
        if (e.keyCode == 13) {
            e.stopPropagation();
            onSubmit();
            return false;
        }
    });

    var getForm = function(event) {
        event.setReturnValue(form);
        return true;
    };

    var onSubmit = function() {
        var message = self.dispatcher.filter(
            new Event(self, "form.message.filter", {}),
            formToDict()
        ).getReturnValue();
        var event = self.dispatcher.notifyUntil(
            new Event(self, "send_message.send",
                {message: message, success: success, error: error}));
        if (!event.isProcessed()) {
            throw("Event 'send_message.send' was not processed!");
        }
        erase();
    };

    var success = function(response) {
        self.dispatcher.notify(
            new Event(self, "form.response.success",
                {response: response.response}));
    };

    var error = function(response) {
        self.dispatcher.notify(
            new Event(self,
                "form.response.error", {response: response}));
    };

    var erase = function() {
        form.find("input[type=text]").val("").select();
    };

    var formToDict = function() {
        var fields = form.serializeArray();
        var json = {};
        var i = 0;
        for ( ; i < fields.length; i++ ) {
            json[fields[i].name] = fields[i].value;
        }
        return json;
    };
}
