function ChatPluginFunctions() {
    Listener.apply(this, arguments);
    this.mapping = function() {
        return {
            "chat.init": [init, 100] // wgrywamy do obiektu Chat funkcje
        };
    };
    var init = function() {
        // funkcje
    Chat.pulsowanie = function pulsowanie(id) {
            $('#' + id).animate({backgroundColor: '#13620A'}, 300).animate({backgroundColor: '#111111'}, 300);
        }
    Chat.SaveSetting = function SaveSettings(settingName, value, varName) {
            if (!varName) {
                varName = settingName;
            }
            $.jStorage.set(settingName, value);
            Chat[varName] = value;
            
        }
    Chat.LoadSetting = function LoadSetting(settingName, varName) {
            var wynik = $.jStorage.get(settingName);
            if (varName) // jak ktoś z tego korzysta, to liczy sie wydajnosc
                wynik = Chat[varName];
            if (wynik == undefined)
                wynik = null;
            return wynik;
        }
        
    }    
}




function ChatPluginOptions() {
    Listener.apply(this, arguments);
    this.mapping = function() {
        return {
            "chat.init": init,
            "display_message.message.filter": [display, 450],
            "chat.message.display": [dyskretna_drzemka, 150]
        };
    };
    var self = this;

    var init = function(){
        var main_inbox = $('#inbox');
        var priv_inbox = $('#priv_inbox');
        var osobna_karta_na_privy_checkbox = $('osobna_karta_privow');
        var button_settings = $('#uzyj_tych_ustawien');
        button_settings.click();
        if ($.jStorage.get('osobna_karta_privow') != null)
            osobna_karta_na_privy_checkbox.attr('checked', true);
        var zakladki = $.each($('.chat_tab'), function(){
            $(this).bind('click',toggle_tab_box);
            $('#' + $(this).attr('data-box')).attr('data-tab', this.id);
            $(this).bind('new_messages',nowe_wiadomosci);
            }
            ); //przypisałem każdej karcie opcję zmiany koloru + zdarzenie nowych wiadomości
        $('#ognisko_tab').click();
        
        $('#uzyj_tych_ustawien').bind('click', zapisz_ustawienia);
        var osobna_karta_privow = $('#osobna_karta_privow');
        if (Chat.LoadSetting('privy_w_osobnej_karcie') == true) { // wgrywamy ustawienia, przydałoby sie zrobić z tego osobną funkcję
            osobna_karta_privow.attr('checked', true);
            Chat.osobna_karta_privow = true; //ustawiamy!
        }
        else 
            Chat.SaveSetting('privy_w_osobnej_karcie', false, 'osobna_karta_privow');
            
        var dyskretna_drzemka = $('#dyskretna_drzemka');
        if (Chat.LoadSetting('dyskretna_drzemka')) { // wgrywamy ustawienia, przydałoby sie zrobić z tego osobną funkcję
            dyskretna_drzemka.attr('checked', true);
            Chat.SaveSetting('dyskretna_drzemka', true, 'dyskretna_drzemka');
            alert('dyskretna drzemka wlaczona');
        }
        else 
            Chat.SaveSetting('dyskretna_drzemka', false, 'dyskretna_drzemka');
            
            
            
        
        var podswietlane_frazy_textarea = $('#podswietlane_frazy')[0];
        podswietlane_frazy_textarea.value = Chat.LoadSetting('podswietlane_frazy');
        podswietlane_frazy_textarea.value = podswietlane_frazy_textarea.value.replace(new RegExp(',', 'gm'), '\n');
        
    }
    function toggle_tab_box() {
        var tab = this;
        $(
          '#' + $(tab).attr('data-box')
          ).toggle(300);
        if (tab.otwarte != 1) {
            $(tab).stop(true, true);
            $(tab).animate({backgroundColor: '#62130A'}, 300); //otwieramy
            tab.otwarte = 1;
            window.clearInterval(tab.pulsowanie);
            return;
        }
        else {
            $(tab).animate({backgroundColor: '#111111'}, 300); //zamykamy
            tab.otwarte = 0;
            return;
        }
       
    }
    function nowe_wiadomosci() {
        var tab = this;
        if (this.otwarte == 1) {
            return;
        }
        else {
            window.clearInterval(tab.pulsowanie);
            tab.pulsowanie = window.setInterval("Chat.pulsowanie('" + tab.id +"')", 1000);
           
        }
    }
    function zapisz_ustawienia() {
        
        /* OSOBNA KARTA NA PRIVY */
        var osobna_karta_na_privy_checkbox_stan = $('#osobna_karta_privow').attr('checked');
        if (osobna_karta_na_privy_checkbox_stan)
            Chat.SaveSetting('privy_w_osobnej_karcie', true, 'osobna_karta_privow');
        else
            Chat.SaveSetting('privy_w_osobnej_karcie', false, 'osobna_karta_privow');
        
        /* PODŚWIETLANE FRAZY */
        var podswietlane_frazy = $('#podswietlane_frazy')[0].value.split('\n'); // pobieramy liste w formie tablicy
        Chat.SaveSetting('podswietlane_frazy' , podswietlane_frazy);
        
        var dyskretna_drzemka_checkbox_stan = $('#dyskretna_drzemka').attr('checked');
        if (dyskretna_drzemka_checkbox_stan) {
            Chat.SaveSetting('dyskretna_drzemka', true, 'dyskretna_drzemka');
        }
        else
            Chat.SaveSetting('dyskretna_drzemka', false, 'dyskretna_drzemka');
            
        
    }
    
    
    
    var dyskretna_drzemka = function (event) {
        var data = event.parameter('message');
        window.data = data;
        var dyskretna_drzemka = Chat.LoadSetting('dyskretna_drzemka', 'dyskretna_drzemka');
        if (dyskretna_drzemka == true && data.nap == true) {
                return true;
        }
        
    }
    



    
    
    var display =  function(event, msg) {
        var podswietlane_frazy = Chat.LoadSetting('podswietlane_frazy');
        var temp = 0;
        if (podswietlane_frazy) {
            while (podswietlane_frazy[temp]) {
                msg = msg.replace(
                                new RegExp('('+podswietlane_frazy[temp]+')', 'gim')
                                ,
                                '<span class="highlight">$1</span>'
                                );
            temp ++;
            }
        msg = msg.replace(
                          new RegExp('\\[br\\]', 'g'),
                          '<br />'
                          );
        }
        return msg;
    };

}
