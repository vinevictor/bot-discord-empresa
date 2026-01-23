// src/index.js
require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

// Importar comandos
const { setupEmpresa } = require('./comandos/setup');
const { enviarPainel, abrirTicket, fecharTicket } = require('./comandos/ticket'); // <--- Importei fecharTicket

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`🤖 Bot da Empresa online: ${client.user.tag}`);
});

// --- COMANDOS DE TEXTO ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!setup') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        await setupEmpresa(message);
    }

    if (message.content === '!painel') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        // Apaga a mensagem do comando para ficar limpo (opcional)
        message.delete().catch(() => { });
        await enviarPainel(message);
    }
});

// --- INTERAÇÕES (BOTÕES) ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    try {
        if (interaction.customId === 'abrir_ticket') {
            await abrirTicket(interaction);
        }

        // --- NOVO: Lógica para fechar ---
        if (interaction.customId === 'fechar_ticket') {
            // Verifica se quem clicou tem permissão (podes remover o IF se quiseres que o usuário feche o próprio ticket)
            // Aqui deixei liberado para quem está no canal fechar
            await fecharTicket(interaction);
        }

    } catch (erro) {
        console.error(erro);
        if (!interaction.replied) {
            await interaction.reply({ content: 'Ocorreu um erro.', ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);