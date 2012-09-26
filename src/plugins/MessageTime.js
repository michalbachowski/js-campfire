function ChatPluginMessageTime() {
    Listener.apply( this, arguments );
    
    this.mapping = function() {
        return {
            'display_message.node.filter': notify
        };
    };

    var fullTime = function(date) {
        if (date<=9) {
            return "0" + date;
        }
        return date;
    };

    var notify = function(event, node) {
        var date = new Date();
        date.setTime( event.parameter('message').date * 1000 );
        node.prepend(
            jQuery( "<small />" )
            .append( fullTime( date.getHours() ) )
            .append( ":" )
            .append( fullTime( date.getMinutes() ) )
            .append( " " )
        );
        return node;
    };

}
