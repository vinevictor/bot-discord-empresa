// src/index.js
require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

// Importar comandos
const { setupEmpresa } = require('./comandos/setup');
const { enviarPainel, abrirTicket, fecharTicket } = require('./comandos/ticket');
const { publicarUpdate } = require('./comandos/updates'); // <--- IMPORTAR AQUI

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

    // !setup
    if (message.content === '!setup') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        await setupEmpresa(message);
    }

    // !painel
    if (message.content === '!painel') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        message.delete().catch(() => { });
        await enviarPainel(message);
    }

    // !update (NOVO)
    if (message.content.startsWith('!update')) {
        // Verifica se é Admin ou tem cargo de T.I
        const temPermissao = message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
            message.member.roles.cache.some(r => r.name.includes('T.I'));

        if (!temPermissao) {
            return message.reply('❌ Apenas T.I ou Administradores podem postar updates.');
        }

        await publicarUpdate(message);
    }
});

// --- INTERAÇÕES (BOTÕES) ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    try {
        if (interaction.customId === 'abrir_ticket') await abrirTicket(interaction);
        if (interaction.customId === 'fechar_ticket') await fecharTicket(interaction);
    } catch (erro) {
        console.error(erro);
    }
});

client.login(process.env.DISCORD_TOKEN);