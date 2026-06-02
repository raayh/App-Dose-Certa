# Roteiro de Apresentação Consolidado: Dose Certa 🎤 (Foco: ~5 minutos)

Este roteiro foi otimizado para uma gravação de **5 minutos** (aproximadamente 650 palavras no total). As falas são diretas, dinâmicas e divididas entre as áreas do grupo.

---

## 👥 Divisão e Tempo Estimado

*   **Slide 1: Problema, Nicho & Acessibilidade** (Rayssa) — *1 min 15s*
*   **Slide 2: Concorrentes & Diferencial** (Pedro / Levi) — *1 min 15s*
*   **Slide 3: Desafios Técnicos & Backend** (Cauan) — *1 min 15s*
*   **Slide 4: SWOT & Conclusão** (Nicollas / Luana) — *1 min 15s*

---

## 🗣️ Slide 1: O Problema e o Público-Alvo (Introdução)
**Apresentador:** Rayssa (Tempo: 1m 15s)

> **Rayssa:**
> "Olá a todos. Vamos apresentar o **Dose Certa**, um app projetado para combater a baixa adesão a tratamentos médicos. Pacientes que tomam múltiplos medicamentos, especialmente idosos, sofrem com esquecimentos e com o 'branco' na hora de relatar as doses aos médicos. 
> Nosso nicho foca exatamente nesses **pacientes crônicos, idosos e seus cuidadores**. 
> Para atendê-los, nossa interface adota uma **Acessibilidade Tática**: botões largos, fontes dinâmicas que suportam redimensionamento sem quebrar a tela e feedback vibratório tátil (háptico) a cada check-in de dose, garantindo simplicidade e segurança."

---

## 🗣️ Slide 2: Concorrentes e Nossa Proposta
**Apresentadores:** Pedro & Levi (Tempo: 1m 15s)

> **Pedro:**
> "No mercado, analisamos concorrentes como o **Medisafe** e o **MyTherapy**. 
> O **Medisafe** é muito poluído visualmente, cheio de propagandas, telas de assinatura premium e estatísticas complexas que assustam o idoso. O **MyTherapy** foca em diários de saúde amplos (pressão, humor, peso), o que dificulta o uso rápido e simples de quem quer apenas registrar sua pílula diária. Além disso, ambos exigem conexão constante com a internet, falhando em ambientes como subsolos, elevadores ou metrôs."

> **Levi:**
> "O diferencial do Dose Certa é a simplicidade e a **resiliência offline**. 
> O usuário faz o check-in da dose instantaneamente e, mesmo sem internet, os dados são salvos localmente e sincronizados em segundo plano quando a conexão retorna."

---

## 🗣️ Slide 3: Desafio Técnico Superado
**Apresentador:** Cauan (Tempo: 1m 15s)

> **Cauan:**
> "No backend, nosso maior desafio foi o **Bug do Fuso Horário**. Usar `toISOString()` registrava check-ins após as 21h no dia seguinte devido ao fuso UTC-3. Resolvemos padronizando as operações e o banco de dados locais com `.toLocaleDateString('en-CA')`.
> Também eliminamos condições de corrida na inicialização do app. Substituímos a leitura síncrona de `currentUser` pelo listener ativo `onAuthStateChanged`, evitando que telas principais montassem vazias por atraso na resposta de autenticação."

---

## 🗣️ Slide 4: Análise SWOT e Conclusão
**Apresentadores:** Nicollas & Luana (Tempo: 1m 15s)

> **Nicollas:**
> "Como **vantagens**, o app oferece usabilidade acessível, resiliência offline nativa no Firestore e histórico claro. 
> A **desvantagem** atual é a dependência de notificações locais no celular, que podem ser encerradas se o sistema operacional otimizar a bateria."

> **Luana:**
> "Concluímos que o MVP do Dose Certa entrega um sistema seguro (com regras fechadas no banco de dados e zero vulnerabilidades identificadas em auditoria) e totalmente funcional. 
> Ele devolve a autonomia ao paciente e traz dados confiáveis para os profissionais de saúde. Obrigado."
