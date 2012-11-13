var ChatPluginUsersList = (function (Listener, Event, $, Handlebars, setInterval) {
    "use strict";
    var defaults = {
        refresh: 5,
        insert: '#inbox',
        template: {
            user: Handlebars.compile('<li class="row-fluid chat-user" data-nick="{{nick}}">' +
                    '<img src="{{avatar}}" />' +
                    '<strong>{{nick}}</strong>' +
                    '<small>{{title}}</small>' +
                    '<div class="btn-group" />' +
                '</li>'),
            box: Handlebars.compile('<ul class="users-list span3" />')
        }
    
    };

    return function (params) {
        Listener.apply(this, arguments);

        var self  = this,
            users = {},
            options = $.extend(true, {}, defaults, params),
            cleaningTimeout = options.refresh * 60,
            box = $(options.template.box()),
            userTemplate = options.template.user,

            // creates new node
            createNode = function (data) {
                var user = {
                        // HOOK: filter user avatar
                        avatar: self.dispatcher.filter(
                            new Event(self, "users_list.avatar.filter", {message: data}),
                            data.from.avatar
                        ).getReturnValue(),

                        // HOOK: filter user nick
                        nick: self.dispatcher.filter(
                            new Event(self, "users_list.nick.filter", {message: data}),
                            data.from.name
                        ).getReturnValue(),
                        
                        // HOOK: filter user status
                        title: self.dispatcher.filter(
                            new Event(self, "users_list.title.filter", {message: data}),
                            data.from.title
                        ).getReturnValue()
                    },

                    node = $(options.template.user(user));

                // HOOK: filter user node
                node = self.dispatcher.filter(
                    new Event(self, "users_list.node.filter", {message: data}),
                    node
                ).getReturnValue();

                return node;
            },

            // displays given node
            displayNode = function (node) {
                // find place where to put new node
                var nick = node.get(0).dataset.nick,
                    destination = box
                        .children()
                        .filter(function () {
                            return this.dataset.nick > nick;
                        })
                        .first();

                // append node
                if (0 === destination.length) {
                    box.append(node);
                } else {
                    destination.before(node);
                }
                node.slideDown("slow");
            },

            // displays user
            // if structure for given user is missing - creates new one
            display = function (event) {
                var date  = new Date(),
                    time = date.getTime() / 1000 - cleaningTimeout,
                    data = event.parameter("message");

                if (data.date <= time) {
                    return;
                }

                if (!users.hasOwnProperty(data.from.name)) {
                    users[data.from.name] = {
                        user: data.from,
                        node: createNode(data),
                        lastResponse: data.date
                    };
                    // display node
                    displayNode(users[data.from.name].node);
                }
                users[data.from.name].lastResponse = data.date;
            },
            
            // returns node information
            // if node for given user is missing - does nothing
            getNode = function (event) {
                var nick = event.parameter("nick");

                if (users.hasOwnProperty(nick)) {
                    event.setReturnValue(users[nick].node);
                }
                return true;
            },
            
            // returns user data
            // if data for given user is missing - does nothins
            getUser = function (event) {
                var nick = event.parameter("nick");
                if (users.hasOwnProperty(nick)) {
                    event.setReturnValue(users[nick].user);
                }
                return true;
            },

            // remove node
            nodeRemover = function () {
                // HOOK: notify that user has been removed from users list
                self.dispatcher.notify(
                    new Event(self, "users_list.node.removed", {node: $(this)})
                );
                $(this).remove();
            },

            // periodically cleans users list
            cleaner = function () {
                var i,
                    date = new Date(),
                    time = date.getTime() / 1000 - cleaningTimeout;

                for (i in users) {
                    if (!users.hasOwnProperty(i)) {
                        continue;
                    }
                    if (users[i].lastResponse > time) {
                        continue;
                    }
                    users[i].node.slideUp("slow", nodeRemover);
                    delete users[i];
                }
            };

        // start cleaner loop
        setInterval(cleaner, cleaningTimeout);

        this.mapping = function () {
            return {
                "dispatcher.message.displayed": display,
                "users_list.node.get": getNode,
                "users_list.user.get": getUser
            };
        };
     
        // add users box
        $(options.insert).after(box);
    };
}(Listener, Event, $, Handlebars, setInterval));
