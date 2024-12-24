const fs = require('fs');
const path = require('path');
const configPath = path.resolve(__dirname, '../config/config.json');
const config = require('../config/config.json');

module.exports = {
    name: 'davetli',
    description: 'Davetli emojisi ekler.',
    async execute(message, args) {
        if (!args.length) {
            return message.channel.send('Lütfen bir emoji koyun veya sunucuya emojiyi ekleyip emoji ismini yazın.');
        }

        let emojiname = args[0];
        config.davetli.push(emojiname);

        function yaz() {
            fs.writeFile(configPath, JSON.stringify(config, null, 2), async (err) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        console.log('Dosya bulunamadı. Yeniden denenecek...');
                        return setTimeout(writeFile, 1000); 
                    } else if (err.code === 'EEXIST') {
                        console.log('Dosya zaten var. Yeniden denenecek...');
                        return setTimeout(writeFile, 1000);
                    } else {
                        console.error(err);
                        return message.channel.send('Sanırım bir hata oluştu.');
                    }
                }
                console.log('Başarıyla güncellendi.');
                message.channel.send(`Başarıyla güncellendi. ${emojiname}`);
            });
        }

        yaz();
    }
};
