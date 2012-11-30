var campfire = new Chat(function (callback) {
    poller('/chat/poll', callback, {type: 'GET'});
});

campfire
    .attach(new ChatPluginAuth({
        url: {
            login: '/chat/login',
            logout: '/chat/logout'
        }
    }))
    .attach(new ChatPluginBan())
    .attach(new ChatPluginBanned())
    .attach(new ChatPluginButtonBar())
    .attach(new ChatPluginColor())
    .attach(new ChatPluginColorUsers())
    .attach(new ChatPluginConfiguration())
    .attach(new ChatPluginDice())
    .attach(new ChatPluginDirect())
    .attach(new ChatPluginDispatcher())
    .attach(new ChatPluginDisplayMessage())
    .attach(new ChatPluginForm())
    .attach(new ChatPluginHighlight())
    .attach(new ChatPluginLastFm({apiKey: '28c6d3ef7a0ffbd8d88d48cab1e332b7'}))
    .attach(new ChatPluginLinkedNick({urlPattern: Handlebars.compile('http://jaskiniowcy.heroes.net.pl/mieszkaniec/{{id}}')}))
    .attach(new ChatPluginIgnore())
    .attach(new ChatPluginInfoBox())
    .attach(new ChatPluginInputHint())
    .attach(new ChatPluginMe()) 
    .attach(new ChatPluginMessageTime())
    .attach(new ChatPluginNap())
    .attach(new ChatPluginPermissions())
    .attach(new ChatPluginPuppet())
    .attach(new ChatPluginPuppetOwners())
    .attach(new ChatPluginSendMessage({url: '/chat/reply'}))
    .attach(new ChatPluginSeparateDirectMessages())
    .attach(new ChatPluginTabbedInbox())
    .attach(new ChatPluginTitleAlert())
    .attach(new ChatPluginTyping())
    .attach(new ChatPluginUrlize())
    .attach(new ChatPluginUsersList())
    .attach(new ChatPluginYoutubize());

// DEBUG
// campfire.dispatcher().connect("chat.message.display",console.log, 200);
campfire.init();
