function ChatPluginTyping(inputSelector, params) {
    Listener.apply( this, arguments );
    
    this.mapping = function() {
        return {
            "dispatcher.message.display": [display, 200],
            "form.message.filter": filter,
            "chat.init": init,
            "title_alert.allow.filter": titleAlertAllow
        };
    };

    var self = this;

    var options = jQuery.extend(
        {
            clearingDelay: 15,  // seconds
            notifyDelay: 5      // seconds
        },
        params
        );
    var typingClass = 'typing';
    var timeout;
    var clearingTimeout;
    
    var getNode = function(message) {
        return self.dispatcher.notifyUntil(
        new Event(self, "users_list.node.get", {message: message})
        ).getReturnValue();
    };

    var clearTypingMessage = function(message) {
        getNode(message).removeClass(typingClass);
        clearTimeout( clearingTimeout );
        clearingTimeout = null;
    };

    var init = function (event) {
        jQuery(inputSelector || '#chat-form input[type=text]').bind("keypress", function() {
            if ( timeout || this.value.length < 20 || this.value.substr(0, 1) == '>' || this.value.substr(0, 1) == '$') {
                return;
            }
            timeout = setTimeout(notifyTyping, options.notifyDelay * 1000);
        } );
    };

    var display = function(event) {
        var data = event.parameter('message');
        var node = getNode(data);
        // omit "typing" message
        if ('typing' in data && data.typing && !clearingTimeout) {
            node.addClass(typingClass);
            // clear timeout
            setTimeout((function(message) {
                return function() { clearTypingMessage(message); };
            })(data), options.clearingDelay * 1000 );
            return true;
        }
        clearTypingMessage(data);
    };

    var filter = function(event, message) {
        // clear timeout
        clearTimeout( timeout );
        clearTimeout( clearingTimeout );
        clearingTimeout = null;
        timeout = null;
        return message;
    };

    var titleAlertAllow = function(event, allow) {
        if (!allow) {
            return allow;
        }
        var data = event.parameter("message");
        if ('typing' in data && data.typing) {
            allow = false;
        }
        return allow;
    };

    var notifyTyping = function() {
        var message = self.dispatcher.filter(
            new Event(self, "form.message.filter", {}),
            { message: '/typing' }
        ).getReturnValue();
        self.dispatcher.notifyUntil(new Event(self,"send_message.send", {message: message}));
        timeout = null;
    };
}
