const { MessageEmbed } = require('discord.js');
const config = require('../config/config.json')

module.exports = {
    name: 'check',
    description: 'Scrim kanalı oluşturur ve bilgi verir.',
    async execute(message, args, client, config) {
        const guild = message.guild;

        if (args.length !== 3) {
            return message.channel.send('Lütfen şu formatta bir argüman girin: `9 08 20:30`');
        }

        const timeParts = args[2].split(':');
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);

        const turkeyTime = new Date();
        turkeyTime.setHours(hour + 0); 
        turkeyTime.setMinutes(minute);

        const americaTime = new Date(turkeyTime);
        americaTime.setHours(turkeyTime.getHours() - 8);

        const germanyTime = new Date(turkeyTime);
        germanyTime.setHours(turkeyTime.getHours() - 1);

        const timeEmoji = '⏰'; 
        const kanalAdi = `${timeEmoji} ${args[0]}-${args[1]}-${args[2].replace(/:/g, '-')}`;

        guild.channels.create(kanalAdi, {
            type: 'text',
            topic: `${turkeyTime} Scrim`,
            permissionOverwrites: [
                {
                    id: guild.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                    deny: ['USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS']
                }
            ]
        }).then(async(channel) => {
            console.log('Başarılı');

            const embed = new MessageEmbed()
                .setTitle(`ELİTE ORGANİZATİON`)
                .setDescription(`
                    🏆 **Scrim and League ** 🏆
                    📍 **Turkey ${turkeyTime.getHours().toString().padStart(2, '0')}:${turkeyTime.getMinutes().toString().padStart(2, '0')}**
                    📍 **America ${americaTime.getHours().toString().padStart(2, '0')}:${americaTime.getMinutes().toString().padStart(2, '0')}**
                    📍 **Germany ${germanyTime.getHours().toString().padStart(2, '0')}:${germanyTime.getMinutes().toString().padStart(2, '0')}**

                    ⚠️ **Match: 4 matches will be played**
                    ⚠️ **Match: 4 Maç oynanacak**

                    🏆 **Erangel** 🏆 **Miramar**
                    🏆 **Erangel** 🏆 **Miramar**


                    **OYUN AYARLARI**
                    🔫 Mod: Üçüncü Şahıs (TPP)
                    🔫 Güvenli bölge 1 görüntüleme süresi 80s
                    🔫 Oyun Alanı Küçülme Hızı - x1,2
                    🔫 Oyun alanı hasarı - x1,2
                    🔫 Kırmızı Alan ve İşaret Fişeği - kapalı
                    🔫 Nişan yardımı - kapalı
                    🔫 Güvenli bölge 1 başlangıç zamanı - 240s
                    🔫 Tüm Silahlar - x2
                    🔫 Dürbün ve Mermiler - x2
                    👥 **25 Takım kabul edilecektir.**

                    👑 **Takımınızda 3 aynı Tag bulunmak zorundadır.**
                    👑 Your team must have the same 3 Tags. @everyone
                    🛑 Roster Atmak zorunludur Kayıt Yapıp Gelmeyen Takımlar Sınırsız Ban Yiyecektir.
                `)
                .setColor('#ff0000')
                .setTimestamp();

            await channel.send(embed);
        })
        .catch((e) => { 
            console.log('Hata', e);
            message.channel.send('Bir hata oluştu.'); 
        });
    }
};
