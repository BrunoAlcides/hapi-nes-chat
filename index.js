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
      server.broadcast(`Hello, ${name}`);
    },
    onDisconnection: socket => {
      server.broadcast(`Bye, ${socket.name}`);
    },
    onMessage: (socket, message, next) => {
      server.publish('/chat', message);
    }
  }
}],(err) => {
  if(err){
    throw err;
  }

  server.subscription('/chat');

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
      name = request.payload.name.split(' ').map(name => name[0].toUpperCase() + name.slice(1).toLowerCase()).join(" ").trim().replace(/\'/g, '\\\'');
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
  }]);

  server.start(() => console.log('Server running at:', server.info.uri));
});
