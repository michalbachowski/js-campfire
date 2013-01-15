var ChatPluginError500 = (function ($, Listener) {
    "use strict";

    var defaults = {
        type: 'error'
    };

    return function (params) {
        Listener.apply(this, arguments);
        
        var self = this,
            options = $.extend(true, {}, defaults, params),
            
            error = function (event) {
                var r = event.parameter('response'),
                    err;
                if (r === void 0) {
                    return;
                }
                if (!r.hasOwnProperty('responseText')) {
                    return;
                }
                if (500 !== r.status) {
                    return;
                }
                r = $.parseJSON(r.responseText);
                if (!r.hasOwnProperty('error')) {
                    return;
                }
                if (!r.error.hasOwnProperty('message')) {
                    return;
                }
                self.alert(r.error.message, 'error');
            };

        this.mapping = function () {
            return {
                "send_message.response.received": error
            };
        };
    };
}(jQuery, PluginUtility));
