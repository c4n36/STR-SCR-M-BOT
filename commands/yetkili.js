const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const { google, compute_alpha } = require('googleapis');
const {SCOP, SERVİCES_FİLES, SAMPLE_ID, YetkiliroleId } = require('../config/config.json')
const { createCanvas, loadImage, registerFont } = require('canvas');




const SCOPES = SCOP;
const SERVICE_ACCOUNT_FILE = SERVİCES_FİLES;
const SAMPLE_SPREADSHEET_ID = SAMPLE_ID;

const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES,
});



function replaceTurkishCharacters(teamName) {
    if(!teamName) return;
    const turkishCharacters = {
        'ı': 'i',
        'İ': 'I',
        'ş': 's',
        'Ş': 'S',
        'ğ': 'g',
        'Ğ': 'G',
        'ü': 'u',
        'Ü': 'U',
        'ö': 'o',
        'Ö': 'O',
        'ç': 'c',
        'Ç': 'C',
    };

    return teamName.replace(/[ıİşŞğĞüÜöÖçÇ]/g, function (match) {
        return turkishCharacters[match];
    });
}


async function deleteChannelsEmbed(message, action, roleName) {
    const embed = new Discord.MessageEmbed()
        .setColor('#ff0000')
        .setTitle(`Kanal Silme İşlemi (${action})`)
        .setDescription(`\`${roleName}\` adında bir rol ve ona ait metin ve ses kanalları silindi.`)
        .addField('Rol Silindi', roleName)
        .addField('Metin Kanalı Silindi', roleName)
        .addField('Ses Kanalı Silindi', roleName)
        .setTimestamp()
        .setFooter(`İşlemi gerçekleştiren: ${message.author.tag}`, message.author.displayAvatarURL());

    return embed;
}

async function createCategory(guild, categoryName) {
    const category = await guild.channels.create(categoryName, {
        type: 'category'
    });
    return category;
}

module.exports = {
    name:'yetkili',
    description:'Sese yetkili çağırır.',
    async execute(message, args){
        
            const reason = args.join(' ');
            if (!reason) {
                message.reply('Lütfen bir sebep belirtin.');
                return;
            }
    
            
            const guild = message.guild;
            const role = guild.roles.cache.get(YetkiliroleId);
    
            if (!role) {
                message.reply('Yetkili rolü bulunamadı.');
                return;
            }
    
            const voiceChannel = message.member.voice.channel;
            if (!voiceChannel) {
                message.reply('Ses kanalında olmalısınız.');
                return;
            }
    
            const membersWithRole = role.members;
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Yetkili Bildirimi')
                .setDescription(`Bir yetkili bildirimi aldınız. ${voiceChannel}`)
                .addField('Sebep', reason)
                .addField('Gönderen', message.author.tag)
                .setTimestamp();
    
            const dmMessages = [];
            membersWithRole.each(async member => {
                try {
                    const dmMessage = await member.send(embed);
                    await dmMessage.react('✅');
                    dmMessages.push({ member, dmMessage });
                    console.log(`Yetkiliye bildirim gönderildi: ${member.user.tag}`);
                } catch (error) {
                    console.error(`DM gönderilemedi: ${member.user.tag}`, error);
                }
            });
    
            message.reply('Yetkililere bildirim gönderildi.');
    
            const filter = (reaction, user) => reaction.emoji.name === '✅' && !user.bot;
    
            client.on('messageReactionAdd', async (reaction, user) => {
                if (reaction.message.embeds[0] && reaction.message.embeds[0].title === 'Yetkili Bildirimi' && filter(reaction, user)) {
                    await user.send('Yardımı kabul ettiniz.');
                    dmMessages.forEach(async ({ member, dmMessage }) => {
                        if (dmMessage.id === reaction.message.id && member.user.id !== user.id) {
                            try {
                                await dmMessage.delete();
                                console.log(`Silinen mesaj: ${dmMessage.id} - ${member.user.tag}`);
                            } catch (error) {
                                console.error(`Mesaj silinemedi: ${dmMessage.id} - ${member.user.tag}`, error);
                            }
                        }
                    });
                    console.log(`Yardımı kabul eden: ${user.tag}`);
                }
            });
    
            return;
        
    }
}