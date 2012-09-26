var ChatPluginYoutubize = (function() {
    // single frame for all chat instances
    var frame;

    return function( label ) {
        Listener.apply( this, arguments );

        this.mapping = function() {
            return {
                "display_message.node.filter": [youtubize, 50]
            };
        };

        label = label || "YouTube player";

        var pattern  = new RegExp(
            "http(s)?://www\\.youtube\\.com/watch\\?v=([a-zA-Z0-9\\-_]+)[a-zA-Z0-9$_.+!*(),;/?:@#&~=%-]*",
            "g"
        );
        var replacement = 'http$1://www.youtube.com/embed/$2';

        var tag = '$0<span <a href="http$3://$4$5$6" target="_blank">$2</a>';
        var youtubize = function(event, node) {
            if ( frame === undefined ) {
                frame = $('<iframe width="560px" height="315px" frameborder="0" allowfullscreen></iframe>');
                frame.dialog( {
                    width: 355,
                    height: 340,
                    autoOpen: false,
                    title: label
                });
            }
            node.find("a").each(function() {
                if ( this.href.indexOf('www.youtube.com' ) === -1 ) {
                    return;
                }
                /**
                var href = this.href.replace(pattern, replacement);
                var play = $("<small />").text("(play)").bind("click", function() {
                    frame.attr("src", href).dialog("open");
                });
                a.after(play);
                //*/
                $(this).bind("click", function() {
                    frame.attr("src", this.href.replace(pattern, replacement) ).dialog("open");
                    return false;
                } );
            } );
            return node;
        };
    };
})();
