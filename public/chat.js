'use strict';

(function(){
  const client = new nes.Client('ws://localhost:3000/chat');

  client.connect({}, err => {
    err && console.log(err);
  });

  client.onUpdate = update => {
    $('.chat').innerHTML += `<li>${update.replace(new RegExp(`${me} `), 'You ')}`;
    $('.chat').scrollIntoView(false);
  };

  client.subscribe('/chat', message => {
    $('.chat').innerHTML += `<li>${message.replace(new RegExp(`${me}:`), 'You:')}`;
    $('.chat').scrollIntoView(false);
  }, err => {
    err && console.log(err);
  });

  $('#btSend').onclick = () => {
    $('#inMessage').value && client.message(`${me}: ${$('#inMessage').value}`);
    $('#inMessage').value = '';
    $('#inMessage').focus();
  };

  $('#inMessage').onkeydown = e => {
    e.keyCode == 13 && $('#btSend').click();
  };

  $('#inMessage').focus();

  function $(elm){
    return document.querySelector(elm);
  };
})();
