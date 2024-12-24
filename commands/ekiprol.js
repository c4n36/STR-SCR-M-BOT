const fs = require('fs').promises;
const { google } = require('googleapis');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { mvp_tablo, SCOP, SERVİCES_FİLES, SAMPLE_ID, teamRoles } = require('../config/config.json')
const Discord = require('discord.js');

const auth = new google.auth.GoogleAuth({
    keyFile: SERVİCES_FİLES,
    scopes: SCOP,
});

async function getSpreadsheetData() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const [tumVeriResponse] = await Promise.all([
        sheets.spreadsheets.values.batchGet({
            spreadsheetId: SAMPLE_ID,
            ranges: mvp_tablo,
        }),
    ]);

    const combinedData = [];
    tumVeriResponse.data.valueRanges.forEach((range) => {
        const values = range.values || [];
        values.forEach((entry) => {
            combinedData.push(entry);
        });
    });

    return combinedData;
}

function replaceTurkishCharacters(teamName) {
    if (!teamName) return '';
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

    teamName = teamName.replace(/[ıİşŞğĞüÜöÖçÇ]/g, function (match) {
        return turkishCharacters[match];
    });

    return teamName;
}

module.exports = {
    name: 'ekiprolu',
    description: 'Etiketlenen üyeye ekibinin rolunu verir.',
    async execute(message, args) {
        const mentionedUser = message.mentions.users.first();
        if (!mentionedUser) {
            message.reply('Lütfen bir kullanıcıyı etiketleyin.');
            return;
        }
        const mentionedMember = message.guild.member(mentionedUser);
        if (!mentionedMember) {
            message.reply('Etiketlediğiniz kullanıcı bu sunucuda bulunmuyor.');
            return;
        }
        const channelName = message.channel.name.toUpperCase().replace(/\s/g, '-');
        const roleToGive = message.guild.roles.cache.find(role => replaceTurkishCharacters(role.name.toUpperCase()).replace(/\s/g, '-') === channelName);
        if (!roleToGive) {
            message.reply('Kanalınıza karşılık gelen bir rol bulunamadı.');
            return;
        }
    
        try {
            await mentionedMember.roles.add(roleToGive);
            message.reply(`${mentionedMember} kullanıcısına ${roleToGive.name} rolü verildi.`);
        } catch (error) {
            console.error('Rol verme işlemi başarısız:', error);
            message.reply('Rol verme işlemi başarısız oldu.');
        }
    },
};
