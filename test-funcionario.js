const http = require('http');

// Dados do novo usuário (FUNCIONÁRIO, não DONO)
const userData = JSON.stringify({
  nome: 'Raul Silva',
  email: `raul-${Date.now()}@example.com`,
  senha: '123456',
  tipo: 'FUNCIONARIO'  // Criar como FUNCIONÁRIO
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

const req = http.request(options, (res) => {
  console.log(`\n📊 Status: ${res.statusCode}`);

  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log('\n✅ Response:');
      console.log(JSON.stringify(json, null, 2));
      
      if (json.sucesso) {
        console.log('\n🎉 Usuário criado com sucesso!');
      }
    } catch (e) {
      console.log(body);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erro:', e.message);
});

const parsedData = JSON.parse(userData);
console.log('📤 Criando novo FUNCIONÁRIO:');
console.log(`   Nome: ${parsedData.nome}`);
console.log(`   Email: ${parsedData.email}`);
console.log(`   Tipo: ${parsedData.tipo}`);

req.write(userData);
req.end();
