// src/comandos/updates.js
const {
    EmbedBuilder,
    ChannelType,
    PermissionsBitField
} = require('discord.js');

const NOME_CANAL_UPDATES = '📢・updates';

async function garantirCanalUpdates(guild) {
    let canal = guild.channels.cache.find(c => c.name === NOME_CANAL_UPDATES);

    if (!canal) {
        const cargoTI = guild.roles.cache.find(r => r.name.includes('T.I'));

        const permissoes = [
            { id: guild.id, deny: [PermissionsBitField.Flags.SendMessages], allow: [PermissionsBitField.Flags.ViewChannel] },
            { id: guild.client.user.id, allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel] }
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

async function publicarUpdate(message) {
    const args = message.content.split('\n');

    // 1. Captura Inteligente do Título
    // Pega tudo que vem depois de "!update" na primeira linha
    const primeiraLinha = args[0];
    const tituloPersonalizado = primeiraLinha.replace('!update', '').trim();

    if (!tituloPersonalizado) {
        return message.reply('❌ Digite o título/versão após o comando. Ex: `!update v1.0 - Correções`');
    }

    let corpo = args.slice(1).join('\n');
    if (!corpo) return message.reply('❌ O update precisa de conteúdo nas linhas abaixo.');

    // 2. Formatação Profissional (Mapeamento de Símbolos)
    const corpoFormatado = corpo
        .split('\n')
        .map(linha => {
            const texto = linha.trim();

            // Novos Recursos (+)
            if (texto.startsWith('+')) return `🆕 ${texto.substring(1).trim()}`;

            // Melhorias/Otimizações (~)
            if (texto.startsWith('~')) return `⚡ ${texto.substring(1).trim()}`;

            // Correções/Remoções (-)
            if (texto.startsWith('-')) return `🐞 ${texto.substring(1).trim()}`; // Mudei para Joaninha (Bug fix)

            // Se for um título de seção (termina com : ou tem parênteses), deixa em Negrito
            if (texto.length > 0 && (texto.endsWith(':') || texto.includes('('))) {
                return `\n**${texto}**`; // Adiciona quebra de linha antes para separar
            }

            return linha;
        })
        .join('\n');

    // 3. Criar o Embed
    const embedUpdate = new EmbedBuilder()
        .setColor(0x2ECC71) // Verde Esmeralda
        .setTitle(`🚀 Update Log: ${tituloPersonalizado}`) // Usa o teu título completo
        .setDescription(corpoFormatado)
        .setThumbnail(message.guild.iconURL())
        .setFooter({ text: `Publicado por ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

    try {
        const canalUpdates = await garantirCanalUpdates(message.guild);
        await canalUpdates.send({ embeds: [embedUpdate] });

        // Feedback silencioso (emoji na mensagem original)
        await message.react('✅');
    } catch (erro) {
        console.error(erro);
        message.reply('Houve um erro ao publicar o update.');
    }
}

module.exports = { publicarUpdate };