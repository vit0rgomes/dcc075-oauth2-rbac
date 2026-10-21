import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env (CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
dotenv.config();

const app = express();
const PORT = 3000;

// Inicializa o cliente OAuth2 do Google com as credenciais configuradas no Google Cloud Console
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Definição de permissões por papel (RBAC)
const RBAC_PERMISSOES = {
    estudante: ['Visualizar notas', 'Acessar material de aula', 'Enviar tarefas'],
    professor: ['Visualizar notas', 'Acessar material de aula', 'Lançar notas', 'Gerenciar turma'],
};

// Rota inicial: gera a URL de autenticação do Google e exibe o link de login
app.get('/', (req, res) => {
    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['email', 'profile', 'openid'],
    });
    res.send(`
        <h1>Autenticação com Google OAuth2 + RBAC</h1>
        <a href="${url}">Login com Google</a>
    `);
});

// Rota de callback: recebe o código de autorização do Google e troca por tokens
app.get('/callback', async (req, res) => {
    try {
        const { code } = req.query;

        // Troca o código de autorização pelos tokens (access_token, id_token, etc.)
        const { tokens } = await client.getToken(code);
        console.log('Tokens recebidos do Google:', tokens); // Exibe o token no terminal (conforme Apêndice)
        client.setCredentials(tokens);

        // Verifica a integridade e autenticidade do ID Token junto ao Google
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        // Extrai os atributos do usuário autenticado (nome, e-mail, etc.)
        const payload = ticket.getPayload();
        const name = encodeURIComponent(payload.name);
        const email = encodeURIComponent(payload.email);

        // Redireciona para a página autenticada passando os atributos para o controle RBAC
        res.redirect(`/welcome?name=${name}&email=${email}`);
    } catch (error) {
        console.error('Erro na autenticação:', error);
        res.status(500).send('Erro ao autenticar com o Google.');
    }
});

// Rota autenticada: aplica a Autorização RBAC com base no atributo 'email' vindo do Google
app.get('/welcome', (req, res) => {
    const { name, email } = req.query;

    // Regra RBAC baseada no atributo do e-mail:
    // Se o e-mail contém "estudante" (ex: @estudante.ufjf.br), recebe o papel "estudante",
    // caso contrário recebe o papel "professor".
    const ehEstudante = email && email.includes('estudante');
    const papel = ehEstudante ? 'estudante' : 'professor';
    const permissoes = RBAC_PERMISSOES[papel];

    res.send(`
        <h1>Bem-vindo, ${papel} ${name}!</h1>
        <p><strong>Seu e-mail autenticado:</strong> ${email}</p>
        <p><strong>Papel atribuído (RBAC):</strong> ${papel.toUpperCase()}</p>
        <h3>Permissões liberadas para o seu perfil:</h3>
        <ul>
            ${permissoes.map(p => `<li>${p}</li>`).join('')}
        </ul>
    `);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
