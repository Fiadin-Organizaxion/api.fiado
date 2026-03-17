/**
 * Utilitários de criptografia
 * Utiliza bcrypt para hash de senhas
 */

import bcrypt from 'bcrypt';

// Número de rounds para o salt do bcrypt (quanto maior, mais seguro, mas mais lento)
const SALT_ROUNDS = 10;

/**
 * Gera hash de uma senha
 * @param senha - Senha em texto plano
 * @returns Hash da senha
 */
export async function hashSenha(senha: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(senha, salt);
}

/**
 * Compara uma senha com seu hash
 * @param senha - Senha em texto plano
 * @param hash - Hash armazenado
 * @returns true se as senhas correspondem
 */
export async function compararSenha(senha: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(senha, hash);
}
