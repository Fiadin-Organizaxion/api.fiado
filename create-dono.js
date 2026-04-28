#!/usr/bin/env node
const http = require('http');

// Primeiro: Criar um DONO (sem autenticação, pois é o primeiro)
const userData = JSON.stringify({
  nome: 'Admin',
  email: `admin${Date.now()}@test.com`,
  senha: '123456',
  tipo: 'DONO'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/usuarios',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': userData.length
  }
};

console.log('✅ Criando novo DONO no Supabase correto...\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}\n`);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const resp = JSON.parse(body);
      console.log(JSON.stringify(resp, null, 2));
      if (res.statusCode === 201) {
        console.log('\n✅ DONO criado com sucesso no Supabase!');
      }
    } catch (e) {
      console.log(body);
    }
  });
});

req.on('error', (e) => console.error('Erro:', e.message));

req.write(userData);
req.end();
