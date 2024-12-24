const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'yardım',
    description: 'Mevcut tüm komutları ve açıklamalarını listeler.',
    async execute(message, args, client) {
        const embed = new MessageEmbed()
            .setTitle('⚔️ Komutlar Rehberi ⚔️')
            .setDescription('Bu kutsal liste, botun sahip olduğu tüm güçleri, yani komutları size sunar. Kullanmaya cesaretin var mı?')
            .setColor('#FFD700') 
            .setThumbnail(message.guild.iconURL({ dynamic: true })) 
            .setFooter(
                `Bu botun gücünü kullanmak senin elinde, ${message.author.username}!`,
                message.author.displayAvatarURL({ dynamic: true })
            )
            .setTimestamp();

        client.commands.forEach((command) => {
            embed.addField(`**🔹 !${command.name}**`, command.description, false);
        });

        message.channel.send(embed);
    }
};
