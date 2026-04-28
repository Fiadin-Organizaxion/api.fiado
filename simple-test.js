#!/usr/bin/env node
const http = require('http');

const data = JSON.stringify({
  nome: 'Test User',
  email: `user${Date.now()}@test.com`,
  senha: '123456',
  tipo: 'FUNCIONARIO'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/usuarios',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Tentando conectar...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      console.log(JSON.parse(body));
    } catch (e) {
      console.log(body);
    }
  });
});

req.on('error', (e) => console.error('Erro:', e.message));

req.write(data);
req.end();
