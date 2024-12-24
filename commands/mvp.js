const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const { google } = require('googleapis');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { slot_e_tablo, SCOP, SERVİCES_FİLES, SAMPLE_ID, mvpKanalId } = require('../config/config.json');
const {mvp, mvp2 } = require('../config/tabloisim.json')

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SERVICE_ACCOUNT_FILE = '../config/keys.json';
const SAMPLE_SPREADSHEET_ID = '1W5k0S7HS6VkQIG_TG7D0ko3kuqHijo9f7MiAN0n-ZX8';
const veriler = 'MVP!B3:M22';
const auth = new google.auth.GoogleAuth({
    keyFile: SERVİCES_FİLES,
    scopes: SCOP,
});

async function getSpreadsheetData() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const [tumVeriResponse] = await Promise.all([
        sheets.spreadsheets.values.get({
            spreadsheetId: SAMPLE_ID,
            range: veriler,
        }),
    ]);

    const tumVeri = tumVeriResponse.data.values || [];

    const playerMap = new Map();

    tumVeri.forEach(entry => {
        const [ekipAdi, playerName, ...kills] = entry;
        const totalKills = kills.reduce((sum, kill) => sum + (parseFloat(kill) || 0), 0); // Tüm maçlardaki kill'leri topla
        if (playerMap.has(playerName)) {
            playerMap.get(playerName).totalKills += totalKills;
        } else {
            playerMap.set(playerName, { totalKills, ekipAdi });
        }
    });

    const combinedData = Array.from(playerMap, ([playerName, data]) => [playerName, data.totalKills, data.ekipAdi]);

    return combinedData;
}

function replaceTurkishCharacters(teamName) {
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

    return teamName.toLowerCase(); 
}

module.exports = {
    name: 'mvp',
    description: 'MVP tablosu çıkarır',
    async execute(message, args){
        const data = await getSpreadsheetData();
        console.log("DATA", data);

        data.sort((a, b) => b[1] - a[1]);

        const top3Data = data.slice(0, 3);

        const canvas = createCanvas(1920, 1080);
        const context = canvas.getContext('2d');

        const backgroundImagePath = args[0] === '2' ? `./Tablolar/${mvp2}` : `./Tablolar/${mvp}`;
        const backgroundImage = await loadImage(backgroundImagePath);

        context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        registerFont('./font/x.ttf', { family: 'American Captain' });
        context.fillStyle = 'black';
        context.font = '40px American Captain';

        let yOffset = 100;

        const files = fs.readdirSync('./Logolar').filter(file => file.endsWith('.png')).map(file => file.toLowerCase());

        for (let i = 0; i < top3Data.length; i++) {
            let playerName = replaceTurkishCharacters(top3Data[i][0]);
            let teamMahlasi = replaceTurkishCharacters(top3Data[i][2]);
            let totalKills = top3Data[i][1];

            let x = [922, 1410, 430];
            let y = [755, 755, 755];
            console.log("Ekip", teamMahlasi, "Oyuncu", playerName);

            if (files.includes(`${playerName}.png`)) {
                const logo = await loadImage(`./Logolar/${playerName}.png`);
                context.drawImage(logo, x[i] - 100, y[i] - 370, 310, 310);
            } else if (files.includes(`${teamMahlasi}.png`)) {
                const logo = await loadImage(`./Logolar/${teamMahlasi}.png`);
                context.drawImage(logo, x[i] - 100, y[i] - 370, 310, 310);
            } else {
                const logo = await loadImage(`./Logolar/default.png`);
                context.drawImage(logo, x[i] - 100, y[i] - 370, 310, 310);
            }

            context.font = '40px American Captain';
            context.fillText(`${top3Data[i][0]}`, x[i], y[i]); 
            context.font = '50px American Captain';
            context.fillText(`${totalKills}`, x[i], y[i] + 90);
            context.fillText(`Kill`, x[i] + 40, y[i] + 100);
            yOffset += 140;
        }

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'slot.png');
        const mes = await message.channel.send(attachment);
        await mes.react('✅');

          const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id;
          const collector = mes.createReactionCollector(filter, { time: 30000 });

          collector.on('collect', async (reaction, user) => {
              const channel = message.guild.channels.cache.get(mvpKanalId);
              if (channel) {
                  await channel.send(attachment);
                  message.channel.send('Embed başarıyla belirtilen kanala gönderildi.');
              } else {
                    message.channel.send('TİKE TIKLAMA SÜRENİZ BİTTİ.')
                  throw new Error('Belirtilen kanal bulunamadı.');
              }
          });
    }
};
