var ChatPluginSendMessage = (function (jQuery, Listener, Event) {
    "use strict";
    var defaults = {
        ajax: {
            type: 'POST',
            url: void 0,
            message: '',
            success: void 0,
            error: void 0
        },
        url: "/chat/response.json",
        timeout: 10 // seconds
    };

    return function (params) {
        Listener.apply(this, arguments);

        var self   = this,
            options = jQuery.extend(true, {}, defaults, params),
            prepareUrl = function (eventUrl) {
                if (eventUrl === void 0) {
                    return options.url;
                }
                return eventUrl;
            },
            invokeCallback = function (response, callback) {
                if (callback === void 0) {
                    return;
                }
                try {
                    return callback(response);
                } catch (e) {
                    return;
                }
            },
            send = function (event) {
                var parameters = jQuery.extend(
                    true,
                    {},
                    options.ajax,
                    self.dispatcher.filter(
                        new Event(
                            self,
                            "send_message.message.filter",
                            {event: event}
                        ),
                        event.parameters()
                    ).getReturnValue()
                );
                jQuery.ajax({
                    url: prepareUrl(parameters.url),
                    data: event.parameter('message'),
                    dataType: "text",
                    type: parameters.type,
                    success: function (response) {
                        var params = jQuery.parseJSON(response);
                        if (params.status !== 1) {
                            invokeCallback(params, parameters.error);
                        } else {
                            invokeCallback(params, parameters.success);
                        }
                    },
                    error: function (response) {
                        invokeCallback(response, parameters.error);
                    },
                    timeout: options.timeout * 1000
                });
                return true;
            };
        
        this.mapping = function () {
            return {
                "send_message.send": send
            };
        };
    };
}(jQuery, Listener, Event));
