const fs = require('fs');
const path = require('path');
const configPath = path.resolve(__dirname, '../config/config.json');
const config = require('../config/config.json');

module.exports = {
    name: 'yayıncı',
    description: 'Yayıncı id sini alır',
    async execute(message, args) {
        if (!args.length) {
            return message.channel.send('Lütfen bir kullanıcı ID\'si sağlayın.');
        }

        const yayıncıId = args[0];
        config.yayıncıId = yayıncıId;

        
        fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
            if (err) {
                console.error(err);
                return message.channel.send('Yayıncı ID kaydedilirken bir hata oluştu.');
            }
            console.log('Yayıncı ID başarıyla güncellendi.');
        });

        try {
            const yayıncı = await message.guild.members.fetch(yayıncıId);
            message.channel.send(`Yayıncı: ${yayıncı.user.tag}`);
            const person = await message.guild.members.fetch(message.author.id)
            yayıncı.send(`${person.user.tag} Kişisi sizi yayıncı olarak seçti.`)
        } catch (error) {
            console.error(error);
            message.channel.send('Kullanıcı bulunamadı veya bir hata oluştu.');
        }
    }
};
