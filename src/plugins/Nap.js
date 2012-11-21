var ChatPluginNap = (function (jQuery, PluginUtility, Event, setInterval, clearInterval, Handlebars) {
    "use strict";
    var defaults = {
        button: {
            label: '<i class="icon" />',
            className: 'button-nap',
            attrs: 'data-toggle="button" data-placement="bottom" rel="tooltip" title="Take nap"',
            split: true,
            options: {
                className: 'nap-options',
                alternatives: [
                    {label: '<i class="icon"></i> Hide nap messages', value: 'hide-nap-messages'}
                ]
            }
        },
        messageInterval: 4 * 60,    // seconds
        methods: {
            notifyStateChange: function (button, event) {
                return button.find(".nap-options a .icon").toggleClass('icon-ok');
            },
            
            getNapToggler: function (button) {
                return button.find('.button-nap');
            },

            changeState: (function () {
                var states = {
                    sleep: {
                        icon: "icon-eye-close",
                        title: 'Wake up'
                    },
                    wakeup: {
                        icon: "icon-eye-open",
                        title: 'Sleep'
                    }
                };
                return function (state, node) {
                    node
                        .attr("title", states[state].title)
                        .find(".icon")
                        .removeClass("icon-eye-open icon-eye-closed")
                        .addClass(states[state].icon);
                };
            }())
        },
        clickEventSelector: '.nap-options a'
    };

    return function (params) {
        PluginUtility.apply(this, arguments);

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
                options.methods.changeState('sleep', $(this));
                return true;
            },
            wakeUp = function () {
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
                options.methods.changeState('wakeup', $(this));
                return true;
            },

            changeState = function (e) {
                hideNap = !hideNap;
                self.config.write('nap.hide', hideNap);
                options.methods.notifyStateChange($button, e);
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
                // read config
                var hideNapTmp = self.config.read('nap.hide'),
                    toggler;
                if (hideNapTmp !== hideNap && hideNapTmp !== void 0) {
                    changeState();
                }
                toggler = options.methods.getNapToggler($button).toggle(sleep, wakeUp);
                // toggle first state
                wakeUp.apply(toggler);
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
                "dispatcher.message.display": [filter, 500],
                "chat.init": init
            };
        };
    };
}(jQuery, PluginUtility, Event, setInterval, clearInterval, Handlebars));
