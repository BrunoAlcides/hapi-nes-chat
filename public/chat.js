'use strict';

(function(){
  const client = new nes.Client('ws://localhost:3000/chat');

  client.connect({}, err => {
    err && console.log(err);
  });

  client.onUpdate = update => {
    $('.chat').innerHTML += `<li>${update}`;
    $('.chat').scrollIntoView(false);
  };

  client.subscribe('/chat', message => {
    $('.chat').innerHTML += `<li>${message}`;
    $('.chat').scrollIntoView(false);
  }, err => {
    err && console.log(err);
  });

  $('#btSend').onclick = () => {
    $('#inMessage').value && client.message($('#inMessage').value);
    $('#inMessage').value = '';
    $('#inMessage').focus();
  };

  $('#inMessage').onkeydown = e => {
    e.keyCode == 13 && $('#btSend').click();
  }

  function $(elm){
    return document.querySelector(elm);
  };
})();
