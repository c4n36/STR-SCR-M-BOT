const fs = require('fs');
const path = require('path');
const configPath = path.resolve(__dirname, '../config/config.json');
const config = require('../config/config.json');

module.exports = {
    name: 'tik',
    description: 'tik emojisi ekler.',
    async execute(message, args) {
        if (!args.length) {
            return message.channel.send('Lütfen bir emoji koyun veya sunucuya emojiyi ekleyip emoji ismini yazın.');
        }

        let emojiname = args[0].replace(/:/g, '');

        const emojiMatch = emojiname.match(/^<.*?:(.*?):\d+>$/);
        if (emojiMatch) {
            emojiname = emojiMatch[1];
        }

        const emoji = message.guild.emojis.cache.find(e => e.name === emojiname || e.toString() === emojiname);
        console.log(emojiname)
        if (emoji) {
            emojiname = emoji.name;
        } else {
            return message.channel.send('Belirtilen emoji sunucuda bulunamadı.');
        }

        config.tik.push(emojiname);

        function yaz() {
            fs.writeFile(configPath, JSON.stringify(config, null, 2), async (err) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        console.log('Dosya bulunamadı. Yeniden denenecek...');
                        return setTimeout(yaz, 1000); 
                    } else if (err.code === 'EEXIST') {
                        console.log('Dosya zaten var. Yeniden denenecek...');
                        return setTimeout(yaz, 1000);
                    } else {
                        console.error(err);
                        return message.channel.send('Sanırım bir hata oluştu.');
                    }
                }
                console.log('Başarıyla güncellendi.');
                message.channel.send(`Başarıyla güncellendi: ${emojiname}`);
            });
        }

        yaz();
    }
};
