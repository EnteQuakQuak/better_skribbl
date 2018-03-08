// ==UserScript==
// @name        skribbl.io
// @namespace   pink_guy
// @include     http*://skribbl.io/*
// @version     1
// @grant       none
// ==/UserScript==

//***vars and interface construction***
var search = 0;
var startup = 1;
var found = 1;
var mutedPlayers = [];
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var obj = document.querySelector('#containerGamePlayers');
var success = new Audio("res/sounds/roundEndSuccess.wav");
//alert(obj);

if (typeof getCookie("loginName") != "undefined") document.getElementById('inputName').value = getCookie("loginName");
if (typeof getCookie("loginLanguage") != "undefined") setSelectedIndex(document.getElementById('loginLanguage'), getCookie("loginLanguage"));

//***HTML mods***

window.onfocus = function (){
    document.getElementById("inputChat").focus();
};

var pinkguy = document.createElement("div");
pinkguy.innerHTML = '<div align="right" style="margin-left: 80px; margin-top: 10px; color: #333; font-weight:700">' +
    '<p align="right" style="font-size:16px">' +
    'PINK GUY EDITION' +
    '</p></div>';
var elm = document.getElementsByClassName('iconQuestionmark');
elm[0].parentNode.insertBefore(pinkguy, elm[0].nextSibling);

var instructions = document.createElement("div");
instructions.innerHTML = '<div style="margin: 0 auto 0 auto; ' +
    'margin-top: 5px; ' +
    'font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; background-color: #FFFFFF; ' +
    'color: #333;">' +
    '<h4><b>How to use this script</b></h4>' +
    '<p style="margin: 2px 0 1px 0;"> ' +
    '<small>Just add your name and language and then press "Remember". Choose your avatar and save it with its respective button.' +
    'This has to be done before your first time using auto-search, otherwise it will use random values. For auto-search just enter your friends names and smash that auto button. A stop button will appear ingame. Sometimes auto-search is stuck, just refresh the page. You can mute players with the mute settings! No more harassment.</br>Have fun!' +
    '</br><b>Script needs cookies to be enabled. Don\'t set time too low, otherwise your IP will be blocked by the server.</b></p></div>';
var elm = document.getElementsByClassName('containerSocial');
elm[0].parentNode.insertBefore(instructions, elm[0]);

var remNL = document.createElement("div");
remNL.innerHTML = '<div style="margin-top: 5px;">' +
    '<button type="button" id="buttonRememberNickname" class="btn btn-warning  btn-block">Remember name and language</button>' +
    '</div>';
var elm = document.getElementsByClassName('login');
elm[0].parentNode.insertBefore(remNL, elm[0].nextSibling);

var remA = document.createElement("div");
remA.innerHTML = '<div style="margin-top: 5px" ><button type="button" id="buttonRememberAvatar" class="btn btn-warning btn-block">Remember avatar</button></div>';
var elm = document.getElementById('loginAvatarCustomizeContainer');
elm.parentNode.insertBefore(remA, elm.nextSibling);

var scriptSettings = document.createElement("div");
scriptSettings.innerHTML = '<div style="' +
    'font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; background-color: #FFFFFF; ' +
    'color: #333;"><p style="padding: 2px 0 1px 0;"> ' +
    '<small>Auto-search users. Seperate names by comma without spaces</small>' +
    '<input id="friendNames" class="form-control" placeholder="Enter your friends names" type="text">' +
    '<input id="searchSpeed" class="form-control" placeholder="Speed" type="text" style="width:20%; float:left; margin:2px 0px 2px 0px; "><p style="float:left;">' +
    '<small>&nbsp;   Time between refreshes in ms.</small></p>' +
    '<div style="margin-top: 5px" ><button type="button" id="buttonScriptPlay" class="btn btn-success btn-block">Play with auto-search!</button></div>' +
    '</p></div>';
var elm = document.getElementById('buttonRememberAvatar');
elm.parentNode.insertBefore(scriptSettings, elm.nextSibling);

var resetButton = document.createElement("div");
resetButton.innerHTML = '<div style="margin-top: 5px" ><button type="button" id="buttonResetCookies" class="btn btn-warning btn-block">Reset settings to default</button></div>';
var elm = document.getElementsByClassName('moregames');
elm[0].parentNode.insertBefore(resetButton, elm[0].nextSibling);

