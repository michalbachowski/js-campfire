var ChatFactory = function ($, Event, EventDispatcher) {
        "use strict";
        var dispatcher,
            self = {
                /**
                 * Attaches new plugin
                 *
                 * @member Chat
                 * @param  Listener plugin extending Listener class
                 * @return Chat
                 */
                attach: function (p) {
                    p.register(self.dispatcher());
                    // HOOK: plugin attached
                    dispatcher.notify(new Event(self, "chat.plugin.attach", {plugin: p}));
                    return self;
                },

                /**
                 * Returns event dispatcher instance
                 *
                 * @member Chat
                 * @return EventDispatcher
                 */
                dispatcher: function () {
                    return dispatcher;
                },

                /**
                 * Initializes chat
                 *
                 * @member Chat
                 * @return Chat
                 */
                init: function () {
                    throw "Invalid initialization - init function not set!";
                }
            },
            copyMessage = function (msg) {
                return $.extend(true, {}, msg);
            },
            callback = function (r) {
                if (1 !== r.status) {
                    return;
                }
                if (!r.response.hasOwnProperty('messages')) {
                    return;
                }
                // iterate throught response
                var idx, event;
                for (idx in r.response.messages) {
                    if (!r.response.messages.hasOwnProperty(idx)) {
                        continue;
                    }
                    // HOOK: dispatch message
                    event = dispatcher.notifyUntil(
                        new Event(
                            self,
                            "chat.message.dispatch",
                            {
                                message: r.response.messages[idx]
                            }
                        )
                    );
                    if (!event.isProcessed()) {
                        continue;
                    }
                    // HOOK: message dispatched
                    dispatcher.notify(
                        new Event(
                            self,
                            "chat.message.dispatched",
                            {
                                message: r.response.messages[idx]
                            }
                        )
                    );
                }
                // HOOK: response processed
                dispatcher.notify(new Event(self, "chat.response.processed", {response: r}));
            },

            doInit = function (pooler) {
                // HOOK: dispatch start
                dispatcher.notify(new Event(self, "chat.init"));

                // start pooling
                pooler(callback);
                return self;
            };

        return function (pooler, eventDispatcher) {
            dispatcher = eventDispatcher || new EventDispatcher();
            self.init = doInit;
            return self;
        };
    },
    Chat = ChatFactory(jQuery, Event, EventDispatcher);
