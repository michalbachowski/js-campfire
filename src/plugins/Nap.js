function ChatPluginNap( params ) {
    Listener.apply(this, arguments);

    this.mapping = function() {
        return {
            "dispatcher.message.display": [filter, 400],
            "chat.init": init
        };
    };

    var options = jQuery.extend(
        {
            messageInterval: 4 * 60,    // seconds
            labelSleep: "take a nap",
            labelWakeUp: "wake up"
        },
        params
    );
    var self = this;

    var intervalTime = options.messageInterval * 1000;
    var interval;

    var init = function() {
        self.dispatcher.notifyUntil(
            new Event(self, "buttonbar.button.attach",
                {label: options.labelSleep, callbacks: [sleep, wakeUp]}));
    };

    var filter = function(event) {
        var data = event.parameter("message");
        if (!("nap" in data)) {
            return;
        }
        if (Math.floor( Math.random() * 10 )>9) {
            return true;
        }
    };

    var send = function() {
        self.dispatcher.notifyUntil(
            new Event(self, "send_message.send",
                {message: {message: "/nap"}}));
    };

    var sleep = function() {
        if ( !interval ) {
            interval = setInterval(send, intervalTime);
        }
        return options.labelWakeUp;
    };

    var wakeUp = function() {
        if ( interval ) {
            clearInterval( interval );
            interval = null;
        }
        return options.labelSleep;
    };
}
