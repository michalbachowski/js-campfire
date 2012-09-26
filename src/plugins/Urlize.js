var ChatPluginUrlize = function () {
    "use strict";
    Listener.apply( this, arguments );

    var urls  = new RegExp(
            "(^|[ \\t\\r\\n])((?:(?:http(s)?://)|(www\\.))" +
                "((?:[a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@#&~=%-]*))?" +
                "([A-Za-z0-9$_+!*();/?:~-]))",
            "g"
        ),
        tag = '$1<a href="http$3://$4$5$6" target="_blank">$2</a>',
        urlize = function (event, msg) {
            return msg.replace(urls, tag);
        };

    this.mapping = function () {
        return {
            "display_message.message.filter": urlize
        };
    };
};
