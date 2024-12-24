const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const fetch = require('node-fetch');
const config = require('./config/config.json');
const { token, prefix, logokanalId, botkullanım } = config;

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    console.log(`Komut yüklendi: ${command.name}`); // Komut yüklenmesini kontrol edin
}

const cooldowns = {};

client.once('ready', async () => {
    console.log('Bot is ready');

    const guild = client.guilds.cache.first();
    if (!guild) {
        console.error('Sunucu bulunamadı!');
        return;
    }

    let category = guild.channels.cache.find(c => c.type === 'category' && c.name === 'batnetpanel');
    
    if (!category) {
        try {
            category = await guild.channels.create('batnetpanel', {
                type: 'category',
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: ['VIEW_CHANNEL'],
                    }
                ]
            });
            console.log('Kategori oluşturuldu: batnetpanel');
        } catch (error) {
            console.error('Kategoriyi oluştururken bir hata oluştu:', error);
        }
    } else {
        console.log('Kategori zaten mevcut: batnetpanel');
    }

    let kanal = client.channels.cache.get(botkullanım);
    if (kanal) {
        kanal.send('Çevrim içiyim.');
    } else {
        console.error('Belirtilen kanal bulunamadı.');
    }

    client.user.setPresence({
        activity: {
            name: 'alican',
            type: 'PLAYING'
        },
        status: 'dnd'
    });
});

client.on('message', async (message) => {
    if (message.author.bot) return;

    if (message.channel.type === 'dm') {
        await handleDM(message);
        return;
    }

    if (message.channel.id === logokanalId && message.attachments.size > 0) {
        await handleLogoUpload(message);
        return;
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    // İzin kontrollerini kaldırmak veya düzenlemek için aşağıdaki kısmı değiştirin
    if (commandName !== 'yetkili' && message.channel.id !== botkullanım) {
        if (commandName !== 'ekiprolu') {
            return;
        }
    }

    const now = Date.now();
    const cooldownAmount = commandName === 'yetkili' ? 15 * 1000 : 10 * 1000;

    if (cooldowns[message.author.id] && cooldowns[message.author.id][commandName] && now < cooldowns[message.author.id][commandName] + cooldownAmount) {
        const timeLeft = (cooldowns[message.author.id][commandName] + cooldownAmount - now) / 1000;
        return message.reply(`Komutu kullanabilmek için ${timeLeft.toFixed(1)} saniye beklemelisiniz.`);
    }

    if (!cooldowns[message.author.id]) {
        cooldowns[message.author.id] = {};
    }
    cooldowns[message.author.id][commandName] = now;

    try {
        console.log(`Komut çalıştırılıyor: ${commandName}`); // Hata ayıklamak için eklendi
        await command.execute(message, args, client);
    } catch (error) {
        console.error(`Komut çalıştırma hatası: ${error.message}`); // Gelişmiş hata mesajı
        message.reply('Komutu çalıştırmaya çalışırken bir hata oluştu!');
    }
});

async function handleDM(message) {
    const guild = client.guilds.cache.first();
    if (!guild) {
        console.error('Sunucu bulunamadı!');
        return;
    }

    let category = guild.channels.cache.find(c => c.type === 'category' && c.name === 'batnetpanel');
    if (!category) {
        console.error('Kategori bulunamadı!');
        return;
    }

    const username = message.author.username;
    let channel = guild.channels.cache.find(c => c.type === 'text' && c.name === username.toLowerCase().replace(/\s+/g, '-'));
    
    if (!channel) {
        try {
            channel = await guild.channels.create(username.toLowerCase().replace(/\s+/g, '-'), {
                type: 'text',
                parent: category.id,
                topic: `${username}`,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: ['VIEW_CHANNEL'],
                    },
                    {
                        id: message.author.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                    }
                ]
            });
            console.log(`Kanal oluşturuldu: ${username}`);
        } catch (error) {
            console.error('Kanal oluşturulurken bir hata oluştu:', error);
            return;
        }
    }

    await channel.send(`${username}: ${message.content}`);

    client.on('message', async (replyMessage) => {
        if (replyMessage.channel.id === channel.id && !replyMessage.author.bot) {
            try {
                await message.author.send(`${channel.name}: ${replyMessage.content}`);
            } catch (error) {
                console.error('Mesaj gönderme hatası:', error);
            }
        }
    });
}

async function handleLogoUpload(message) {
    const attachment = message.attachments.first();
    const imageURL = attachment.url;
    const savePath = './Logolar';
    const fileExtension = attachment.name.split('.').pop().toLowerCase();
    const fileName = `${savePath}/${message.content}.png`;

    if (message.content === "") {
        return await message.reply({ content: 'Hey ekip ismini yazman lazım!', ephemeral: true });
    }

    try {
        if (fs.existsSync(fileName)) {
            const filter = (reaction, user) => user.id === message.author.id && (reaction.emoji.name === '✅' || reaction.emoji.name === '❌');
            const options = { max: 1, time: 60000, errors: ['time'] };

            const sentMessage = await message.reply(`**${message.content}** isimli ekip zaten var. Değiştirmek istiyor musunuz? ✅ veya ❌ emojilerine basarak cevap veriniz.`);
            await sentMessage.react('✅');
            await sentMessage.react('❌');

            const reactions = await sentMessage.awaitReactions(filter, options);
            const reaction = reactions.first();

            if (reaction.emoji.name === '✅') {
                fs.unlinkSync(fileName);
                await saveImage(imageURL, fileName);
                message.reply(`**${message.content}** adlı ekibin logosu değiştirildi.`);
            } else {
                message.reply(`Ekip ismi "${message.content}" ile ilgili dosya değiştirilmedi.`);
            }
        } else {
            await saveImage(imageURL, fileName);
            message.reply(`Resim başarıyla kaydedildi.`);
        }
    } catch (error) {
        console.error('Resim kaydetme hatası:', error);
        message.reply('Resim kaydetme sırasında bir hata oluştu.');
    }
}

async function saveImage(url, path) {
    const response = await fetch(url);
    const buffer = await response.buffer();
    fs.writeFileSync(path, buffer);
}

client.login(token);
