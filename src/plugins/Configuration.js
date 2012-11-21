var ChatPluginConfiguration = (function (Listener, $) {
    "use strict";
    var defaults = {
        methods: {
            write: function (key, value, event) {
                $.jStorage.set(key, value);
                return true;
            },

            read: function (key, event) {
                return $.jStorage.get(key);
            }
        }
    };

    return function (params) {
        Listener.apply(this, arguments);

        var self = this,
            options = $.extend(true, {}, defaults, params),
            
            write = function (event, node) {
                return options.methods.write(event.parameter('key'), event.parameter('value'), event);
            },
            read = function (event) {
                var val = options.methods.read(event.parameter('key'), event);
                if (val === void 0) {
                    return false;
                }
                event.setReturnValue(val);
                return true;
            };

        this.mapping = function () {
            return {
                "configuration.write": write,
                "configuration.read": read
            };
        };
    };
}(Listener, jQuery));
