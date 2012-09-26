var ChatPluginYoutubize = (function ($, Listener) {
    "use strict";
    // single frame for all instances
    var frame;

    return function (label) {
        Listener.apply(this, arguments);

        var pattern  = new RegExp(
                "http(s)?://www\\.youtube\\.com/watch\\?v=([a-zA-Z0-9\\-_]+)[a-zA-Z0-9$_.+!*(),;/?:@#&~=%-]*",
                "g"
            ),
            replacement = 'http$1://www.youtube.com/embed/$2',
            tag = '$0<span <a href="http$3://$4$5$6" target="_blank">$2</a>',
            youtubize = function (event, node) {
                if (frame === void 0) {
                    frame = $('<iframe width="560px" height="315px" frameborder="0" allowfullscreen></iframe>');
                    frame.dialog({
                        width: 355,
                        height: 340,
                        autoOpen: false,
                        title: label || "YouTube player"
                    });
                }
                node.find("a").each(function () {
                    if (this.href.indexOf('www.youtube.com') === -1) {
                        return;
                    }
                    $(this).bind("click", function () {
                        frame.attr("src", this.href.replace(pattern, replacement)).dialog("open");
                        return false;
                    });
                });
                return node;
            };
        // missing jQuery dialog
        if ($.fn.dialog === void 0) {
            youtubize = function (event, node) {
                return node;
            };
        }
        this.mapping = function () {
            return {
                "display_message.node.filter": [youtubize, 50]
            };
        };

    };
}(jQuery, Listener));
