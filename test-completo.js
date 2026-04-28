const http = require('http');

// Primeiro faz login para obter token
function fazerLogin() {
  return new Promise((resolve) => {
    const loginData = JSON.stringify({
      email: 'test-1775589790921@email.com',  // Email do usuário criado
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
            console.log('✅ Login realizado! Token:', json.dados.token.substring(0, 20) + '...\n');
            resolve(json.dados.token);
          } else {
            console.log('❌ Erro no login:', json.mensagem);
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

// Agora cria um novo usuário
async function criarUsuario(token) {
  return new Promise((resolve) => {
    const userData = JSON.stringify({
      nome: 'Novo Raul',
      email: `raul-${Date.now()}@email.com`,
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

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);

      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log('\n✅ Response:');
          console.log(JSON.stringify(json, null, 2));
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

// Main
(async () => {
  const token = await fazerLogin();
  console.log('📤 Tentando criar novo usuário...\n');
  await criarUsuario(token);
})();
