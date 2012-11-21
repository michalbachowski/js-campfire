var ChatPluginNap = (function (jQuery, Listener, Event, setInterval, clearInterval, Handlebars) {
    "use strict";
    var defaults = {
        button: {
            label: 'click',
            className: 'button-nap',
            attrs: 'data-toggle="button"',
            split: true,
            options: {
                className: 'nap-options',
                alternatives: [
                    {label: '<i class="icon icon-remove"></i> Hide nap messages', value: 'hide-nap-messages'}
                ]
            }
        },
        messageInterval: 4 * 60,    // seconds
        labelSleep: "take a nap",
        labelWakeUp: "wake up",
        methods: {
            notifyStateChange: function (button, clickedNode) {
                return clickedNode.find(".icon").toggleClass('icon-remove').toggleClass('icon-ok');
            },
            getNapToggler: function (button) {
                return button.find('.button-nap');
            }
        },
        clickEventSelector: '.nap-options a'
    };

    return function (params) {
        Listener.apply(this, arguments);

        var options = jQuery.extend(true, {}, defaults, params),
            self = this,
            hideNap = false,
            $button,
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

            changeState = function (e) {
                hideNap = !hideNap;
                options.methods.notifyStateChange($button, jQuery(e.target));
                return false;
            },

            init = function () {
                // attach button
                $button = self.dispatcher.notifyUntil(
                    new Event(
                        self,
                        "buttonbar.button.attach",
                        jQuery.extend(true, {}, options.button, {label: options.labelSleep})
                    )
                ).getReturnValue();
                options.methods.getNapToggler($button).toggle(sleep, wakeUp);
                // handle clicks
                jQuery("body").on("click", options.clickEventSelector, changeState);
            },

            filter = function (event) {
                var data = event.parameter("message");
                if (!data.hasOwnProperty("nap")) {
                    return;
                }
                if (hideNap) {
                    return true;
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
}(jQuery, Listener, Event, setInterval, clearInterval, Handlebars));
