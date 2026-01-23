// src/comandos/ticket.js
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField,
    EmbedBuilder // Importamos o construtor de Embeds
} = require('discord.js');

// --- Função 1: Enviar o Painel Bonito ---
async function enviarPainel(message) {
    // 1. Criar o Embed (O cartão visual)
    const embedPainel = new EmbedBuilder()
        .setColor(0x0099FF) // Cor azul (hexadecimal)
        .setTitle('🏢 Central de Atendimento')
        .setDescription(`Olá! Seja bem-vindo ao suporte da **${message.guild.name}**.\n\nPara iniciar um atendimento privado com a nossa equipe, clique no botão abaixo.`)
        .addFields(
            { name: '🕒 Horário de Atendimento', value: 'Segunda a Sexta, das 08h às 18h', inline: false },
            { name: '🔒 Privacidade', value: 'O canal criado será visível apenas para si e para a administração.', inline: false }
        )
        .setFooter({ text: 'Sistema Automático de Tickets' });

    // 2. Criar o Botão
    const botaoTicket = new ButtonBuilder()
        .setCustomId('abrir_ticket')
        .setLabel('Abrir Ticket')
        .setStyle(ButtonStyle.Primary) // Azul
        .setEmoji('🎫');

    const row = new ActionRowBuilder().addComponents(botaoTicket);

    // 3. Enviar a mensagem com Embed e Botão
    await message.channel.send({
        embeds: [embedPainel],
        components: [row]
    });
}

// --- Função 2: Criar o Canal e o Botão de Fechar ---
async function abrirTicket(interaction) {
    // Verifica se já existe ticket para este usuário
    const nomeCanal = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    const canalExiste = interaction.guild.channels.cache.find(c => c.name === nomeCanal);

    if (canalExiste) {
        return interaction.reply({ content: `❌ Você já possui um ticket aberto: ${canalExiste}`, ephemeral: true });
    }

    // Cria o canal
    const canalTicket = await interaction.guild.channels.create({
        name: `🎫・${nomeCanal}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, // Ninguém vê
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }, // Usuário vê
            { id: interaction.client.user.id, allow: [PermissionsBitField.Flags.ViewChannel] } // Bot vê
            // DICA: Se quiseres que o cargo T.I ou ADM veja automaticamente, adiciona aqui.
        ]
    });

    await interaction.reply({ content: `✅ Ticket criado: ${canalTicket}`, ephemeral: true });

    // --- DENTRO DO NOVO TICKET ---

    // 1. Embed de Boas-vindas
    const embedTicket = new EmbedBuilder()
        .setColor(0x2B2D31) // Cinza escuro
        .setTitle(`Ticket de ${interaction.user.username}`)
        .setDescription('Descreva o seu problema ou solicitação aqui.\nA equipe responderá assim que possível.')
        .setTimestamp();

    // 2. Botão de Fechar (Vermelho)
    const botaoFechar = new ButtonBuilder()
        .setCustomId('fechar_ticket')
        .setLabel('Encerrar Atendimento')
        .setStyle(ButtonStyle.Danger) // Vermelho
        .setEmoji('🔒');

    const row = new ActionRowBuilder().addComponents(botaoFechar);

    await canalTicket.send({
        content: `Olá ${interaction.user} 👋`,
        embeds: [embedTicket],
        components: [row]
    });
}

// --- Função 3: Fechar o Ticket ---
async function fecharTicket(interaction) {
    // Confirmação simples
    await interaction.reply({ content: '🔒 Fechando ticket em 5 segundos...' });

    setTimeout(() => {
        // Verifica se o canal ainda existe antes de tentar apagar
        if (interaction.channel) {
            interaction.channel.delete();
        }
    }, 5000); // Espera 5000 milissegundos (5 segundos)
}

module.exports = { enviarPainel, abrirTicket, fecharTicket };