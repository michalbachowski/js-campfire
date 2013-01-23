var ChatPluginHighlight = (function ($, PluginUtility, Event, Handlebars) {
    "use strict";
    var defaults = {
        button: {
            label: '<i class="icon icon-star" />',
            className: 'button-highlight',
            attrs: 'data-toggle="modal" rel="tooltip" title="Highlight"',
            href: '#highlight-config',
            options: {}
        },
        template: {
            dialog: Handlebars.compile(' ' +
                '<form class="modal hide fade form-horizontal" id="highlight-config" tabindex="-1" role="dialog" aria-hidden="true">' +
                '   <div class="modal-header">' +
                '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
                '       <h3>{{header}}</h3>' +
                '   </div>' +
                '   <div class="modal-body">' +
                '       <div class="text control-group">' +
                '           <label class="control-label" for="highlighted-words">{{label}}</label>' +
                '           <div class="controls">' +
                '               <textarea name="highlighted-words" id="highlighted-words">{{words}}</textarea>' +
                '               <p class="help-block">{{desc}}</p>' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '   <div class="modal-footer">' +
                '       <a href="#" class="btn" data-dismiss="modal" aria-hidden="true">{{close}}</a>' +
                '       <button type="submit" class="btn btn-primary">{{submit}}</button>' +
                '   </div>' +
                '</form>'),
            pattern: '<span class="text-highlight">$1</span>'
        },
        options: {
            dialog: {
                header: 'Set words to be highlighted',
                label: 'Highlighted words',
                desc: 'Comma-separated list of words to highlight',
                close: 'Close',
                submit: 'Save',
                words: ''
            }
        },
        methods: {
            getHighlightedWords: function (form) {
                return $(form).find('textarea#highlighted-words').val();
            }
        }
    };

    return function (params) {
        PluginUtility.apply(this, arguments);

        var options = $.extend(true, {}, defaults, params),
            self = this,
            words = [],
            $button,
            $dialog,

            prepareWords = function (words) {
                return (words || '').split(',').map($.trim).filter(function (e) { return e.length > 0; });
            },

            writeConfig = function (words) {
                self.config.write('highlight.words', words.join(','));
                return false;
            },

            init = function () {
                // attach button
                $button = self.dispatcher.notifyUntil(
                    new Event(
                        self,
                        "buttonbar.button.attach",
                        options.button
                    )
                ).getReturnValue();
                // read config
                var wordsTmp = self.config.read('highlight.words');
                if (wordsTmp !== void 0) {
                    words = prepareWords(wordsTmp);
                } else {
                    wordsTmp = words;
                }
                // append modal
                $dialog = $(options.template.dialog($.extend(true, {}, options.options.dialog, {words: words.join(',')})))
                    .on("submit", function () {
                        words = prepareWords(options.methods.getHighlightedWords(this));
                        // save configuration
                        writeConfig(words);
                        $dialog.modal("hide");
                        return false;
                    // focus nick field
                    }).on("shown", function (e) {
                        $(e.target).find("textarea").focus();
                    // focus message input field
                    }).on("hidden", function (e) {
                        var ev = self.dispatcher.notifyUntil(new Event(self, 'form.get'));
                        if (!ev.isProcessed()) {
                            return;
                        }
                        ev.getReturnValue().find("input[type=text]").focus();
                    });
                $("body").append($dialog);
            },

            filter = function (event, msg) {
                if (words.length === 0) {
                    return msg;
                }
                return msg.replace(
                    new RegExp('(' + words.join('|') + ')', 'gim'),
                    options.template.pattern
                );
            };

        this.mapping = function () {
            return {
                "display_message.message.filter": [filter, 500],
                "chat.init": [init, 390]
            };
        };
    };
}(jQuery, PluginUtility, Event, Handlebars));
