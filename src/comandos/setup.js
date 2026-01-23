// src/comandos/setup.js
const { ChannelType, PermissionsBitField } = require('discord.js');
const { setores } = require('../config');

async function setupEmpresa(message) {
    const guild = message.guild;

    message.reply('🎨 Atualizando servidor com novos visuais e ícones...');

    for (const setor of setores) {
        try {
            // Definição dos nomes com Emojis
            const nomeCargo = `${setor.emoji} ${setor.nome}`;
            const nomeCategoria = `${setor.emoji} ┃ ${setor.nome}`;

            // O Discord não aceita espaços ou maiúsculas em canais de texto, nem todos os emojis.
            // Vamos usar um padrão limpo com bolinha (・)
            const nomeSimples = setor.nome.toLowerCase().replace(/[^a-z0-9]/g, '');
            const nomeTexto = `💬・chat-${nomeSimples}`;
            const nomeVoz = `🔊・Voz ${setor.nome}`;

            let role = null;

            // --- PASSO 1: CARGO (Apenas se for privado) ---
            if (setor.privado) {
                // Busca pelo nome novo (com emoji)
                role = guild.roles.cache.find(r => r.name === nomeCargo);

                if (!role) {
                    role = await guild.roles.create({
                        name: nomeCargo,
                        reason: 'Cargo automático',
                        // Opcional: Podes definir cores aqui se quiseres depois
                    });
                    console.log(`[+] Cargo criado: ${nomeCargo}`);
                }
            }

            // --- PERMISSÕES ---
            const permissoes = [];

            // Bot sempre admin
            permissoes.push({
                id: message.client.user.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels]
            });

            if (setor.privado && role) {
                // Privado: Bloqueia Everyone, Libera Cargo com Emoji
                permissoes.push({
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                });
                permissoes.push({
                    id: role.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.Connect]
                });
            } else {
                // Público: Libera Everyone
                permissoes.push({
                    id: guild.id,
                    allow: [PermissionsBitField.Flags.ViewChannel]
                });
            }

            // --- PASSO 2: CATEGORIA ---
            let categoria = guild.channels.cache.find(c => c.name === nomeCategoria && c.type === ChannelType.GuildCategory);

            if (!categoria) {
                categoria = await guild.channels.create({
                    name: nomeCategoria,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: permissoes,
                    reason: 'Estrutura com Emoji'
                });
                console.log(`[+] Categoria criada: ${nomeCategoria}`);
            }

            // --- PASSO 3: CANAL DE TEXTO ---
            // Verifica se existe canal com esse nome DENTRO da categoria
            const canalTexto = guild.channels.cache.find(c => c.name === nomeTexto && c.parentId === categoria.id);

            if (!canalTexto) {
                await guild.channels.create({
                    name: nomeTexto,
                    type: ChannelType.GuildText,
                    parent: categoria.id
                });
            }

            // --- PASSO 4: CANAL DE VOZ ---
            const canalVoz = guild.channels.cache.find(c => c.name === nomeVoz && c.parentId === categoria.id);

            if (!canalVoz) {
                await guild.channels.create({
                    name: nomeVoz,
                    type: ChannelType.GuildVoice,
                    parent: categoria.id
                });
            }

        } catch (erro) {
            console.error(`Erro no setor ${setor.nome}:`, erro);
        }
    }

    message.channel.send('✅ **Estética Aplicada!** Setores organizados com ícones.');
}

module.exports = { setupEmpresa };