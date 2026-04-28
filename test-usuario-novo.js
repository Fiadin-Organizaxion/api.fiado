const http = require('http');

const data = JSON.stringify({
  nome: 'Raul Silva',
  email: `raul${Date.now()}@email.com`,
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
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`\nStatus: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log('\nResponse:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro:', error.message);
});

console.log('📤 Enviando POST para http://localhost:3000/usuarios');
console.log('Email único:', JSON.parse(data).email);
req.write(data);
req.end();
