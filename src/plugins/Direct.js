function ChatPluginDirect(inputSelector, label) {
    Listener.apply( this, arguments );

    this.mapping = function() {
        return {
            "display_message.node.filter": display,
            "users_list.node.filter": [filter, 50],
            "display_message.name.filter": username
        };
    };

    label = label || "Priv";
    var input = jQuery(inputSelector || "#chat-form input[type=text]");

    var self = this;

    var direct = function(name) {
        return function() {
            var val = input.val();
            if ( val.substr(0,1) == '>' ) {
                return false;
            }
            input.focus().val( '>' + name + ': ' + val);
            return false;
        };
    };

    var filter = function(event, node) {
        var data = event.parameter("message");
        var button = jQuery("<small />").text(label).addClass('button-direct-msg').bind("click", direct(data.from.name));
        node.append(button);
        return node;
    };

    var display = function(event, node) {
        var data = event.parameter("message");
        if ( 'to' in data && data.to.length > 0 ) {
            node.addClass('direct-message');
        }
        return node;
    };

    var username = function(event, username) {
        var data = event.parameter("message");
        if ( 'to' in data && data.to.length > 0 ) {
            username = username + '>' + data.to;
        }
        return username;
    };
}
