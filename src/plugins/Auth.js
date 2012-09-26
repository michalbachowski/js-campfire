function ChatPluginAuth( params ) {
    Listener.apply( this, arguments );

    this.mapping = function() {
        return {
            "chat.init": init
        };
    };

    var options = jQuery.extend(
        {
            boxId: "login-box",
            label: "Login",
            submit: "Login",
            title: "Login to chat",
            logout: " (logout)",
            loginUrl: "/chat/entrance.json",
            logoutUrl: "/chet/exit.json"
        },
        params
    );
    var self   = this;
    self.dialog = jQuery( "#" + options.boxId );

    var init = function() {
        var message = {
            message: { message: "$whoami tell" },
            success: whoami,
            error: onError
        };
        self.dispatcher.notifyUntil(
            new Event(self, "send_message.send", message)
        );
    };

    this.doLogin = function( nick ) {
        if ( !nick ) {
            self.dialog.dialog( "open" );
            return;
        }

        var message = {
            url: options.loginUrl,
            message: { login: nick },
            success: onLogin,
            error: onError
        };
        self.dispatcher.notifyUntil(
            new Event(self, "send_message.send", message)
        );
    };

    this.doLogout = function() {
        var message = {
            url: options.logoutUrl,
            message: {},
            success: onLogout,
            error: onError
        };
        self.dispatcher.notifyUntil(
            new Event(self, "send_message.send", message)
        );
    };

    function createDialogBox() {
        self.dialog = jQuery( "<div />" )
            .attr( "id", options.boxId )
            .append(
                jQuery( "<form />" )
                .bind( "submit", function() {
                    self.doLogin( jQuery( "#" + options.boxId + "-name" ).val() );
                    return false;
                } )
                .append(
                    jQuery( "<fieldset />" )
                    .append(
                        jQuery( "<div /> " )
                        .addClass( "text" )
                        .append(
                            jQuery( "<label />" )
                            .attr( "for", options.boxId + "-name" )
                            .text( options.label )
                        )
                        .append(
                            jQuery( "<input type=\"text\" />" )
                            .attr( "name", "name" )
                            .attr( "id", options.boxId + "-name" )
                        )
                    )
                    .append(
                        jQuery( "<div />" )
                        .addClass( "submit" )
                        .append(
                            jQuery( "<input type=\"submit\" />" )
                            .val( options.submit )
                            .attr( "name", "login" )
                        )
                    )
                )
            );
    }
    function initDialog() {
        if ( self.dialog.length === 0 ) {
            createDialogBox();
        }
        self.dialog.dialog( {
            modal:      true,
            autoOpen:   false,
            width:      100,
            height:     110,
            title:      options.title
        } );
    }
    function displayLogoutButton( nick ) {
        if ( jQuery( "#chat-logout" ).length > 0 ) {
            return;
        }
        jQuery( "<span />" )
        .attr( "id", "chat-logout" )
        .text( nick + options.logout )
        .bind( "click", self.doLogout )
        .appendTo( "#body fieldset" );
    }
    function removeLogoutButton() {
        jQuery( "#chat-logout" ).remove();
    }
    function whoami( response ) {
        if ( response.status != 1 || !( 'whoami' in response.response ) ) {
            return;
        }
        if ( response.response.whoami[0].hasAccount ) {
            displayAuthInfo( response.response.whoami[0].name );
        } else {
            displayLogoutButton( response.response.whoami[0].name );
        }
        self.dialog.dialog( "close" );
    }
    function onError( response, e ) {
        if ( 403 === response.status ) {
            initDialog();
            self.doLogin();
        }
    }
    
    function onLogin( response ) {
        init();
        self.dispatcher.notify(
            new Event(self, "auth.login", response.response.auth[0] )
        );
    }
    function onLogout( response ) {
        removeLogoutButton();
        self.doLogin();
        self.dispatcher.notify(
            new Event(self, "auth.logout", response.response.auth[0] )
        );
    }
}
