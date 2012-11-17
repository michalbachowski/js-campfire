var ChatPluginNap = (function (jQuery, Listener, Event, setInterval, clearInterval) {
    "use strict";
    var defaults = {
        button: {
            label: 'click',
            className: 'button-nap',
            attrs: 'data-toggle="button"'
        },
        messageInterval: 4 * 60,    // seconds
        labelSleep: "take a nap",
        labelWakeUp: "wake up"
    };

    return function (params) {
        Listener.apply(this, arguments);

        var options = jQuery.extend(true, {}, defaults, params),
            self = this,
            intervalTime = options.messageInterval * 1000,
            interval,
            send = function () {
                self.dispatcher.notifyUntil(
                    new Event(
                        self,
                        "send_message.send",
                        {
                            message: {
                                message: "/nap"
                            }
                        }
                    )
                );
            },
            sleep = function () {
                if (!interval) {
                    interval = setInterval(send, intervalTime);
                }
                jQuery(this).text(options.labelWakeUp);
                return true;
            },
            wakeUp = function () {
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
                jQuery(this).text(options.labelSleep);
                return true;
            },
            init = function () {
                self.dispatcher.notifyUntil(
                    new Event(
                        self,
                        "buttonbar.button.attach",
                        jQuery.extend(true, {}, options.button, {label: options.labelSleep})
                    )
                ).getReturnValue().toggle(sleep, wakeUp);
            },

            filter = function (event) {
                var data = event.parameter("message");
                if (data.hasOwnProperty("nap")) {
                    return;
                }
                if (Math.floor(Math.random() * 10) > 9) {
                    return true;
                }
            };

        this.mapping = function () {
            return {
                "dispatcher.message.display": [filter, 300],
                "chat.init": init
            };
        };

    };
}(jQuery, Listener, Event, setInterval, clearInterval));
