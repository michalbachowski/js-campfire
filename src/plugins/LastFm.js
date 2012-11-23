var ChatPluginLastFm = (function ($, PluginUtility, Event, Handlebars) {
    "use strict";

    var defaults = {
        button: {
            label: '<i class="icon icon-headphones" />',
            className: 'button-lastfm',
            attrs: 'rel="tooltip" title="LastFm status"',
            split: true,
            options: {
                className: 'lastfm',
                alternatives: [
                    {label: 'Set LastFm username', value: 'set-lastfm-username', attrs: 'data-toggle="modal"', href: '#lastfm-username'}
                ]
            }
        },
        template: {
            lastFmUrl: Handlebars.compile('http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user={{user}}&limit=1&format=json&api_key={{api}}'),
            message: Handlebars.compile('/me is listening to {{artist}} - {{track}}'),
            dialog: Handlebars.compile(' ' +
                '<form class="modal hide fade form-horizontal" id="lastfm-username" tabindex="-1" role="dialog" aria-hidden="true">' +
                '   <div class="modal-header">' +
                '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
                '       <h3>{{header}}</h3>' +
                '   </div>' +
                '   <div class="modal-body">' +
                '       <div class="text control-group">' +
                '           <label class="control-label">{{label}}</label>' +
                '           <div class="controls">' +
                '               <input type="text" placeholder="{{placeholder}}" value="{{user}}" />' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '   <div class="modal-footer">' +
                '       <a href="#" class="btn" data-dismiss="modal" aria-hidden="true">{{close}}</a>' +
                '       <button type="submit" class="btn btn-primary">{{submit}}</button>' +
                '   </div>' +
                '</form>')
        },
        methods: {
            fetchNickFromForm: function (form) {
                return $(form).find("input[type=text]").val();
            }
        },
        options: {
            dialog: {
                header: 'Set LastFm username',
                label: 'Your LastFm username',
                placeholder: 'Type yout LastFm username',
                close: 'Close',
                submit: 'Save',
                user: ''
            }
        },
        apiKey: ''
    };

    return function (params) {
        PluginUtility.apply(this, arguments);

        var self = this,
            options = $.extend(true, {}, defaults, params),
            $dialog,
            user,

            notify = function (response) {
                try {
                    if (response.recenttracks.track[0]['@attr'].nowplaying !== 'true') {
                        return;
                    }
                } catch (e) {
                    self.alert('Error while fetching LastFm status', 'error');
                    return;
                }
                self.dispatcher.notifyUntil(
                    new Event(
                        self,
                        "send_message.send",
                        {
                            message: {
                                message: options.template.message({
                                    artist: response.recenttracks.track[0].artist['#text'],
                                    track: response.recenttracks.track[0].name
                                })
                            }
                        }
                    )
                );
            },
            scrobble = function () {
                if (!user) {
                    $dialog.modal('show');
                    return;
                }
                $.get(options.template.lastFmUrl({user: user, api: options.apiKey})).success(notify);
            },

            init = function (event) {
                self.dispatcher.notifyUntil(
                    new Event(
                        self,
                        "buttonbar.button.attach",
                        options.button
                    )
                );
                // read configuration
                user = self.config.read('lastfm.username');
                // append modal
                $dialog = $(options.template.dialog($.extend(true, {}, options.options.dialog, {user: user})))
                    .on("submit", function () {
                        user = options.methods.fetchNickFromForm(this);
                        // save configuration
                        self.config.write('lastfm.username', user);
                        $dialog.modal("hide");
                        return false;
                    });
                $("body").append($dialog);
                // handle clicks
                $("body").on("click", "." + options.button.className, scrobble);
            };
        
        this.mapping = function () {
            return {
                "chat.init": [init, 800] // wgrywamy do obiektu Chat funkcje
            };
        };
    };
}(jQuery, PluginUtility, Event, Handlebars));