var mutePlayersMenu = document.createElement("div");
mutePlayersMenu.innerHTML = '<div style="padding: 5px; margin-top: 55px; border: 1px solid #000000 ;background-color: #eee; border-radius: 2px; width:100%" >Mute players' +
    '<select class="form-control" id="mutePlayersSelect"></select>' +
    '<button type="button" id="buttonMutePlayer" class="btn btn-warning btn-block">Mute selected player</button></div>';
var elm = document.getElementById('boxChatInput');
elm.parentNode.insertBefore(mutePlayersMenu, elm.nextSibling);

elm = document.getElementById("buttonRememberNickname");
elm.addEventListener('click', saveCookieNameLang);
elm = document.getElementById("buttonRememberAvatar");
elm.addEventListener('click', saveCookieAvatar);
elm = document.getElementById("buttonScriptPlay");
elm.addEventListener('click', startSearch);
elm = document.getElementById("buttonResetCookies");
elm.addEventListener('click', resetCookies);
elm = document.getElementById("buttonMutePlayer");
elm.addEventListener('click', mutePlayer);
if (getCookie("autoSearch") == 1) {
    var scriptStop = document.createElement("div");
    scriptStop.innerHTML = '<div style="margin-top: 5px" ><button type="button" id="buttonScriptStop" class="btn btn-danger btn-block">Stop search!</button></div>';
    var elm = document.getElementsByClassName('gameHeader');
    elm[0].parentNode.insertBefore(scriptStop, elm[0]);
    elm = document.getElementById("buttonScriptStop");
    elm.addEventListener('click', stopSearch);
}
if (typeof getCookie("friendNames") != "undefined") document.getElementById('friendNames').value = getCookie("friendNames");
if (typeof getCookie("searchTime") != "undefined") {
    document.getElementById('searchSpeed').value = getCookie("searchTime");}
else {document.getElementById('searchSpeed').value = "3000";}
setAvatar();

//***/HTML mods***

function setAvatar() {
    var avatarColor = getCookie("avatarColor");
    var avatarEyes = getCookie("avatarEyes");
    var avatarMouth = getCookie("avatarMouth");
    if (typeof getCookie("avatarColor") == "undefined" || typeof getCookie("avatarEyes") == "undefined" || typeof getCookie("avatarMouth") == "undefined") return;

    var face = document.getElementById("loginAvatar");
    var avas = document.getElementsByClassName("avatarArrow");
    //color
    while (face.getElementsByClassName("color")[0].style.backgroundPosition != avatarColor) {
        avas[2].click();
    }
    //eyes
    while (face.getElementsByClassName("eyes")[0].style.backgroundPosition != avatarEyes) {
        avas[0].click();
    }
    //mouth
    while (face.getElementsByClassName("mouth")[0].style.backgroundPosition != avatarMouth) {
        avas[1].click();
    }
}

function saveCookieNameLang() {
    lang = document.getElementById('loginLanguage');
    var langActive = lang.options[lang.selectedIndex].text;

    document.cookie = "loginName=" + document.getElementById('inputName').value + "; max-age=1314000000; path=/; domain=skribbl.io";
    document.cookie = "loginLanguage=" + langActive + "; max-age=1314000000; path=/; domain=skribbl.io";
}

function saveCookieAvatar() {
    var face = document.getElementById("loginAvatar");
    document.cookie = "avatarColor=" + face.getElementsByClassName("color")[0].style.backgroundPosition + "; max-age=1314000000; path=/; domain=skribbl.io";
    document.cookie = "avatarEyes=" + face.getElementsByClassName("eyes")[0].style.backgroundPosition + "; max-age=1314000000; path=/; domain=skribbl.io";
    document.cookie = "avatarMouth=" + face.getElementsByClassName("mouth")[0].style.backgroundPosition + "; max-age=1314000000; path=/; domain=skribbl.io";
}

function startSearch() {
    search = 1;
    time = document.getElementById('searchSpeed').value;
    list = document.getElementById('friendNames').value;
    if (document.getElementById('friendNames').value == "") {
        alert("Please enter names");
        return;
    }
    document.cookie = "searchTime=" + time + "; max-age=1314000000; path=/; domain=skribbl.io";
    document.cookie = "friendNames=" + list + "; max-age=1314000000; path=/; domain=skribbl.io";
    //return
    document.cookie = "autoSearch=" + search + "; max-age=1314000000; path=/; domain=skribbl.io";
    document.cookie = "autoSearchFirstTry=" + search + "; max-age=1314000000; path=/; domain=skribbl.io";
    location.reload();
}

