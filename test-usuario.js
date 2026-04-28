const http = require('http');

const data = JSON.stringify({
  nome: 'Raul',
  email: 'raul@email.com',
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
  console.log('Headers:', res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      console.log(JSON.stringify(JSON.parse(body), null, 2));
    } catch (e) {
      console.log(body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error.message);
});

console.log('📤 Enviando POST para http://localhost:3000/usuarios');
console.log('Dados:', JSON.stringify(JSON.parse(data), null, 2));
req.write(data);
req.end();
