function ChatPluginInfoBox( params ) {
    Listener.apply( this, arguments );
    
    this.mapping = function() {
        return {
            "chat.init": init,
            "info_box.display": display
        };
    };

    var self = this;
    var box;

    var init = function(event) {
        box = $("<p />").dialog({
            autoOpen: false,
            width: 200,
            height: 100
        });
    };

    var display = function(event) {
        box.dialog("close").text(event.parameter("message")).dialog("open");
        return true;
    };
}
