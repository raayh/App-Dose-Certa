# Configuração Inicial do Projeto: Dose Certa

Este guia descreve como o ambiente de desenvolvimento foi preparado e como o projeto Expo foi inicializado.

## 1. Requisitos Prévios
- **Node.js:** Versão 18 ou superior.
- **Git:** Para versionamento.
- **Expo Go:** Aplicativo instalado no celular para testes em tempo real.

## 2. Criação do Projeto
O projeto foi criado utilizando a CLI do Expo com o template de navegação por abas (Tabs):
```bash
npx create-expo-app@latest app-dose-certa --template tabs
```

## 3. Comandos Principais e Scripts
Os seguintes comandos são essenciais para o dia a dia do desenvolvimento:

- **Iniciar o Metro Bundler:** `npx expo start`
- **Limpar o Cache (se algo travar):** `npx expo start --clear`
- **Modo Túnel (para redes WiFi diferentes):** `npx expo start --tunnel`

## 4. Estrutura de Diretórios
- **/app:** Contém as rotas e telas do aplicativo (Expo Router).
- **/services:** Lógica de backend e integrações (ex: Firebase).
- **/components:** Componentes visuais reutilizáveis.
- **/docs:** Documentação técnica do projeto.

---
*Documentação criada como parte da Semana 3 do planejamento tático.*
