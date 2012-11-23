var ChatPluginDice = (function ($, Listener, Event) {
    "use strict";
    var defaults = {
        button: {
            label: '<i class="icon icon-repeat" />',
            className: 'button-dice',
            attrs: 'data-toggle="dropdown" rel="tooltip" title="Roll a dice"',
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

            filter = function (event, node) {
                var data = event.parameter("message");
                if (!data.hasOwnProperty("dice")) {
                    return node;
                }
                if (!data.dice) {
                    return node;
                }
                data.color = void 0;
                node.addClass('dice-roll');
                return node;
            };

        this.mapping = function () {
            return {
                "display_message.node.filter": [filter, 500],
                "chat.init": init
            };
        };

    };
}(jQuery, Listener, Event));
