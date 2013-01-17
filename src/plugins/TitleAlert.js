var ChatPluginTitleAlert = (function (PluginUtility, defaultTitle, $, Event) {
    "use strict";

    var defaults = {
        duration: 0,
        interval: 700,
        stopOnFocus: true,
        requireBlur: true,
        stopOnMouseMove: true,
        message: "@ " + defaultTitle,
        initialText: defaultTitle
    };
    return function (params) {
        PluginUtility.apply(this, arguments);

        var self = this,
            options = $.extend({}, defaults, params),
            notify = function (event) {
                // HOOK: check whether alert can be triggered
                var allow = self.dispatcher.filter(
                    new Event(self, "title_alert.allow.filter", {message: event.parameter("message")}),
                    true
                ).getReturnValue();
                if (!allow) {
                    return;
                }
                $.titleAlert(options.message, options);
            };
        this.mapping = function () {
            return {
                "dispatcher.message.displayed": notify
            };
        };
    };
}(PluginUtility, document.title, jQuery, Event));
