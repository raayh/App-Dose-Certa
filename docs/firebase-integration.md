# Guia de Integração: Firebase + Expo

Este documento detalha como a infraestrutura de backend foi configurada no projeto **Dose Certa** para garantir segurança e escalabilidade.

## 1. Firebase Console
- **Projeto:** `dose-certa`
- **Região:** `southamerica-east1` (São Paulo) - Escolhida para reduzir a latência no Brasil.
- **Serviços Ativos:**
  - **Authentication:** Método E-mail/Senha habilitado e login com Google também.
  - **Firestore Database:** Configurado em **Modo de Teste** (leitura/escrita aberta por 30 dias para desenvolvimento do MVP).

## 2. Segurança de Credenciais
Todas as chaves de API são armazenadas no arquivo `.env.local` na raiz do projeto.
- **Prefixos:** Utilizamos `EXPO_PUBLIC_` para que o Expo exponha essas variáveis no código frontend.
- **Proteção:** O arquivo `.env.local` está no `.gitignore` para nunca ser enviado ao repositório público.

## 3. Configuração no Código
A inicialização centralizada acontece em [services/firebaseConfig.ts](file:///home/note-rayssa/Documentos/app-dose-certa/services/firebaseConfig.ts):
```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  // ... outras variáveis
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## 4. Proteção Global (Auth Guard)
O controle de acesso é feito no arquivo [app/_layout.tsx](file:///home/note-rayssa/Documentos/app-dose-certa/app/_layout.tsx):
- Utiliza o listener `onAuthStateChanged` para monitorar a sessão do usuário.
- Se o usuário não estiver logado, o app redireciona automaticamente para `/(auth)/login`.

---
*Documentação criada como parte da Semana 4 do planejamento tático.*
