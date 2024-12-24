const Discord = require('discord.js');
const client = new Discord.Client();
const { SCOP, SERVİCES_FİLES, SAMPLE_ID, token, tik, davetli, live_e_tablo } = require('../config/config.json');
const { google } = require('googleapis');

const SCOPES = SCOP;
const SERVICE_ACCOUNT_FILE = SERVİCES_FİLES;
const SAMPLE_SPREADSHEET_ID = SAMPLE_ID;

const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES,
});

function cleanMessageContent(content) {
    return content.replace(/<@[!&]?(\d+)>/g, '') 
                  .replace(/<#(\d+)>/g, '')     
                  .replace(/<@&(\d+)>/g, '')    
                  .replace(/<:.*?:\d+>/g, '')   
                  .replace(/<@[^>]+>/g, '')     
                  .trim();                      
}

async function updateGun2TeamNames(contents) {
    try {
        const clientAuth = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: clientAuth });

        const reversedContents = contents.map(content => [content]);

        for (const range of live_e_tablo) {
            console.log(`Updating range: ${range}`);
            console.log('Contents to update:', reversedContents);

            const result = await sheets.spreadsheets.values.update({
                spreadsheetId: SAMPLE_SPREADSHEET_ID,
                range: range,
                valueInputOption: 'RAW',
                resource: {
                    values: reversedContents
                },
            });

            console.log(`Number of cells updated: ${result.data.updatedCells}`);
            if (result.data.updatedCells === 0) {
                console.error('Cells could not be updated. Please check the range and data correctness.');
            } else {
                console.log(`${result.data.updatedCells} cells successfully updated.`);
            }
        }
    } catch (error) {
        console.error('Google Sheets API Error:', error);
    }
}

module.exports = {
    name: 'pass',
    description: 'Slota ekipleri yazar',
    async execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('Yetkiniz yok.');
        }
        if (message.mentions.channels.size !== 1) {
            return message.reply('Lütfen bir kanal etiketleyiniz.');
        }

        const channel = message.mentions.channels.first();
        if (!args.length) {
            return message.reply('Lütfen bir rol etiketleyiniz.');
        }

        const role = message.mentions.roles.first();
        if (!role) {
            return message.reply('Rol bulunamadı.');
        }

        if (!message.guild.me.permissions.has('MANAGE_ROLES')) {
            return message.reply('Botun rol yönetme izni yok.');
        }

        try {
            const messages = await channel.messages.fetch();
            const davetliMessages = [];
            const tikMessages = [];

            for (const msg of messages.values()) {
                console.log(`Mesaj: ${msg.content}`);
                let containsDavetli = false;
                let containsTik = false;

                for (const reaction of msg.reactions.cache.values()) {
                    if (davetli.includes(reaction.emoji.name)) {
                        containsDavetli = true;
                    } else if (tik.includes(reaction.emoji.name)) {
                        containsTik = true;
                    }
                }

                if (containsDavetli) {
                    const cleanContent = cleanMessageContent(msg.content);
                    davetliMessages.push(cleanContent);
                    if (msg.member && msg.guild.me.roles.highest.comparePositionTo(role) > 0) {
                        await msg.member.roles.add(role).catch(err => {
                            console.error(`Rol atanırken hata (davetli): ${err}`);
                        });
                    } else {
                        console.error('Rol atanamadı: Botun rolü yeterince yüksek olmayabilir (davetli).');
                    }
                } else if (containsTik) {
                    const cleanContent = cleanMessageContent(msg.content);
                    tikMessages.push(cleanContent);

                    // Kullanıcıya rol atama işlemi burada yapılıyor
                    if (msg.mentions.users.size > 0) {
                        for (const user of msg.mentions.users.values()) {
                            const member = message.guild.members.cache.get(user.id);
                            if (member && msg.guild.me.roles.highest.comparePositionTo(role) > 0) {
                                await member.roles.add(role).catch(err => {
                                    console.error(`Rol atanırken hata (tik): ${err}`);
                                });
                            } else {
                                console.error('Rol atanamadı: Botun rolü yeterince yüksek olmayabilir (tik).');
                            }
                        }
                    } else {
                        // Mesaj sahibine rol atama
                        if (msg.member && msg.guild.me.roles.highest.comparePositionTo(role) > 0) {
                            await msg.member.roles.add(role).catch(err => {
                                console.error(`Rol atanırken hata (tik): ${err}`);
                            });
                        } else {
                            console.error('Rol atanamadı: Botun rolü yeterince yüksek olmayabilir (tik).');
                        }
                    }
                }
            }

            const contents = [...davetliMessages, ...tikMessages];

            if (contents.length > 0) {
                await updateGun2TeamNames(contents.reverse());
                message.channel.send('Başarıyla güncellendi.');
            } else {
                message.channel.send('Güncellenecek mesaj bulunamadı.');
            }
        } catch (error) {
            console.error('Hata:', error);
            message.channel.send('Bir hata oluştu!');
        }
    },
};

client.login(token).catch(console.error);
