# 📚 Manual do Desenvolvedor: App Dose Certa

Bem-vindo(a) ao time de desenvolvimento do **Dose Certa**! Este guia foi feito para que você consiga configurar seu computador e começar a contribuir para o projeto, mesmo que este seja o seu primeiro contato com programação.

---

## 📖 1. Glossário (Termos que vamos usar)

*   **IDE (Ambiente de Desenvolvimento):** É o seu "editor de texto" inteligente. Recomendamos o **VS Code**.
*   **Terminal:** É aquela janelinha preta onde digitamos comandos para o computador executar.
*   **Git:** É o sistema que "tira fotos" (commits) do nosso código para podermos voltar no tempo se algo der errado.
*   **GitHub:** É o site onde guardamos nosso projeto e compartilhamos com o time.
*   **Branch (Ramo):** É uma cópia do projeto onde você pode mexer sem estragar o que já está pronto na "rua principal" (`main`).
*   **Pull Request (PR):** É o pedido que você faz para que as suas mudanças entrem no projeto oficial.

---

## 🛠️ 2. Ferramentas Necessárias

Antes de começar, instale estes programas:
1.  **Node.js (Versão LTS):** [Download aqui](https://nodejs.org/)
2.  **Git:** [Download aqui](https://git-scm.com/)
3.  **VS Code:** [Download aqui](https://code.visualstudio.com/)
4.  **Expo Go (No Celular):** **OBRIGATÓRIO.** Baixe na Play Store ou App Store. É por ele que você vai testar o app no seu celular real. Sem isso, você não consegue ver o que está programando.

---

## 🚀 3. Primeiro Acesso (Configurando tudo)

### Passo 1: Clonar o Projeto
Abra o seu terminal (ou o terminal dentro do VS Code) e digite:
```bash
git clone https://github.com/raayh/Dose-Certa.git
```

### Passo 2: Instalar as Dependências
Entre na pasta do projeto e rode este comando para baixar as bibliotecas que o app usa:
```bash
npm install
```

### Passo 3: Variáveis de Ambiente (Configuração Secreta)
O app precisa se conectar ao banco de dados, mas as chaves são secretas.
1. Na pasta do projeto, encontre o arquivo `.env.example`.
2. Crie uma cópia dele e mude o nome para **`.env.local`**.
3. Peça as chaves reais para a Rayssa e preencha o arquivo.

---

## 🏃 4. Rodando o App

Para ver o app funcionando, digite no terminal:
```bash
npx expo start
```
Vai aparecer um QR Code. Abra o app **Expo Go** no seu celular e escaneie o código!

## 🛡️ 5. Regras da Casa (O Fluxo de Trabalho)

> [!IMPORTANT]
> **REGRA DE OURO:** É terminantemente PROIBIDO fazer `git push` direto na branch `main`. 
> Se você fizer isso, pode quebrar o código de todo o time e perderemos pontos na avaliação de "Boas Práticas".

### O Ciclo de Trabalho Correto:
1.  **Crie sua cópia (Branch):** 
    `git checkout -b feature/nome-da-sua-tarefa`
2.  **Trabalhe no código.**
3.  **Envie para o GitHub:** 
    `git add .` -> `git commit -m "..."` -> `git push origin feature/nome-da-sua-tarefa`
4.  **Peça Revisão (Pull Request):** Vá no GitHub e abra um PR. **Outra pessoa do time deve revisar e aprovar** antes de o código entrar na `main`.

---

## 📝 6. Boas Práticas de Commit (Padrão Profissional)

Para ganharmos a nota máxima, todos os nossos commits devem seguir este padrão (Conventional Commits) e as mensagens devem ser obrigatoriamente em **INGLÊS**:

*   `feat:` Quando você adiciona algo novo (Ex: `feat: create login screen`)
*   `fix:` Quando você corrige um erro (Ex: `fix: adjust button alignment`)
*   `docs:` Quando você mexe apenas em textos ou guias (Ex: `docs: update developer manual`)
*   `style:` Mudanças de aparência que não afetam a lógica (Ex: `style: change background color`)

**Exemplo de um commit nota 10:** 
`git commit -m "feat: implement medication dose counter"`

---

## 🗺️ 7. Roteiro de Trabalho e Responsáveis

Siga a tabela abaixo para saber o que fazer, quem é o responsável e qual guia ler para completar a tarefa:

| Fase | Tarefa | Guia de Estudo | Responsável | Prazo |
| :--- | :--- | :--- | :--- | :--- |
| **Preparação** | Proposta do Projeto | [Ler Guia](file:///home/note-rayssa/Documentos/app-dose-certa/docs/handoff/semanas1-2_preparacao/0.PASSO_A_PASSO.md) | Equipe | ✅ |
| **P. Técnica** | Setup Firebase/Expo | [Ler Guia](file:///home/note-rayssa/Documentos/app-dose-certa/docs/handoff/semanas3-4_preparacao_tecnica/0.PREPARACAO_TECNICA.md) | Cauan | ✅ |
| **Login** | Front-end (Telas) | [Passo 1](file:///home/note-rayssa/Documentos/app-dose-certa/docs/handoff/semana5_login/1.SETUP_LOGIN_FRONT.md) | Pedro/Levi | 04/05 |
| **Login** | Banco de Dados | [Passo 2](file:///home/note-rayssa/Documentos/app-dose-certa/docs/handoff/semana5_login/3.SETUP_LOGIN_DB.md) | Nicollas | 04/05 |
| **Login** | Back-end (Lógica) | [Passo 3](file:///home/note-rayssa/Documentos/app-dose-certa/docs/handoff/semana5_login/2.SETUP_LOGIN_BACK.md) | Rayssa | 05/05 |
| **Home** | DB de Medicamentos | [Ler Guia](file:///home/note-rayssa/Documentos/app-dose-certa/docs/handoff/semana6_home/1.SETUP_HOME_DB.md) | [NOME] | [DATA] |
| **Home** | Ícones e Contador | [Em breve] | [NOME] | [DATA] |
| **Home** | Refino de Design | [Em breve] | [NOME] | [DATA] |

