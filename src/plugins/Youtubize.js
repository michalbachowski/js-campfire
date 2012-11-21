var ChatPluginYoutubize = (function ($, Listener, Handlebars, Event) {
    "use strict";
    var defaults = {
            button: {
                label: '<i class="icon icon-film" />',
                className: 'button-youtube',
                attrs: 'data-toggle="dropdown" data-placement="bottom" rel="tooltip" title="Youtube"',
                options: {
                    className: 'youtube-player',
                    alternatives: [
                        {label: '<iframe width=\'360px\' height=\'315px\' frameborder=\'0\' allowfullscreen></iframe>', value: ''}
                    ]
                }
            },
            methods: {
                getFrame: function (node) {
                    var frame = node.find("iframe"),
                        a = frame.closest('a');
                    frame.appendTo(frame.closest("li"));
                    a.remove();
                    return frame;
                },

                showPlayer: function (node) {
                    node.find(".btn").dropdown('toggle');
                }
            }
        },
        
        pattern  = new RegExp(
            "http(s)?://www\\.youtube\\.com/watch\\?v=([a-zA-Z0-9\\-_]+)[a-zA-Z0-9$_.+!*(),;/?:@#&~=%-]*",
            "g"
        ),
        replacement = 'http$1://www.youtube.com/embed/$2',
        tag = '$0<span <a href="http$3://$4$5$6" target="_blank">$2</a>';

    return function (params) {
        Listener.apply(this, arguments);

        var self = this,
            $frame,
            $button,
            options = $.extend(true, {}, defaults, params),
            
            youtubize = function (event, node) {
                node.find("a").filter("[href*='www.youtube.com']").addClass("youtube-link");
                return node;
            },

            init = function (event) {
                // add button and prepare player frame
                $button = self.dispatcher.notifyUntil(
                    new Event(
                        self,
                        "buttonbar.button.attach",
                        options.button
                    )
                ).getReturnValue();
                $frame = options.methods.getFrame($button);
                
                // handle click event
                $('body').on("click", ".youtube-link", function (e) {
                    $frame.attr("src", e.target.href.replace(pattern, replacement));
                    options.methods.showPlayer($button);
                    return false;
                });
            };
            
        this.mapping = function () {
            return {
                "display_message.node.filter": [youtubize, 50],
                "chat.init": init
            };
        };

    };
}(jQuery, Listener, Handlebars, Event));
