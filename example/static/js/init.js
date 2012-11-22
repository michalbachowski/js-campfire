var campfire = new Chat(function (callback) {
    poller('/jbapp/chat/ognisko/rozmowa.json', callback);
});

campfire
    .attach(new ChatPluginAuth({
        url: {
            login: '/jbapp/chat/ognisko/wejscie.json',
            logout: '/jbapp/chat/ognisko/wyjscie.json'
        }
    }))
    .attach(new ChatPluginBan())
    .attach(new ChatPluginButtonBar())
    .attach(new ChatPluginColor())
    .attach(new ChatPluginConfiguration())
    .attach(new ChatPluginDice())
    .attach(new ChatPluginDirect())
    .attach(new ChatPluginDispatcher())
    .attach(new ChatPluginDisplayMessage())
    .attach(new ChatPluginForm())
    .attach(new ChatPluginLastFm({apiKey: '28c6d3ef7a0ffbd8d88d48cab1e332b7'}))
    .attach(new ChatPluginLinkedNick({urlPattern: Handlebars.compile('http://jaskiniowcy.heroes.net.pl/mieszkaniec/{{id}}')}))
    .attach(new ChatPluginIgnore())
    .attach(new ChatPluginInfoBox())
    .attach(new ChatPluginMe()) 
    .attach(new ChatPluginMessageTime())
    .attach(new ChatPluginNap())
    .attach(new ChatPluginPuppet())
    .attach(new ChatPluginSendMessage({url: '/jbapp/chat/ognisko/odpowiedz.json'}))
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
