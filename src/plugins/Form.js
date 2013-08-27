var ChatPluginForm = (function (jQuery, Listener, Event, Handlebars) {
    "use strict";
    var defaults = {
        template: {
            form: Handlebars.compile('<form action="{{action}}" method="post" id="chat-form" class="row-fluid form-inline">' +
                '<fieldset class="input-append span7">' +
                '<input type="text" name="message" placeholder="{{placeholder}}" autocomplete="off" />' +
                '<input type="submit" value="{{label}}" class="btn" />' +
                '</fieldset>' +
                '</form>')
        },
        options: {
            form: {
                action: '/campfire/reply.json',
                placeholder: 'Type message...',
                label: 'Reply'
            }
        },
        methods: {
            display: function (form) {
                form.insertBefore("#body");
            }
        }
    };

    return function (params) {
        Listener.apply(this, arguments);

        var self = this,
            $form,
            options = jQuery.extend(true, {}, defaults, params),

            getForm = function (event) {
                event.setReturnValue($form);
                return true;
            },
            formToDict = function () {
                var fields = $form.serializeArray(),
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
                $form.find("input[type=text]").val("").select();
                self.dispatcher.notify(new Event(self, "form.message.cleared"));
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
            },

            // bind form events
            init = function (event) {
                $form = jQuery(options.template.form(options.options.form)).bind("submit", function (e) {
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
                options.methods.display($form);
            };

        // set mapping
        this.mapping = function () {
            return {
                "form.get": getForm,
                "chat.init": init
            };
        };
    };
}(jQuery, Listener, Event, Handlebars));
