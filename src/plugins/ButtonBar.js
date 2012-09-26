function ChatPluginButtonBar(appendTo) {
    Listener.apply( this, arguments );

    this.mapping = function() {
        return {
            "chat.init": [init, 400],
            "buttonbar.button.attach": attach
        };
    };

    appendTo = appendTo || "#chat-form";
    var className = "button-bar";
    var barTag = "<div />";
    var buttonTag = "<span />";
    var box;
    var buttons = {};
    var self = this;

    var wrap = function(callback) {
        return function(e) {
            jQuery(this).text(callback(e));
        };
    };

    var attach = function(event) {
        var callbacks = event.parameter("callbacks");
        var i;
        var button = jQuery('<span />').text(event.parameter("label"));
        var args = [];
        for(i in callbacks) {
            args.push(wrap(callbacks[i]));
        }
        jQuery.fn.toggle.apply(button, args);
        box.append(button);
        return true;
    };

    var init = function() {
        box = $( "<div />" ).addClass("button-bar");
        $(appendTo).append(box);
    };
}
