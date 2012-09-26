var ChatPluginNap = (function (jQuery, Listener, Event, setInterval, clearInterval) {
    "use strict";
    return function (params) {
        Listener.apply(this, arguments);

        var options = jQuery.extend(
                {
                    messageInterval: 4 * 60,    // seconds
                    labelSleep: "take a nap",
                    labelWakeUp: "wake up"
                },
                params
            ),
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
                return options.labelWakeUp;
            },
            wakeUp = function () {
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
                return options.labelSleep;
            },
            init = function () {
                self.dispatcher.notifyUntil(
                    new Event(
                        self,
                        "buttonbar.button.attach",
                        {
                            label: options.labelSleep,
                            callbacks: [
                                sleep,
                                wakeUp
                            ]
                        }
                    )
                );
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
                "dispatcher.message.display": [filter, 400],
                "chat.init": init
            };
        };

    };
}(jQuery, Listener, Event, setInterval, clearInterval));
