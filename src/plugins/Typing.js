var ChatPluginTyping = (function (Listener, Event, $, clearTimeout, setTimeout) {
    "use strict";
    
    var defaults = {
        inputSelector: '#chat-form input[type=text]',
        clearingDelay: 15,  // seconds
        notifyDelay: 5,     // seconds
        typingClass: 'typing',
        methods: (function () {
            var getNode = function (self, message) {
                    return self.dispatcher.notifyUntil(
                        new Event(self, "users_list.node.get", {
                            nick: message.from.name
                        })
                    ).getReturnValue();
                },
                typingClass = 'typing';

            return {
                notifyTyping: function (self) {
                    // filter message
                    var message = self.dispatcher.filter(
                        new Event(self, "form.message.filter", {}),
                        { message: '/typing' }
                    ).getReturnValue();
                    // send message
                    self.dispatcher.notifyUntil(
                        new Event(self, "send_message.send", {
                            message: message
                        })
                    );
                },
                clearTypingNotification: function (self, message) {
                    var node = getNode(self, message);
                    if (node === void 0) {
                        return;
                    }
                    $(node).removeClass(typingClass);
                },
                showTypingNotification: function (self, message) {
                    var node = getNode(self, message);

                    if (node === void 0) {
                        return;
                    }
                    node.addClass(typingClass);
                }
            };
        }())
    };

    return function (inputSelector, params) {
        Listener.apply(this, arguments);
        
        var self = this,
            options = $.extend(true, {}, defaults, params),
            notifyingTimeout,
            clearingTimeout,
        
            clear = function (message) {
                options.methods.clearTypingNotification(self, message);
                clearTimeout(clearingTimeout);
                clearingTimeout = null;
            },

            notify = function () {
                options.methods.notifyTyping(self);
                clearTimeout(notifyingTimeout);
                notifyingTimeout = null;
            },

            // init plugin
            init = function (event) {
                $(options.inputSelector).bind("keypress", function () {
                    if (notifyingTimeout) {
                        return;
                    }
                    if (this.value.length < 20) {
                        return;
                    }
                    if (this.value.substr(0, 1) === '>') {
                        return;
                    }
                    if (this.value.substr(0, 1) === '$') {
                        return;
                    }
                    notifyingTimeout = setTimeout(notify, options.notifyDelay * 1000);
                });
            },

            // display "typing" information
            display = function (event) {
                var data = event.parameter('message');

                // show "typing" message
                if (data.hasOwnProperty('typing') && data.typing && !clearingTimeout) {
                    options.methods.showTypingNotification(self, data);
                    // clearing timeout
                    setTimeout((function (message) {
                        return function () { clear(message); };
                    }(data)), options.clearingDelay * 1000);
                    return true;
                }
                // clear typing notification
                clear(data);
            },

            // when filtering messages - clear timeouts
            // (prevent from re-sending 'typing' information after message was sent)
            filter = function (event, message) {
                // clear timeout
                clearTimeout(notifyingTimeout);
                clearTimeout(clearingTimeout);
                clearingTimeout = null;
                notifyingTimeout = null;
                return message;
            },

            // check whether titleAlert is allowed
            titleAlertAllow = function (event, allow) {
                if (!allow) {
                    return allow;
                }
                var data = event.parameter("message");
                if (data.hasOwnProperty('typing') && data.typing) {
                    allow = false;
                }
                return allow;
            };

        this.mapping = function () {
            return {
                "dispatcher.message.display": [display, 500],
                "form.message.filter": filter,
                "chat.init": init,
                "title_alert.allow.filter": titleAlertAllow
            };
        };
    };
}(Listener, Event, jQuery, clearTimeout, setTimeout));
