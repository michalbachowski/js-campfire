var ChatPluginSendMessage = (function (jQuery, Listener, Event) {
    "use strict";
    var defaults = {
        url: void 0,
        message: '',
        success: void 0,
        error: void 0
    };

    return function (defaultUrl, timeout) {
        Listener.apply(this, arguments);

        var self   = this,
            url = defaultUrl || "/chat/response.json",
            prepareUrl = function (eventUrl) {
                if (eventUrl === void 0) {
                    return url;
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
                var parameters = jQuery(true, {}, defaults, self.dispatcher.filter(
                    new Event(
                        self,
                        "send_message.message.filter",
                        {event: event}
                    ),
                    event.parameters
                ));
                jQuery.ajax({
                    url: prepareUrl(parameters.url),
                    data: event.parameter('message'),
                    dataType: "text",
                    type: "POST",
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
                    timeout: (timeout || 10) * 1000
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
