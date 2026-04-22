// ==========================================
// 📊 MODELAGEM DE DADOS DO FIREBASE (NOSQL)
// ==========================================
// Mente de Arquiteta: Como o NoSQL (Firestore) não exige tabelas fixas, 
// o TypeScript (estas interfaces) é a nossa única "barreira de segurança" 
// para garantir que ninguém salve campos errados no banco!

// ---------------------------------------------------------
// 1. USUÁRIOS (Coleção "users")
// Só precisamos salvar informações extras aqui. Senhas NUNCA vêm para cá.
// ---------------------------------------------------------
export interface User {
  id: string; // Chave primária gerada pelo auth
  email: string;
  created_at: Date;
}