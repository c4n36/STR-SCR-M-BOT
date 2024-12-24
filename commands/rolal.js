module.exports = {
    name: 'rolal',
    description: 'Belirtilen rolü alır',
    async execute(message, args) {
        const roleMention = args[0];

        if (!roleMention || !roleMention.startsWith('<@&') || !roleMention.endsWith('>')) {
            return message.reply('Geçerli bir rol etiketi belirtmelisiniz. Örnek kullanım: `!rolal @rol`.');
        }

        const roleId = roleMention.slice(3, -1);
        const role = message.guild.roles.cache.get(roleId);

        if (!role) {
            return message.reply('Belirtilen rol bulunamadı.');
        }

        const membersWithRole = role.members;
        membersWithRole.forEach(member => {
            member.roles.remove(role).catch(error => {
                console.error(`Rolü kaldırırken hata oluştu: ${error}`);
            });
        });

        message.reply(`Belirtilen rolü ${membersWithRole.size} kullanıcının üzerinden aldım.`);
    }
};
