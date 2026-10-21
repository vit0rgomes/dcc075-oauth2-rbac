# DCC075 - Segurança em Sistemas de Computação
## Atividade 02: Autenticação Google OAuth 2.0 + Autorização RBAC

Este repositório implementa a união entre **Autenticação com Google OAuth 2.0** e **Autorização baseada em papéis (RBAC)** utilizando Node.js e Express.

---

### 📌 Funcionamento
1. **Autenticação:**
   - O aplicativo redireciona o usuário para a página segura de login do Google.
   - O usuário autoriza os escopos (`email`, `profile`, `openid`).
   - O backend recebe o código de autorização em `/callback`, troca pelos tokens junto ao Google e valida a assinatura do `id_token`.
2. **Autorização (RBAC):**
   - A partir do atributo `email` obtido no `id_token`, o sistema classifica o usuário em papéis:
     - **Estudante (`estudante`):** Usuários com e-mail estudantil (ex: `@estudante.ufjf.br`) recebem permissões de consulta e envio de tarefas.
     - **Professor (`professor`):** Recebem permissões estendidas (lançamento de notas e gestão de turmas).
   - O resultado do controle de acesso e permissões ativas é renderizado dinamicamente na página `/welcome`.

---

### 🚀 Como Executar

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Configurar as credenciais do Google Cloud Console:**
   Renomeie ou copie o arquivo `.env.example` para `.env` e preencha suas chaves:
   ```env
   GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
   GOOGLE_REDIRECT_URI=http://localhost:3000/callback
   ```

3. **Iniciar o servidor:**
   ```bash
   npm start
   ```

4. **Acessar a aplicação:**
   Abra o navegador em [http://localhost:3000](http://localhost:3000) e realize o login.
