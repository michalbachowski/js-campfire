var ChatPluginInfoBox = (function ($, Listener, Handlebars) {
    "use strict";

    var defaults = {
        template: {
            alert: Handlebars.compile('<div class="{{className}}">' +
                    '<button type="button" class="close" data-dismiss="alert">×</button>' +
                    '<strong class="alert-header"></strong> <span class="alert-content"></span>' +
                '</div>')
        },
        options: {
            alert: {
                className: 'alert'
            },
            info: {
                header: 'Info',
                content: 'message',
                type: 'warning'
            }
        },
        methods: {
            insert: function (box) {
                box.appendTo("#body");
            },
            display: function (box) {
                box.slideDown("slow");
            },
            prepare: (function () {
                var types = {
                        'warning': '',
                        'error': 'alert-error',
                        'success': 'alert-success',
                        'info': 'alert-info'
                    },
                    headers = {
                        'warning': 'Warning',
                        'error': 'Error',
                        'success': 'Success',
                        'info': 'Info'
                    };
                return function (node, data) {
                    return node.removeClass('alert-error alert-success alert-info').addClass(types[data.type])
                        .find(".alert-header").html(headers[data.type]).end();
                };
            }())
        }
    };

    return function (params) {
        Listener.apply(this, arguments);
        
        var self = this,
            options = $.extend(true, {}, defaults, params),
            $box,
            display = function (event) {
                var data = $.extend(true, {}, options.options.info, event.parameters());
                $box.find(".alert-content").html(data.content).end();
                options.methods.display(options.methods.prepare($box, data));
                return true;
            },

            init = function (event) {
                $box = $(options.template.alert(options.options.alert)).hide();
                options.methods.insert($box);
            };

        this.mapping = function () {
            return {
                "info_box.display": display,
                "chat.init": init
            };
        };
    };
}(jQuery, Listener, Handlebars));
