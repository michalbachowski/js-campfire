function ChatPluginBan(label) {
    Listener.apply( this, arguments );

    this.mapping = function() {
        return {
            "chat.init": init,
            "users_list.node.filter": filter,
            "form.response.success": response
        };
    };

    var ipClassName = 'user-ip';
    var buttonClassName = 'ban-button';
    label = label || "Ban";

    var self = this;
    var allowBan = false;

    var init = function() {
        // check whether user is allowed to ban others
        self.dispatcher.notifyUntil(
            new Event(self, "send_message.send",
                {message: {message: "$console allowed ban user"}, success: success}));
    };
    var success = function(response) {
        allowBan = response.response.console[0] != "Access denied" && response.response.console[0];
    };
    
    var banUser = function(data) {
        var user;
        // ban for logged users
        if ( data.id > 0 ) {
             user = data.id;
        // ban for guests
        } else {
            user = data.name;
        }
        self.dispatcher.notifyUntil(
             new Event(self, "send_message.send",
                {message: {message: "$ban user" + user}, success: afterBan}));
    };

    var afterBan = function(response) {
        if ( !( 'ban' in response ) ) {
            return;
        }
        // check whether user is allowed to ban others
        self.dispatcher.notifyUntil(
            new Event(self, "info_box.display",
                {message: response.ban[0]}));
    };

    var response = function(event) {
        afterBan(event.parameter("response"));
    };

    var filter = function(event, node) {
        var data = event.parameter("message");

        // HOOK: check whether IP could be displayed
        var ip = self.dispatcher.filter(
            new Event(self, "ban.ip.filter", {message: data}),
            data.from.ip
        ).getReturnValue();

        // append IP
        if ( ip.length > 0 ) {
            node.append(jQuery("<small >").addClass(ipClassName ).text(data.from.ip));
        }

        if ( !allowBan ) {
            return node;
        }

        // ban button
        var button = jQuery("<small />").addClass(buttonClassName).text(label)
            .bind("click", function() {
                var user = jQuery( this ).closest( "li" ).first().data( "chat-user" );
                banUser( user );
            } );
        node.append(button);
        return node;
    };
}
