let urlsp = new URLSearchParams(document.location.search.substring(1));
let uid = urlsp.get('uid'), guid = urlsp.get('guid'), userData;
let oReq = new XMLHttpRequest();
oReq.addEventListener("load", render);
oReq.open("GET", `https://keiko-assistant.glitch.me/api/getprofile?uid=${uid}&guid=${guid}`);
oReq.send();

function render() {
    try {
        userData = JSON.parse(this.responseText);
    } catch (e) {
        return;
    }
    document.getElementById('usericon').src = userData.avatar;
    document.getElementById('username').textContent = `${userData.name} (${userData.tag})`;
    document.getElementById('userdesc').textContent = userData.desc ? userData.desc : "Tutaj będzie twój opis";
    if (userData.yui) document.getElementById('useryui').innerHTML = `Poziom: ${userData.yui.lvl}<br>XP: ${userData.yui.xp} / ${userData.yui.lvl * 200}<br>Miejsce: ${userData.yui.id}<br>`;
    else document.getElementById('useryui').textContent = "Brak danych!";
    document.getElementById('color').style.backgroundColor = userData.hexcolor;
    document.getElementById('color').style.color = userData.hexcolor;
    document.getElementById('hexcolor').textContent = userData.hexcolor;
    document.getElementById('userdevice').textContent = userData.platform;
    document.getElementById('userstatus').textContent = userData.status;
}