function stopSearch() {
    search = 0;
    document.cookie = "autoSearch=" + search + "; max-age=1314000000; path=/; domain=skribbl.io";
    document.cookie = "autoSearchFirstTry=" + search + "; max-age=1314000000; path=/; domain=skribbl.io";

    //location.reload();
}

function resetCookies() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var spcook = cookies[i].split("=");
        deleteCookie(spcook[0]);
    }

    function deleteCookie(cookiename) {
        var expires = "; max-age=0";
        var name = cookiename;
        var value = "";
        document.cookie = name + "=" + value + expires + "; path=/; domain=skribbl.io";
    }
    location.reload();
}

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

function setSelectedIndex(s, v) {
    for (var i = 0; i < s.options.length; i++) {
        if (s.options[i].text == v) {
            s.options[i].selected = true;
            return;
        }
    }
}

//***Auto-search
if (getCookie("autoSearchFirstTry") == 1){
    //prevents issue where game is stuck
    document.cookie = "autoSearchFirstTry=0 ; max-age=1314000000; path=/; domain=skribbl.io";
    location.reload();
}
if (getCookie("autoSearch") == 1) {
    found = 0;
    document.querySelector('button[class="btn btn-success btn-lg btn-block"]').click();
}

var delay = document.getElementById('searchSpeed').value;

var observer = new MutationObserver(function (mutations, observer) {
    mutations.forEach(function (mutation) {
        if (found != 1) {
            setTimeout(function () {
                lookUpName();
            }, 250);
        }
        if (mutation.type == 'childList') populateSelect();
    });
});

observer.observe(obj, {
    childList: true,
    attributes: false,

});

var observerChat = new MutationObserver(function (mutations, observer) {
    mutations.forEach(function (mutation) {
        if (mutation.type == 'childList') filterChat();
    });
});

var obj = document.querySelector('#boxMessages');

observerChat.observe(obj, {
    childList: true,
    attributes: false,

});

function filterChat() {
    for (var i = 0; i < mutedPlayers.length; i++) {
        if (document.getElementById("boxMessages").lastChild.innerHTML.includes(mutedPlayers[i]+":") == true) {
            document.getElementById("boxMessages").lastChild.remove();
        }
    }
}

function mutePlayer() {
    player = document.getElementById('mutePlayersSelect');
    var mute = player.options[player.selectedIndex].text;
    container = document.getElementById("containerPlayerlist");
    list = container.getElementsByClassName('name');
    for (var i = 0; i < list.length; i++) {
        if (list[i].innerHTML == mute) {
            var name = list[i];
            id = list[i].parentNode.parentNode.id;
        }
    }
    messages = container.getElementsByClassName('message');
    for (var j = 0; j < messages.length; j++) {
        if (messages[j].parentNode.id == id) {
            var message = messages[j];
        }
    }
    name.style.color = "red";
    if (mutedPlayers.includes(mute)) {
        mutedPlayers = mutedPlayers.filter(item => item !== mute);
        name.style.color = "black";
        message.style.visibility = "visible";
    }
    else {
        mutedPlayers.push(mute);
        name.style.color = "red";
        message.style.visibility = "hidden";
    }
}

function populateSelect() {
    container = document.getElementById("containerPlayerlist");
    select = document.getElementById("mutePlayersSelect");
    while (select.options.length > 0) {
        select.remove(0);
    }
    list = container.getElementsByClassName('name');
    for (var i = 0; i < list.length; i++) {
        var option = document.createElement("option");
        option.text = list[i].innerHTML;
        select.add(option);
    }
}

function lookUpName() {
    var nameList = document.getElementsByClassName('name');
    var friendNames = getCookie("friendNames").split(',');
    for (var i = 0; i < nameList.length; i++) {
        if (found == 1)
            break;
        for (var j = 0; j < friendNames.length; j++) {
            if (nameList[i].innerHTML.includes(friendNames[j]) == true) {
                found = 1;
                success.play();
                //alert('Found ' + friendNames[j]);
                search = 0;
                document.cookie = "autoSearch=" + search + "; max-age=1314000000; path=/; domain=skribbl.io";
                document.getElementById("buttonScriptStop").remove();
                break;
            }
        }
    }
    if (found == 0) {
        setTimeout(function () {
            if (getCookie("autoSearch") != 0) location.reload();
            else document.getElementById("buttonScriptStop").remove();
        }, delay); //set time high enough so that servers don't block your IP
    }
    while (0) {
    }
}

