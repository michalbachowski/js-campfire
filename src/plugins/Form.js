var ChatPluginForm = (function (jQuery, Listener, Event) {
    "use strict";
    return function (formId) {
        Listener.apply(this, arguments);

        var self = this,
            form,
            getForm = function (event) {
                event.setReturnValue(form);
                return true;
            },
            formToDict = function () {
                var fields = form.serializeArray(),
                    json = {},
                    i = 0;
                for (i = 0; i < fields.length; i += 1) {
                    json[fields[i].name] = fields[i].value;
                }
                return json;
            },
            success = function (response) {
                self.dispatcher.notify(
                    new Event(
                        self,
                        "form.response.success",
                        {
                            response: response.response
                        }
                    )
                );
            },

            error = function (response) {
                self.dispatcher.notify(
                    new Event(
                        self,
                        "form.response.error",
                        {
                            response: response
                        }
                    )
                );
            },

            clear = function () {
                form.find("input[type=text]").val("").select();
            },

            onSubmit = function () {
                var message = self.dispatcher.filter(
                        new Event(self, "form.message.filter", {}),
                        formToDict()
                    ).getReturnValue(),
                    event = self.dispatcher.notifyUntil(
                        new Event(
                            self,
                            "send_message.send",
                            {
                                message: message,
                                success: success,
                                error: error
                            }
                        )
                    );
                if (!event.isProcessed()) {
                    throw ("Event 'send_message.send' was not processed!");
                }
                clear();
            };

        // bind form events
        form = jQuery(formId || "#chat-form").bind("submit", function (e) {
            e.stopPropagation();
            onSubmit();
            return false;
        }).bind("keypress", function (e) {
            if (13 === e.keyCode) {
                e.stopPropagation();
                onSubmit();
                return false;
            }
        });

        // set mapping
        this.mapping = function () {
            return {
                "form.get": getForm
            };
        };
    };
}(jQuery, Listener, Event));
