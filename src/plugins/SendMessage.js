function ChatPluginSendMessage(room, defaultUrl, timeout) {
    Listener.apply(this, arguments);

    timeout = timeout || 10; // seconds

    this.mapping = function() {
        return {
            "send_message.send": send
        };
    };

    room = room || "ognisko";
    var self   = this;

    var prepareUrl = function(eventUrl) {
        if (eventUrl === undefined) {
            return url;
        }
        return eventUrl.replace( /%room%/, room);
    };
    var url = prepareUrl(defaultUrl || "/jbapp/chat/%room%/odpowiedz.json");

    var send = function(event) {
        jQuery.ajax({
            url: prepareUrl(event.parameter("url")),
            data: event.parameter('message'),
            dataType: "text",
            type: "POST",
            success: function( response ) {
                var params = jQuery.parseJSON(response);
                if (params.status !== 1) {
                    invokeCallback(params, event.parameter("error"));
                } else {
                    invokeCallback(params, event.parameter("success"));
                }
            },
            error: function( response ) {
                invokeCallback(response, event.parameter("error"));
            },
            timeout: timeout * 1000
        });
        return true;
    };

    function invokeCallback(response, callback) {
        if (callback === undefined) {
            return;
        }
        try {
            return callback(response);
        } catch(e) {
            return;
        }
    }
}
