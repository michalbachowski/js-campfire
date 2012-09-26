function ChatPluginPuppet(puppetTitle) {
    Listener.apply(this, arguments);

    this.mapping = function() {
        return {
            "chat.init": init,
            "users_list.title.filter": filterTitle,
            "form.message.filter": filterMessage,
            "ban.ip.filter": filterIp
        };
    };

    var self = this;
    var input;
    var hasPuppet = false;

    var filterIp = function(event, ip) {
        var data = event.parameter("message");
        if ('as_puppet' in data && data.as_puppet) {
            return '';
        }
        return ip;
    };

    var filterTitle = function(event, title) {
        var data = event.parameter("message");
        if ( 'as_puppet' in data && data.as_puppet ) {
            return puppetTitle;
        }
        return title;
    };

    var callback = function(response) {
        var form = self.dispatcher.notifyUntil(
            new Event(self, "form.get", {}));
        if (!form.isProcessed()) {
            return;
        }
        input = jQuery( '<input type="checkbox" />' )
            .attr( "name", "as_puppet" )
            .attr( "id", "as_puppet" )
            .val( 1 )
            .bind( "change", function() {
                form.getReturnValue().find( "input[type=text]" ).first().focus();
            } );
        var label = jQuery( "<label />" )
            .attr( "for", "as_puppet" )
            .append( response.response.puppet[0][0] )
            .append( input );
        $('.button-bar').before(
            jQuery( "<div />" )
            .addClass( "check" )
            .append( label )
        );
        hasPuppet = true;
    };

    var init = function() {
        self.dispatcher.notifyUntil(
            new Event(self, "send_message.send",{
                message: {message: "$puppet get"},
                success: callback
            })
        );
    };

    var filterMessage = function(event, data) {
        if (hasPuppet && input.attr("checked")) {
            data.as_puppet = 1;
        }
        return data;
    };
}
