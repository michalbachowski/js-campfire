var ChatPluginSendMessage = (function (jQuery, Listener) {
    "use strict";
    return function (defaultUrl, timeout) {
        Listener.apply(this, arguments);

        timeout = timeout || 10; // seconds
        room = room || "ognisko";
        var self   = this,
            prepareUrl = function (eventUrl) {
                if (eventUrl === void 0) {
                    return defaultUrl;
                }
                return eventUrl.replace(/%room%/, room);
            },
            url = prepareUrl(defaultUrl || "/jbapp/chat/%room%/odpowiedz.json"),
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
                    timeout: timeout * 1000
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
