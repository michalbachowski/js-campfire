function ChatPluginMe() {
    Listener.apply( this, arguments );

    this.mapping = function() {
        return {
            "display_message.node.filter": notify
        };
    };

    var notify = function(event, node) {
        if ( event.parameter("message").me ) {
            node.addClass( "me" );
        }
        return node;
    };
}
