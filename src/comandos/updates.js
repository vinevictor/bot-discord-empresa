// src/comandos/updates.js
const {
    EmbedBuilder,
    ChannelType,
    PermissionsBitField
} = require('discord.js');

// Configuração do nome do canal
const NOME_CANAL_UPDATES = '📢・updates';

// --- Função 1: Garantir que o canal existe com as permissões certas ---
async function garantirCanalUpdates(guild) {
    let canal = guild.channels.cache.find(c => c.name === NOME_CANAL_UPDATES);

    if (!canal) {
        // Procura o cargo T.I para dar permissão
        const cargoTI = guild.roles.cache.find(r => r.name.includes('T.I'));

        const permissoes = [
            {
                id: guild.id, // @everyone
                deny: [PermissionsBitField.Flags.SendMessages], // Ninguém escreve
                allow: [PermissionsBitField.Flags.ViewChannel]  // Todos veem
            },
            {
                id: guild.client.user.id, // O Bot
                allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel]
            }
        ];

        // Se o cargo T.I existir, deixa eles escreverem também
        if (cargoTI) {
            permissoes.push({
                id: cargoTI.id,
                allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel]
            });
        }

        canal = await guild.channels.create({
            name: NOME_CANAL_UPDATES,
            type: ChannelType.GuildText,
            permissionOverwrites: permissoes,
            reason: 'Canal de Updates do Sistema'
        });

        console.log(`[+] Canal de Updates criado: ${canal.name}`);
    }
    return canal;
}

// --- Função 2: O Comando !update ---
async function publicarUpdate(message) {
    // 1. Limpeza e Validação
    // O comando esperado é: !update v1.0 [enter] - texto [enter] - texto
    const args = message.content.split('\n'); // Divide por linha
    const linhaComando = args[0].split(' '); // Pega a primeira linha (!update v1.0)

    // Verifica se tem versão
    if (linhaComando.length < 2) {
        return message.reply('❌ Formato inválido.\nUse: `!update <Versão>` na primeira linha e os itens nas linhas de baixo.');
    }

    const versao = linhaComando[1]; // Ex: v1.5

    // Pega o corpo da mensagem (tudo menos a primeira linha)
    let corpo = args.slice(1).join('\n');

    if (!corpo) {
        return message.reply('❌ Você precisa escrever o que mudou nas linhas abaixo da versão.');
    }

    // 2. Formatação Profissional
    // Substitui o traço simples "-" por um emoji bonito se estiver no começo da linha
    const corpoFormatado = corpo
        .split('\n')
        .map(linha => {
            if (linha.trim().startsWith('-')) {
                return `🛠️ ${linha.replace('-', '').trim()}`; // Troca - por ferramenta
            }
            if (linha.trim().startsWith('+')) {
                return `🆕 ${linha.replace('+', '').trim()}`; // Troca + por New
            }
            return linha;
        })
        .join('\n');

    // 3. Criar o Embed (Cartão)
    const embedUpdate = new EmbedBuilder()
        .setColor(0x00FF00) // Verde Matrix
        .setTitle(`🚀 Atualização do Sistema | Versão ${versao}`)
        .setDescription(corpoFormatado)
        .setThumbnail(message.guild.iconURL()) // Põe o logo do servidor se tiver
        .addFields(
            { name: '📅 Data', value: new Date().toLocaleDateString('pt-BR'), inline: true },
            { name: '👨‍💻 Responsável', value: `${message.author}`, inline: true }
        )
        .setFooter({ text: 'Sistema de Changelog Automático' });

    // 4. Enviar
    try {
        const canalUpdates = await garantirCanalUpdates(message.guild);
        await canalUpdates.send({ embeds: [embedUpdate] });

        // Avisa quem mandou que deu certo e apaga a mensagem original para não sujar
        await message.reply({ content: `✅ Update publicado em ${canalUpdates}!`, ephemeral: true });
        // message.delete().catch(() => {}); // Opcional: apaga o comando do usuário
    } catch (erro) {
        console.error(erro);
        message.reply('Houve um erro ao publicar o update.');
    }
}

module.exports = { publicarUpdate };