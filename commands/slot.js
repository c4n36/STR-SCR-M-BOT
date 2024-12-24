const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const { google } = require('googleapis');
const { yantablo, yantablo2, live, live2, result, result2, mvp, mvp2, slot, slot2, win } = require('../config/tabloisim.json');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { slot_e_tablo, SCOP, SERVİCES_FİLES, SAMPLE_ID, slotKanalId } = require('../config/config.json');
const { slotX, slotY, SlotlogonunIsimdenUzakliğiX, SlotlogonunIsimdenUzakliğiY, SlotlogoBuyuklugu } = require('../config/kordinat.json');
const { Collection } = require('discord.js');
const { Collector } = require('discord.js');

const SCOPES = SCOP;
const SERVICE_ACCOUNT_FILE = SERVİCES_FİLES;
const SAMPLE_SPREADSHEET_ID = SAMPLE_ID;

const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES,
});

async function someEventHandler() {
    try {
      const client = await auth.getClient(); 
      const sheets = google.sheets({ version: 'v4', auth: client }); 
  
      const promises = slot_e_tablo.map(range => sheets.spreadsheets.values.get({
        spreadsheetId: SAMPLE_SPREADSHEET_ID,
        range: range,
      }));
  
    
      const responses = await Promise.all(promises);
  
      
      const allData = responses.reduce((acc, response) => {
        const data = response.data.values || [];
        return acc.concat(data);
      }, []);
  
      
      return allData;
    } catch (error) {
      
      console.log('Data retrieval failed:', error);
      throw error; 
    }
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

    return teamName.replace(/[ıİşŞğĞüÜöÖçÇ]/g, function (match) {
        return turkishCharacters[match];
    });
}

module.exports = {
    name: 'slot',
    description: 'Slot tablosu oluşturur.',
    async execute(message, args) {
        var data = await someEventHandler();
        console.log(data);
        const canvas = createCanvas(1760, 990);
        const context = canvas.getContext('2d');
        const backgroundImagePath = args[0] === '2' ? `./Tablolar/${slot2}` : `./Tablolar/${slot}`;

        const backgroundImage = await loadImage(backgroundImagePath);

        context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        registerFont('./font/x.ttf', { family: 'American Captain' });
        context.fillStyle = 'white';
        context.font = '30px American Captain';

        for (let i = 0; i < data.length; i++) {
            if (data[i] && data[i][0]) {
                let ekipler = replaceTurkishCharacters(data[i][0]);
                ekipler = ekipler.toLowerCase();
                console.log(ekipler);
                context.fillText(ekipler, slotX[i], slotY[i], 200, 200);
                const files = fs.readdirSync('./Logolar').map(file => file.toLowerCase()).filter(file => file.endsWith('.png'));
                console.log(files);
                const logoFileName = `${ekipler}.png`;
                if (files.includes(logoFileName)) {
                    const logo = await loadImage(`./Logolar/${logoFileName}`);
                    context.drawImage(logo, slotX[i] - SlotlogonunIsimdenUzakliğiX, slotY[i] - SlotlogonunIsimdenUzakliğiY, SlotlogoBuyuklugu[0], SlotlogoBuyuklugu[1]);
                }
            }
        }

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'slot.png');
        const mes = await message.channel.send({ files: [attachment] });

        
        await mes.react('✅');

        const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id;
        const collector = mes.createReactionCollector(filter);

        collector.on('collect', async (reaction, user) => {
            const channel = message.guild.channels.cache.get(slotKanalId);
            try {
                if (channel) {
                    await channel.send({ files: [attachment] });
                } else {
                    await message.channel.send('Bir hata oluştu!');
                }
            } catch (e) {
                console.log(e);
                client.destroy();
            }
        });
    }
};

