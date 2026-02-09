// src/comandos/updates.js
const {
    EmbedBuilder,
    ChannelType,
    PermissionsBitField
} = require('discord.js');

const NOME_CANAL_UPDATES = '📢・updates';

// --- Função para criar/buscar o canal ---
async function garantirCanalUpdates(guild) {
    let canal = guild.channels.cache.find(c => c.name === NOME_CANAL_UPDATES);

    if (!canal) {
        const cargoTI = guild.roles.cache.find(r => r.name.includes('T.I'));

        const permissoes = [
            { id: guild.id, deny: [PermissionsBitField.Flags.SendMessages], allow: [PermissionsBitField.Flags.ViewChannel] }, // Ninguém fala
            { id: guild.client.user.id, allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel] } // Bot fala
        ];

        if (cargoTI) {
            permissoes.push({ id: cargoTI.id, allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel] });
        }

        canal = await guild.channels.create({
            name: NOME_CANAL_UPDATES,
            type: ChannelType.GuildText,
            permissionOverwrites: permissoes
        });
    }
    return canal;
}

// --- Função Principal ---
async function publicarUpdate(message) {
    const args = message.content.split('\n');
    const primeiraLinha = args[0];
    const tituloPersonalizado = primeiraLinha.replace('!update', '').trim();

    if (!tituloPersonalizado) {
        return message.reply('❌ Digite o título após o comando. Ex: `!update v1.0 - Correções`');
    }

    let corpo = args.slice(1).join('\n');
    if (!corpo) return message.reply('❌ O update precisa de conteúdo nas linhas abaixo.');

    // --- Formatação Inteligente ---
    const corpoFormatado = corpo
        .split('\n')
        .map(linha => {
            const texto = linha.trim();
            if (texto.startsWith('+')) return `🆕 ${texto.substring(1).trim()}`;
            if (texto.startsWith('~')) return `⚡ ${texto.substring(1).trim()}`;
            if (texto.startsWith('-')) return `🐞 ${texto.substring(1).trim()}`;
            if (texto.length > 0 && (texto.endsWith(':') || texto.includes('('))) {
                return `\n**${texto}**`;
            }
            return linha;
        })
        .join('\n');

    // --- Criação do Embed ---
    const embedUpdate = new EmbedBuilder()
        .setColor(0x2ECC71) // Verde Esmeralda
        .setTitle(`🚀 Update Log: ${tituloPersonalizado}`)
        .setDescription(corpoFormatado)
        .setThumbnail(message.guild.iconURL())
        .setFooter({ text: `Publicado por ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

    try {
        const canalUpdates = await garantirCanalUpdates(message.guild);

        // --- ENVIO DA MENSAGEM ---
        // Aqui está a mudança: content tem o @everyone, embeds tem o cartão
        const mensagemEnviada = await canalUpdates.send({
            content: '📢 **Atenção** @everyone, nova atualização do sistema!',
            embeds: [embedUpdate]
        });

        // --- REAÇÕES AUTOMÁTICAS ---
        await mensagemEnviada.react('🚀'); // Foguetinho
        await mensagemEnviada.react('🔥'); // Foguinho (Opcional, dá um charme)

        // Feedback para quem mandou o comando
        await message.react('✅');

    } catch (erro) {
        console.error(erro);
        message.reply('Houve um erro ao publicar o update. Verifique se tenho permissão para mencionar everyone.');
    }
}

module.exports = { publicarUpdate };