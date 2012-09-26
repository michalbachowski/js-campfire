//ChatPluginDisplayMessage.prototype = new Listener();
function ChatPluginDisplayMessage(inboxId) {
    Listener.apply(this, arguments);
    
    this.mapping = function() {
        return {
            "dispatcher.message.display": display
        };
    };

    var self   = this;
    var inbox = jQuery(inboxId || "#inbox");
    var display = function(event) {
        var message = event.parameter("message");
        var priv_inbox = $('#priv_inbox');
        if ( message === undefined ) {
            return;
        }
        var existing = jQuery("#m" + message.id, inbox);
        if (existing.length>0) {
            return;
        }

        // HOOK: prepare username
        var userName = self.dispatcher.filter(
            new Event(self, "display_message.name.filter", {"message": message}),
            message.from.name
        ).getReturnValue();

        // HOOK: prepare message
        var content = self.dispatcher.filter(
            new Event(self, "display_message.message.filter", {"message": message}),
            message.message
        ).getReturnValue();

        // HOOK: prepare node
        var node = self.dispatcher.filter(
            new Event(self, "display_message.node.filter", {"message": message}),
            createNode(message.from, userName, content, message.id)
        ).getReturnValue();

        // append node
        var docelowy_box = inbox;
        if ($.jStorage.get('privy_w_osobnej_karcie') == true) {
            if (message.to == undefined)
                {
            //    docelowy_box = inbox;
                }
            else
                {
                docelowy_box = priv_inbox;
                }
        }
        $('#' + docelowy_box.attr('data-tab')).trigger('new_messages');
       
        docelowy_box.prepend(node);
        node.slideDown("slow");

        return true;
    };

    var createNode = function(from, displayName, message, id ) {
        return jQuery( "<p />" )
            .addClass( "const" )
            .data( "chat-user", from )
            .attr( "id", "m" + id )
            .attr( "data-author", from.name) // CSS
            .hide()
            .append( jQuery( "<strong />" ).append( displayName ).addClass( "user-name" ) )
            .append( jQuery( "<span />" ).append( " " ).append( message ).addClass( "message" ) );
    };
}
