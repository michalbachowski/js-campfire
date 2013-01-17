var ChatPluginInfoBox = (function ($, Listener, Handlebars, setTimeout) {
    "use strict";

    var defaults = {
        template: {
            alert: Handlebars.compile('<div class="alert {{infoBoxClassName type}} span9">' +
                    '<button type="button" class="close" data-dismiss="alert">×</button>' +
                    '<strong class="alert-header">{{infoBoxHeader type}}</strong> ' +
                    '<span class="alert-content">{{content}}</span>' +
                '</div>')
        },
        options: {
            visibilityTimeout: 10000, // miliseconds (default: 15 seconds)
            template: {
                content: 'message',
                type: 'warning'
            },
            classNames: {
                warning: '',
                error: 'alert-error',
                success: 'alert-success',
                info: 'alert-info'
            },
            headers: {
                warning: 'Warning',
                error: 'Error',
                success: 'Success',
                info: 'Info'
            }
        },
        methods: {
            display: function (box) {
                box.hide().insertBefore(".tabbable").slideDown("slow");
            },
            hide: function (box) {
                box.slideUp("slow", function () {
                    $(this).remove();
                });
            }
        }
    };

    return function (params) {
        Listener.apply(this, arguments);
        
        var self = this,
            options = $.extend(true, {}, defaults, params),
            
            display = function (event) {
                var data = $.extend(true, {}, options.options.template, event.parameters()),
                    $box = $(options.template.alert(data));
                options.methods.display($box);
                setTimeout(function () {
                    options.methods.hide($box);
                }, options.options.visibilityTimeout);
                return true;
            };

        // header generator
        Handlebars.registerHelper('infoBoxHeader', function (type) {
            if (!options.options.headers.hasOwnProperty(type)) {
                type = options.template.type;
            }
            return options.options.headers[type];
        });

        // className generator
        Handlebars.registerHelper('infoBoxClassName', function (type) {
            if (!options.options.headers.hasOwnProperty(type)) {
                type = options.template.type;
            }
            return options.options.classNames[type];
        });

        this.mapping = function () {
            return {
                "info_box.display": display
            };
        };
    };
}(jQuery, Listener, Handlebars, setTimeout));
