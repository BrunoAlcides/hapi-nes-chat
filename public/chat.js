'use strict';

(function(){
  const client = new nes.Client('ws://localhost:3000/chat'), options = {delay: 1000,maxDelay: 500,retries: 10};

  let users = [];

  client.connect(options, errorHandler);

  client.subscribe('/connect', name => {
    client.request('/names', (err, payload) => {
      let newUsers = ['general'].concat(payload).sort((a, b) => a - b).filter(user => users.indexOf(user) === -1 && user !== me.toLowerCase());

      if (newUsers.length) {
        $('.rooms').innerHTML += newUsers.reduce((acc, user) => `${acc}<li id=${user} class="${user == 'general' && !$('active') ? 'room-active' : ''}" onclick="changeChat(this.id)">${user}`, '');
        $('.chats').innerHTML += newUsers.reduce((acc, user) => `${acc}<ul id=chat/${user} class='chat ${user == 'general' && !$('active') ? 'active' : ''}'></ul>`, '');

        users = users.concat(newUsers);

        $('[id="chat/general"]').innerHTML += `<li>Hello, ${name}`;
        $('[id="chat/general"]').scrollIntoView(false);
      }
    });
  }, errorHandler);

  client.subscribe('/disconnect', name => {
    $('.active').id.split('/')[1] === name.toLowerCase() && $('[id*="chat/general"]').classList.add('active')
    $(`[id="chat/${name.toLowerCase()}"]`).parentElement.removeChild($(`[id="chat/${name.toLowerCase()}"]`));
    users.splice(users.indexOf(name), 1);
    $('.rooms').innerHTML = users.reduce((acc, user) => `${acc}<li id=${user} onclick="changeChat(this.id)">${user}`, '');
    $('[id="chat/general"]').innerHTML += `<li>Bye, ${name}`;
  }, errorHandler);

  client.subscribe('/chat', msg => {
    let chat = $(`[id*="chat/${msg.to == me.toLowerCase() ? msg.from : msg.to}"]`);

    chat.innerHTML += `<li>${msg.message.replace(new RegExp(`${me}:`), 'You:')}`;
    chat.scrollIntoView(false);
  }, errorHandler);

  $('#btSend').onclick = () => {
    let msg = {
      from: me.toLowerCase(),
      to: $('.active').id.split('/')[1],
      message: `${me}: ${$('#inMessage').value}`
    }
    $('#inMessage').value && client.message(msg);
    $('#inMessage').value = '';
    $('#inMessage').focus();
  };

  $('#inMessage').onkeydown = e => {
    e.keyCode == 13 && $('#btSend').click();
    if (e.ctrlKey && e.keyCode == 40) $('.chats').scrollTop += 25;
    if (e.ctrlKey && e.keyCode == 38) $('.chats').scrollTop -= 25;
    if (e.ctrlKey && e.keyCode == 39) $('.chats').scrollTop += Math.floor($('.chats').offsetHeight / 25) * 25;
    if (e.ctrlKey && e.keyCode == 37) $('.chats').scrollTop -= Math.floor($('.chats').offsetHeight / 25) * 25;
  };

  $('#inMessage').focus();
})();

function $(elm){
  return document.querySelector(elm);
};

function changeChat(id){
  $('.active').classList.remove('active');
  $('.room-active').classList.remove('room-active');
  $(`[id="chat/${id}"]`).classList.add('active');
  $(`.rooms #${id}`).classList.add('room-active');
  $('#inMessage').focus();
}

function errorHandler(err){
  err && console.log(err);
}
