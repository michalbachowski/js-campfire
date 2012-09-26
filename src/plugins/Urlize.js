function ChatPluginUrlize() {
    Listener.apply( this, arguments );

    this.mapping = function() {
        return {
            "display_message.message.filter": urlize
        };
    };

    var urls  = new RegExp(
        "(^|[ \\t\\r\\n])((?:(?:http(s)?://)|(www\\.))((?:[a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@#&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))",
        "g"
    );
    var tag = '$1<a href="http$3://$4$5$6" target="_blank">$2</a>';
    var urlize = function(event, msg) {
        return msg.replace( urls, tag );
    };
}
