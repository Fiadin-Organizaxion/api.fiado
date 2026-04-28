const http = require('http');
const fs = require('fs');

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

    console.log('🔐 Realizando login com dono...');
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.sucesso && json.dados && json.dados.token) {
            console.log('✅ Login realizado!\n');
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

async function criarUsuario(token) {
  return new Promise((resolve) => {
    const userData = JSON.stringify({
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
        'Content-Length': userData.length,
        'Authorization': `Bearer ${token}`
      }
    };

    console.log('📤 Criando novo usuário (DONO):');
    console.log('   Nome: Raul');
    console.log('   Email: raul@email.com');
    console.log('   Tipo: DONO\n');

    const req = http.request(options, (res) => {
      console.log(`📊 Status da Resposta: ${res.statusCode}`);

      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log('Response:');
          console.log(JSON.stringify(json, null, 2));
          
          if (json.sucesso) {
            console.log('\n✅ Usuário criado com sucesso!');
          } else {
            console.log('\n⚠️  Erro:', json.mensagem);
          }
        } catch (e) {
          console.log(body);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('❌ Erro na requisição:', e.message);
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
