// src/config.js
module.exports = {
    setores: [
        // Privados
        { nome: 'Administrativo', privado: true, emoji: '🛡️' },
        { nome: 'T.I', privado: true, emoji: '💻' },

        // Públicos
        { nome: 'Produção', privado: false, emoji: '🏭' },
        { nome: 'Financeiro', privado: false, emoji: '💰' },
        { nome: 'Atendimento', privado: false, emoji: '🎧' },
        { nome: 'Prospecção', privado: false, emoji: '📈' }
    ]
};