function ChatPluginColor( params ) {
    Listener.apply( this, arguments );

    this.mapping = function() {
        return {
            "display_message.node.filter": colorize
        };
    };

    var colorize = function(event, node) {
        var data = event.parameter("message");
        if (!('color' in data)) {
            return node;
        }
        if ( null === data.color ) {
            return node;
        }
        if ( 0 === data.color.length ) {
            return node;
        }
        node.css( 'color', data.color );
        return node;
    };
}
