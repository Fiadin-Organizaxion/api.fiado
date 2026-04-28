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
      nome: 'Raul',
      email: 'raulo@email.com',  // Email único
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
        'Content-Length': userData.length,
        'Authorization': `Bearer ${token}`
      }
    };

    console.log('🎯 TESTE FINAL - Criando usuário conforme solicitado:\n');
    console.log('  {');
    console.log('    "nome": "Raul",');
    console.log('    "email": "raulo@email.com",');
    console.log('    "senha": "123456",');
    console.log('    "tipo": "DONO"');
    console.log('  }\n');

    const req = http.request(options, (res) => {
      console.log(`📧 POST http://localhost:3000/usuarios - Status ${res.statusCode}\n`);

      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log('✅ Resposta:');
          console.log(JSON.stringify(json, null, 2));
          
          if (res.statusCode === 201) {
            console.log('\n🎉 Sucesso! Usuário criado com sucesso no Supabase!');
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
