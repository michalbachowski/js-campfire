function ChatPluginInfoBox(box) {
    "use strict";
    Listener.apply(this, arguments);
    
    var self = this,
        display = function (event) {
            box
                .dialog("close")
                .text(event.parameter("message"))
                .dialog("open");
            return true;
        };

    this.mapping = function () {
        return {
            "info_box.display": display
        };
    };

}
