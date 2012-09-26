function ChatPluginJbUser() {
    Listener.apply( this, arguments );

    this.mapping = function() {
        return {
            "users_list.nick.filter": filterNick,
            "users_list.nick_node.filter": filterNickNode
        };
    };

    var filterNick = function(event, nick) {
        var user = event.parameter("message").from;
        if ('id' in user && user.id > 0 && 'rank' in user && user.rank.length > 0) {
            return user.rank + ' ' + nick;
        }
        return nick;
    };

    var filterNickNode = function(event, node) {
        var user = event.parameter("message").from;
        if ('id' in user && user.id > 0) {
            return jQuery("<a />").attr("href", "http://jaskiniowcy.heroes.net.pl/mieszkaniec/" + user.id).append(node.text());
        }
        return node;
    };
} 
