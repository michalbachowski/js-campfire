var ChatPluginLinkedNick = (function (Listener, Event, $, Handlebars) {
    "use strict";
    var defaults = {
        urlPattern: Handlebars.compile('#user-{{id}}'),
        methods: {
            getUrl: function (nick, user, pattern) {
                if (user.logged && user.hasAccount) {
                    return pattern(user);
                }
            }
        },
        template: {
            usersList: Handlebars.compile('<a href="{{url}}" class="user-nick btn btn-link">{{nick}}</a>')
        }
    };

    return function (params) {
        Listener.apply(this, arguments);

        var self  = this,
            options = $.extend(true, {}, defaults, params),

            getUrl = function (nick, user) {
                return options.methods.getUrl(nick, user, options.urlPattern);
            },

            filterUserOnUsersList = function (event, node) {
                var nick = node.data('nick'),
                    user = self.dispatcher.notifyUntil(
                        new Event(self, "users_list.user.get", {nick: nick})
                    ).getReturnValue(),
                    url;
                if (user === void 0) {
                    return node;
                }
                url = getUrl(nick, user);
                if (url !== void 0) {
                    node.find(".user-nick").replaceWith(
                        $(
                            options.template.usersList({
                                nick: node.data('nick'),
                                url: url
                            })
                        )
                    );
                }
                return node;
            },

            filterUserInfo = function (event, node) {
                var nick = node.find(".button-username").data('nick'),
                    user = event.parameter('user'),
                    url = getUrl(nick, user);
                if (url !== void 0) {
                    node.find(".button-username").attr("href", url);
                }
                return node;
            };

        this.mapping = function () {
            return {
                "users_list.node.filter": filterUserOnUsersList,
                "auth.userinfo.filter": filterUserInfo
            };
        };
     
    };
}(Listener, Event, $, Handlebars));
