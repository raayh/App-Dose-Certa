# Guia de Implementação: Backend, Segurança e Resiliência (Semana 11) ⚙️

Este guia detalha o que foi feito em cada arquivo de backend e resiliência, incluindo trechos de código e explicações de como cada bug foi corrigido.

---

## 🐛 Bug #1, #2 e #3 — Login Seguro, Tratamento de Erros e Sincronização de Cadastro

**Arquivo:** `app/(auth)/login.tsx`

### Como era
O fluxo de login capturava erros de forma genérica e não re-sincronizava contas no Firestore caso houvesse falha anterior.

### Como ficou (Novo Código)

No topo do arquivo, importamos as funções necessárias para checar métodos de login e buscar documentos no Firestore:
```typescript
import {
  signInWithEmailAndPassword,
  signOut,
  fetchSignInMethodsForEmail, // 👈 Para descobrir se a conta existe
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // 👈 getDoc adicionado
```

Modificamos a função `handleLogin` para mapear todos os erros e validar a existência do documento do usuário:

```typescript
const handleLogin = async () => {
  setLoading(true);
  try {
    const credenciais = await signInWithEmailAndPassword(auth, email, password);

    if (!credenciais.user.emailVerified) {
      await signOut(auth);
      Alert.alert("Acesso Negado", "Email não verificado");
      return;
    }

    // 🐛 Bug #2: Sincroniza Auth com o Firestore
    const user = credenciais.user;
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        email: user.email,
        user_id: user.uid,
        created_at: new Date().toISOString()
      });
    }
  } catch (error: any) {
    if (error.code === 'auth/network-request-failed') {
      // 🐛 Bug #3: Erro de Rede Amigável
      Alert.alert("Sem Conexão", "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.");
    } else if (error.code === 'auth/invalid-email') {
      Alert.alert("Erro de Login", "O formato do e-mail digitado é inválido.");
    } else if (error.code === 'auth/user-disabled') {
      Alert.alert("Acesso Negado", "Esta conta foi desativada.");
    } else if (error.code === 'auth/too-many-requests') {
      Alert.alert("Acesso Bloqueado", "Excesso de tentativas incorretas. Tente novamente mais tarde.");
    } else if (error.code === 'auth/invalid-credential') {
      // 🐛 Bug #1: Descobre se o e-mail existe ou se errou apenas a senha
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length === 0) {
          Alert.alert(
            "Conta não encontrada",
            `O e-mail ${email} não está cadastrado. Deseja criar uma conta?`,
            [
              { text: "Não", style: "cancel" },
              { text: "Sim, Criar!", onPress: () => handleSignUp() }
            ]
          );
        } else {
          Alert.alert("Erro de Login", "Senha incorreta.");
        }
      } catch {
        Alert.alert("Erro de Login", "E-mail ou senha inválidos.");
      }
    } else {
      Alert.alert("Erro", "E-mail ou senha inválidos.");
    }
  } finally {
    setLoading(false);
  }
};
```

---

## 🐛 Bug #4 — Resolução do Bug do Fuso Horário (Data Local)

**Arquivos:** `app/(tabs)/index.tsx`, `app/(tabs)/add.tsx`, `app/(tabs)/history.tsx`, `services/seed.ts`

### O que ocorria
Ao usar `.toISOString().split('T')[0]`, o app pegava a hora UTC. Após as 21h no fuso brasileiro (-3h), a data pulava para o dia seguinte, gerando dados inconsistentes.

### Solução (Novo Código)
Substituímos o `.toISOString().split('T')[0]` pela formatação local `en-CA` do JavaScript, que entrega a string `YYYY-MM-DD` com base no fuso horário do aparelho do usuário:

* **Na Dashboard (`index.tsx`):**
```typescript
// Antes:
const [selectedDate, setSelecteddate] = useState(new Date().toISOString().split('T')[0]);
// Depois:
const [selectedDate, setSelecteddate] = useState(new Date().toLocaleDateString('en-CA'));
```

* **No Cadastro (`add.tsx`):**
```typescript
// Antes:
startDate: startDate.toISOString(),
endDate: endDate ? endDate.toISOString() : null,
// Depois:
startDate: startDate.toLocaleDateString('en-CA'),
endDate: endDate ? endDate.toLocaleDateString('en-CA') : null,
```

* **No Histórico (`history.tsx`):**
```typescript
// Antes:
const todayStr = new Date().toISOString().split('T')[0];
// Depois:
const todayStr = new Date().toLocaleDateString('en-CA');
```

---

## 🐛 Bug #5 — Fim das Telas Vazias (Race Condition de Auth)

**Arquivos:** `app/(tabs)/index.tsx`, `app/(tabs)/history.tsx`

### O que ocorria
Ao ler `const user = auth.currentUser;` diretamente na renderização, a tela carregava com usuário `null` por conta do atraso da inicialização assíncrona do Firebase Auth. O app ficava travado em tela vazia até o usuário forçar uma atualização.

### Solução (Novo Código)
Implementado o listener `onAuthStateChanged` e transformado o `user` em estado de tela:

```typescript
import { onAuthStateChanged, User } from 'firebase/auth';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  // Escuta ativa do estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // Agora re-dispara a busca quando o usuário carregar ou mudar
  useEffect(() => {
    if (user) {
      fecthMedications();
    }
  }, [selectedDate, user]);
```

---

## 📴 Resiliência Offline (Cache no Firestore)

**Arquivo:** `services/firebaseConfig.ts`

### Como funcionava
Sem cache, se o usuário tentasse interagir com o Firestore offline, a requisição travava aguardando conexão.

### Solução (Novo Código)
Importamos e configuramos o `persistentLocalCache` para ativar a resiliência offline nativa:

```typescript
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({}), // 👈 Habilita armazenamento offline do banco
});
```
