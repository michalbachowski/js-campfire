var ChatPluginSendMessage = (function (jQuery, Listener) {
    "use strict";
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
                jQuery.ajax({
                    url: prepareUrl(event.parameter("url")),
                    data: event.parameter('message'),
                    dataType: "text",
                    type: "POST",
                    success: function (response) {
                        var params = jQuery.parseJSON(response);
                        if (params.status !== 1) {
                            invokeCallback(params, event.parameter("error"));
                        } else {
                            invokeCallback(params, event.parameter("success"));
                        }
                    },
                    error: function (response) {
                        invokeCallback(response, event.parameter("error"));
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
}(jQuery, Listener));
