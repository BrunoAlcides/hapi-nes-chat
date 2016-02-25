'use strict';

(function(){
  const client = new nes.Client('ws://localhost:3000/chat'), options = {delay: 1000,maxDelay: 500,retries: 10};

  let users = [];

  client.connect(options, errorHandler);

  client.subscribe('/connect', name => {
    client.request('/names', (err, payload) => {
      let newUsers = ['general'].concat(payload).sort((a, b) => a - b).filter(user => users.indexOf(user) === -1 && user !== me.toLowerCase());

      if (newUsers.length) {
        $('.rooms').innerHTML += newUsers.reduce((acc, user) => `${acc}<li id=${user} class="${user == 'general' && !$('chat-active') ? 'room-active' : ''}" onclick="changeChat(this.id)"><span>${user}</span><div><span></span></div></li>`, '');
        $('.chats').innerHTML += newUsers.reduce((acc, user) => `${acc}<ul id=chat/${user} class='chat ${user == 'general' && !$('chat-active') ? 'chat-active' : ''}'></ul>`, '');

        users = users.concat(newUsers);

        $('[id="chat/general"]').innerHTML += `<li>Hello, ${name}`;
        $('[id="chat/general"]').scrollIntoView(false);
      }
    });
  }, errorHandler);

  client.subscribe('/disconnect', name => {
    $('.chat-active').id.split('/')[1] === name.toLowerCase() && $('[id="chat/general"]').classList.add('chat-active');
    $(`[id="chat/${name.toLowerCase()}"]`).parentElement.removeChild($(`[id="chat/${name.toLowerCase()}"]`));
    users.splice(users.indexOf(name), 1);
    $('.rooms').innerHTML = users.reduce((acc, user) => `${acc}<li id=${user} onclick="changeChat(this.id)"><span>${user}</span><div><span></span></div></li>`, '');
    $('[id="chat/general"]').innerHTML += `<li>Bye, ${name}`;
  }, errorHandler);

  client.subscribe('/chat', msg => {
    let id = msg.to == me.toLowerCase() ? msg.from : msg.to,
        chat = $(`[id="chat/${id}"]`);

    chat.innerHTML += `<li>${msg.message.replace(new RegExp(`${me}:`), 'You:')}`;
    $('.room-active').id == id && chat.scrollIntoView(false);

    if ($('.room-active').id != id) {
      let numMessages = parseInt($(`#${id} div span`).textContent) || 0;

      $(`#${id} div`).classList.add('unread-message');

      $(`#${id} div span`).textContent = numMessages + 1;
    }

  }, errorHandler);

  $('#btSend').onclick = () => {
    let msg = {
      from: me.toLowerCase(),
      to: $('.chat-active').id.split('/')[1],
      message: `${me}: ${$('#inMessage').value}`
    };
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
  $('.chat-active').classList.remove('chat-active');
  $('.room-active').classList.remove('room-active');
  $(`#${id} div`).classList.contains('unread-message') && $(`#${id} div`).classList.remove('unread-message');

  $(`[id="chat/${id}"]`).classList.add('chat-active');
  $(`.rooms #${id}`).classList.add('room-active');

  $(`#${id} div span`).textContent = '';

  $('#inMessage').focus();
}

function errorHandler(err){
  err && console.log(err);
}
