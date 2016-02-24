'use strict';

const Hapi   = require('hapi'),
      Inert  = require('inert'),
      Nes    = require('nes'),
      Fs     = require('fs'),
      server = new Hapi.Server();

let name;

server.connection({
  port: process.argv[2] || 3000
});

server.register([Inert, {
  register: Nes,
  options: {
    onConnection: socket => {
      socket.name = name;
      server.publish('/connect', socket.name);
    },
    onDisconnection: socket => {
      server.publish('/disconnect', socket.name);
    },
    onMessage: (senderSocket, msg, next) => {
      if (msg.to == 'general') {
        server.publish('/chat', msg);
      }
      else {
        let receiverSocket;

        server.eachSocket(socket => {
          if (socket.name.toLowerCase() == msg.to) receiverSocket = socket;
        });

        senderSocket.publish('/chat', msg);
        receiverSocket.publish('/chat', msg);
      }
    }
  }
}],(err) => {
  if(err){
    throw err;
  }

  server.route([
  {
    method: 'GET',
    path: '/',
    handler: {
      file: './login.html'
    }
  },
  {
    method: 'POST',
    path: '/chat',
    handler: (request, reply) => {
      name = request.payload.name.split(' ').map(name => name[0].toUpperCase() + name.slice(1).toLowerCase()).join(" ").replace(/\'/g, '\\\'');
      let file = Fs.readFileSync('./index.html', 'utf-8').replace('{{me}}', name);
      reply(file);
    }
  },
  {
    method: 'GET',
    path: '/public/{params*}',
    handler: {
      directory: {
        path: './public',
        listing: false,
        index: true
      }
    }
  },
  {
    method: 'GET',
    path: '/names',
    handler: (request, reply) => {
      let names = [];

      server.eachSocket(socket => {
        names = names.concat(socket.name.toLowerCase());
      })

      reply(names);
    }
  }])

  server.subscription('/chat');
  server.subscription('/connect');
  server.subscription('/disconnect');

  server.start(() => console.log('Server running at:', server.info.uri));
})
