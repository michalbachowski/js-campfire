var ChatPluginUsersList = (function (Listener, Event, $, Handlebars, setInterval) {
    "use strict";
    var defaults = {
        refresh: 5,
        methods: {
            insert: function (box) {
                $('#inbox').before(box);
            },
            prepareInbox: function ($inbox) {
                $inbox.removeClass('span12').addClass('span10');
            },
            prepareTabs: function ($tabs) {
                $tabs.removeClass('span12').addClass('span10');
            }
        },
        template: {
            user: Handlebars.compile('<li class="row-fluid chat-user" data-nick="{{nick}}">' +
                    '<img src="{{avatar}}" class="user-avatar" />' +
                    '<strong class="user-nick">{{nick}}</strong>' +
                    '<small class="user-title">{{title}}</small>' +
                    '<div class="btn-group user-buttonbar" />' +
                '</li>'),
            box: Handlebars.compile('<ul class="users-list span2 nav nav-collapse well pull-right" />'),
            button: Handlebars.compile('<span class="btn btn-mini {{className}}" {{{attrs}}}>' +
                '{{label}}' +
                '{{#if options}}' +
                    ' <i class="caret" />' +
                '{{/if}}' +
                '</span>' +
                '{{#if options}}' +
                    '<ul class="dropdown-menu {{options.className}}">' +
                    '{{#each options.alternatives}}' +
                    '<li><a href="#" data-value="{{this.value}}">{{this.label}}</a></li>' +
                    '{{/each}}' +
                '</ul>' +
                '{{/if}}')
        },
        defaults: {
            attrs: {
                label: 'click',
                className: '',
                attrs: '',
                options: void 0
            }
        }
    };

    return function (params) {
        Listener.apply(this, arguments);

        var self  = this,
            users = {},
            options = $.extend(true, {}, defaults, params),
            cleaningTimeout = options.refresh * 60,
            $box,
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

                return node;
            },

            // displays given node
            displayNode = function (node) {
                // find place where to put new node
                var nick = node.get(0).dataset.nick,
                    destination = $box
                        .children()
                        .filter(function () {
                            return this.dataset.nick > nick;
                        })
                        .first();

                // append node
                if (0 === destination.length) {
                    $box.append(node);
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

                    // HOOK: filter user node
                    users[data.from.name].node = self.dispatcher.filter(
                        new Event(self, "users_list.node.filter", {message: data}),
                        users[data.from.name].node
                    ).getReturnValue();

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

            // adds button to user node
            addButton = function (event) {
                var nick = event.parameter("nick"),
                    button;
                if (!users.hasOwnProperty(nick)) {
                    return false;
                }
                button = $(options.template.button(
                    $.extend(true, {}, options.defaults.attrs, event.parameters())
                ));
                users[nick].node.find('.user-buttonbar').append(button);
                event.setReturnValue(button);
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
            },

            // init class
            init = function (event) {
                // add users box
                $box = $(options.template.box());
                options.methods.insert($box);
            },

            // prepare inbox to work with users list
            prepareInbox = function (event, $inbox) {
                options.methods.prepareInbox($inbox);
                return $inbox;
            },
            // prepare tabs to work with users list
            prepareTabs = function (event, $tabs) {
                options.methods.prepareTabs($tabs);
                return $tabs;
            };

        // start cleaner loop
        setInterval(cleaner, cleaningTimeout);

        this.mapping = function () {
            return {
                "dispatcher.message.displayed": display,
                "users_list.node.get": getNode,
                "users_list.user.get": getUser,
                "users_list.button.add": addButton,
                "display_message.inbox.filter": prepareInbox,
                "separate_direct_messages.tabs.filter": prepareTabs,
                "chat.init": [init, 90]
            };
        };
     
    };
}(Listener, Event, $, Handlebars, setInterval));
