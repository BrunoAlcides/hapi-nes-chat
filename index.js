'use strict';

const Hapi   = require('hapi'),
      Inert  = require('inert'),
      Nes    = require('nes'),
      server = new Hapi.Server();

server.connection({
  port: process.argv[2] || 3000
});

server.register([Inert, {
  register: Nes,
  options: {
    onConnection: socket => {
      server.broadcast('Hello!!!');
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
    path: '/chat',
    handler: {
      file: 'index.html'
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
