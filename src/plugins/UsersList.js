function ChatPluginUsersList(insertAfter, refreshInterval) {
    Listener.apply( this, arguments );

    this.mapping = function() {
        return {
            "dispatcher.message.displayed": display,
            "users_list.node.get": getNode
        };
    };
 
    var self  = this;
    var users = {};
    var refreshTimeout = (refreshInterval || 5) * 60;
    var box = $( "<ul />" ).addClass( "users-list" );
    jQuery(insertAfter || "#inbox").after(box);

    var display = function(event) {
        var date  = new Date();
        var time = date.getTime() / 1000 - refreshTimeout;
        var data = event.parameter("message");

        if ( data.date <= time ) {
            return;
        }
        getNode(event);
    };

    var getNode = function(event) {
        var data = event.parameter("message");

        if ( data.from.name in users ) {
            users[data.from.name].lastResponse = data.date;
        } else {
            users[data.from.name] = {
                user: data.from,
                node: displayUser(data),
                lastResponse: data.date
            };
        }
        event.setReturnValue(users[data.from.name].node);
    };

    var displayUser = function(data) {
        var node = jQuery( "<li />" );
        var user = data.from;

        // HOOK: filter user avatar
        var avatarUrl = self.dispatcher.filter(
            new Event(self, "users_list.avatar.filter", {message: data}),
            user.avatar
        );
        if ( avatarUrl ) {
            node.append(jQuery( "<img />" ).attr( "src", user.avatar ));
        }

        // HOOK: filter user nick
        var userNick = self.dispatcher.filter(
            new Event(self, "users_list.nick.filter", {message: data}),
            user.name
        ).getReturnValue();

        // HOOK: filter user nick node
        var nickNode = self.dispatcher.filter(
            new Event(self, "users_list.nick_node.filter", {message: data}),
            jQuery( "<strong />" ).addClass( "user-name" ).append(userNick)
        ).getReturnValue();

        if ( nickNode ) {
            node.append(nickNode);
        }

        // HOOK: filter user status
        var userStatus = self.dispatcher.filter(
            new Event(self, "users_list.title.filter", {message: data}),
            user.title
        ).getReturnValue();
        
        if ( userStatus ) {
            node.append(jQuery( "<small />" ).append( userStatus ));
        }

        // HOOK: filter user node
        node = self.dispatcher.filter(
            new Event(self, "users_list.node.filter", {message: data}),
            node
        ).getReturnValue();

        // append node
        node.data("chat-user", user).data("chat-user-nick", userNick);
        var destination = box.children( "li" ).filter(userFilter(userNick)).first();
        if( 0 === destination.length ) {
            box.append( node );
        } else {
            destination.before( node );
        }
        node.slideDown( "slow" );
        return node;
    };
    var userFilter = function(userNick) {
        var usr = jQuery(this).data( "chat-user" );
        return function() {
            return jQuery(this).data("chat-user-nick") > userNick;
        };
    };

    var nodeRemover = function() {
        // HOOK: notify that user has been removed from users list
        self.dispatcher.notify(new Event(self, "users_list.node.removed", {node: jQuery(this)}));
        jQuery( this ).remove();
    };
    var refresh = function() {
        var i;
        var date = new Date();
        var time = date.getTime() / 1000 - refreshTimeout;
        for ( i in users ) {
            if ( users[i].lastResponse > time ) {
                continue;
            }
            users[i].node.slideUp("slow", nodeRemover);
            delete users[i];
        }
    };
    var interval = setInterval(refresh, refreshTimeout);
}
