var ChatPluginDice = (function ($, Listener, Event) {
    "use strict";
    var defaults = {
        button: {
            label: 'roll',
            className: 'button-dice',
            attrs: 'data-toggle="dropdown"',
            options: {
                className: 'dice-dices',
                alternatives: [2, 3, 4, 6, 8, 10, 12, 20, 100].map(function (v) { return {label: 'k' + v, value: v}; })
            }
        },
        clickEventSelector: '.dice-dices a'
    };

    return function (params) {
        Listener.apply(this, arguments);

        var options = $.extend(true, {}, defaults, params),
            self = this,

            roll = function (dice) {
                self.dispatcher.notifyUntil(
                    new Event(
                        self,
                        "send_message.send",
                        {
                            message: {
                                message: "/roll " + dice
                            }
                        }
                    )
                );
            },
            init = function () {
                // add button
                self.dispatcher.notifyUntil(
                    new Event(
                        self,
                        "buttonbar.button.attach",
                        options.button
                    )
                );
                // handle 'click' events on 'Dice' buttons
                $("body").on('click', options.clickEventSelector, function (e) {
                    roll(e.target.dataset.value);
                });
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
            //    "dispatcher.message.display": [filter, 400],
                "chat.init": init
            };
        };

    };
}(jQuery, Listener, Event));
