var ChatPluginMe = function () {
    "use strict";
    Listener.apply(this, arguments);

    var filter = function (event, node) {
        if (event.parameter("message").me) {
            node.addClass("me");
        }
        return node;
    };
    this.mapping = function () {
        return {
            "display_message.node.filter": filter
        };
    };
};
