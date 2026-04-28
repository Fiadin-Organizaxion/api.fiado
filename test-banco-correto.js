const http = require('http');

async function fazerLogin() {
  return new Promise((resolve) => {
    const loginData = JSON.stringify({
      email: 'raul@email.com',
      senha: '123456'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.sucesso && json.dados && json.dados.token) {
            resolve(json.dados.token);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.write(loginData);
    req.end();
  });
}

async function criarUsuario(token) {
  return new Promise((resolve) => {
    const userData = JSON.stringify({
      nome: 'Novo User',
      email: `user${Date.now()}@email.com`,
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
        'Content-Length': userData.length,
        'Authorization': `Bearer ${token}`
      }
    };

    console.log('✅ Banco de dados corrigido! Testando criação...\n');
    console.log('📤 POST http://localhost:3000/usuarios\n');
    const parsed = JSON.parse(userData);
    console.log('Body:');
    console.log(JSON.stringify(parsed, null, 2));
    console.log('\n' + '-'.repeat(50) + '\n');

    const req = http.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}\n`);

      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log('Response:');
          console.log(JSON.stringify(json, null, 2));
          
          if (res.statusCode === 201) {
            console.log('\n✅ Sucesso! Banco configurado corretamente!');
          }
        } catch (e) {
          console.log(body);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('❌ Erro:', e.message);
      resolve();
    });

    req.write(userData);
    req.end();
  });
}

(async () => {
  const token = await fazerLogin();
  if (token) {
    await criarUsuario(token);
  }
})();
