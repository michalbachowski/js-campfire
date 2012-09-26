var ChatPluginColor = function (params) {
    "use strict";
    Listener.apply(this, arguments);

    var colorize = function (event, node) {
        var data = event.parameter("message");
        if (!data.hasOwnProperty('color')) {
            return node;
        }
        if (null === data.color) {
            return node;
        }
        if (0 === data.color.length) {
            return node;
        }
        node.css('color', data.color);
        return node;
    };
    
    this.mapping = function () {
        return {
            "display_message.node.filter": colorize
        };
    };
}
