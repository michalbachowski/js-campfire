function ChatPluginIgnore() {
    Listener.apply(this, arguments);
    this.mapping = function() {
        return {
            "chat.init": init
        };
    };
    var self = this;
    var init = function(){
        $('#ignore_button').bind("click", ignoruj);
        var lista = $('#lista_ignorowanych')[0];
        var do_wstawienia = Chat.LoadSetting('lista_ignorowanych');
        if (do_wstawienia == null)
            do_wstawienia = '';
       do_wstawienia = do_wstawienia.toString();
        lista.value = do_wstawienia.replace(new RegExp(',', 'gm'), '\n');
        ignoruj();
    }
    var ignoruj = function(){
        var lista = $('#lista_ignorowanych')[0].value.split('\n'); //pobieramy_liste
        var styl = $('#ignore_list_style')[0];
        var temp1 = 0;
        var temp2 = '';
        Chat.SaveSetting('lista_ignorowanych', lista);
        while (lista[temp1] != undefined ){
            temp2 = temp2 + 'p[data-author="' + lista[temp1] +'"] {display: none !important;} \n';
            temp1 ++;
        }
        styl.innerHTML = temp2;
        
    }    
}
