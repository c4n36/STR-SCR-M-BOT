const config = require('../config/config.json');
const { Client, MessageAttachment } = require('discord.js');
const { google } = require('googleapis');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const { yariX, yariY, YarilogonunIsimdenUzakliğiX, YarilogonunIsimdenUzakliğiY, YarilogoBuyuklugu } = require('../config/kordinat.json');
const { yantablo, yantablo2 } = require('../config/tabloisim.json');

const SCOPES = config.SCOP;
const SERVICE_ACCOUNT_FILE = config.SERVİCES_FİLES;
const SAMPLE_SPREADSHEET_ID = config.SAMPLE_ID;
const SAMPLE_SPREADSHEET_RANGE = config.yarim_e_tablo;
const puansistemi = config.puansistemi;

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: SCOPES,
});

async function getMultipleRangesData(ranges) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  if (!ranges || !ranges.length) {
    console.log('Veri aralığı belirtilmemiş.');
    return [];
  }

  const promises = ranges.map(range => sheets.spreadsheets.values.get({
    spreadsheetId: SAMPLE_SPREADSHEET_ID,
    range: range,
  }));

  try {
    const responses = await Promise.all(promises);
    const allData = responses.reduce((acc, response) => {
      const data = response.data.values || [];
      return acc.concat(data);
    }, []);
    return allData;
  } catch (error) {
    return [];
  }
}

async function settingsData() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SAMPLE_SPREADSHEET_ID,
    range: SAMPLE_SPREADSHEET_RANGE,
  });
  return response.data.values;
}

function replaceTurkishCharacters(teamName) {
  if (!teamName) return '';
  const turkishCharacters = {
    'ı': 'i', 'İ': 'I',
    'ş': 's', 'Ş': 'S',
    'ğ': 'g', 'Ğ': 'G',
    'ü': 'u', 'Ü': 'U',
    'ö': 'o', 'Ö': 'O',
    'ç': 'c', 'Ç': 'C',
  };

  return teamName.replace(/[ıİşŞğĞüÜöÖçÇ]/g, function (match) {
    return turkishCharacters[match];
  });
}

async function someEventHandler() {
  try {
    const client = await auth.getClient(); 
    const sheets = google.sheets({ version: 'v4', auth: client }); 

    const promises = config.yarim_e_tablo.map(range => sheets.spreadsheets.values.get({
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


module.exports = {
  name: 'yr',
  description: 'Yarım tablo oluşturur.',
  async execute(message, args) {
    try {
      console.log(config.yayıncıId)
      var teamData = await someEventHandler()
      var x = await someEventHandler()
      if (teamData && teamData.length > 0) {
        var teams = {};

        for (let i = 0; i < teamData.length; i++) {
          var teamName = replaceTurkishCharacters(teamData[i][0]) || "";

          if (!teams[teamName]) {
            teams[teamName] = { totalPuan: 0, totalKill: 0, totalSira: 0, winCount: 0 };
          }

          for (let j = 0; j < 5; j++) {
            let kill = parseInt(teamData[i][2 + (j * 2)]) || 0;
            let sira = parseInt(teamData[i][3 + (j * 2)]) || 0;

            if (!isNaN(kill) && !isNaN(sira)) {
              let totalPuan = 0;
              if (sira == 1) {
                totalPuan = puansistemi[sira];
                sira = 15
                teams[teamName].winCount++;
              }
              else if (sira == 2) {
                totalPuan = puansistemi[sira];
                sira = 12
              }
              else if (sira == 3) {
                totalPuan = puansistemi[sira];
                sira = 10
              }
              else if (sira == 4) {
                totalPuan = puansistemi[sira];
                sira = 8
              }
              else if (sira == 5) {
                totalPuan = puansistemi[sira];
                sira = 6
              }
              else if (sira == 6) {
                totalPuan = puansistemi[sira];
                sira = 4
              }
              else if (sira == 7) {
                totalPuan = puansistemi[sira];
                sira = 2
              }
              else if (sira == 8) {
                totalPuan = puansistemi[sira];
                sira = 1
              }
              else if (sira == 9) {
                totalPuan = puansistemi[sira];
                sira = 1
              }
              else if (sira == 10) {
                totalPuan = puansistemi[sira];
                sira = 1
              }
              else if (sira == 11) {
                totalPuan = puansistemi[sira];
                sira = 1
              }
              else {
                totalPuan = 0
                sira = 0
              }

              teams[teamName].totalKill += kill;
              teams[teamName].totalSira += sira;
              teams[teamName].totalPuan += parseInt(kill) + parseInt(sira);
            }
          }
        }
        console.log("Takım sayısı:", Object.entries(teams).length);

        const guild = message.guild;
        const yayıncı = await guild.members.fetch(config.yayıncıId);
        console.log('Yayıncı ID:', config.yayıncıId); // Yayıncı ID'sini konsola yazdır

        var sortedTeams = Object.entries(teams).sort((a, b) => b[1].totalPuan - a[1].totalPuan);

        const canvas = createCanvas(404, 1429);
        const context = canvas.getContext('2d');

        const backgroundImagePath = args[0] === '2' ? `./Tablolar/${yantablo2}` : `./Tablolar/${yantablo}`;

        const backgroundImage = await loadImage(backgroundImagePath);

        context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        registerFont('./font/x.ttf', { family: 'American Captain' });
        context.fillStyle = '#ffffff';

        context.textAlign = 'left';
        var path = './Logolar';
        for (let i = 0; i < sortedTeams.length; i++) {
          const sx = i % yariX.length;
          const sy = Math.floor(i / yariX.length);
          const [teamName, teamData] = sortedTeams[i];
          const startx = yariX[sx];
          const starty = yariY[sy];

          let files = fs.readdirSync(path).filter(f => f.endsWith('.png'));
          const dizinYolu = './Logolar';
          const dosyalar = fs.readdirSync(dizinYolu);
          if (dosyalar.includes(`${teamName}.png`)) {
            const logo = await loadImage(`./Logolar/${teamName}.png`);
            context.drawImage(logo, yariX[0] - YarilogonunIsimdenUzakliğiX, yariY[i] - YarilogonunIsimdenUzakliğiY, YarilogoBuyuklugu[0], YarilogoBuyuklugu[1]);
          } else {
          }

          context.font = '50px American Captain';
          context.fillText(teamName, startx, starty);
          context.font = '50px American Captain';
          context.fillText(teamData.totalPuan, startx + 235, starty);
        }

        const attachment = new MessageAttachment(canvas.toBuffer(), 'mvp_result.png');
        const mes = await message.channel.send(attachment);

        await mes.react('✅');

        const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id;
        const collector = mes.createReactionCollector(filter);

        collector.on('collect', async (reaction, user) => {

          try {
            await yayıncı.send(attachment);
            await yayıncı.send('Yayınınızda kenra koyunuz. ')
            console.log('Gönderdim')
          } catch (e) {
            console.log('Hattatatat')
            console.log(e);
            client.destroy();
          }
        });
      }
    } catch (error) {
      console.error('Hata:', error);
      message.channel.send('Bir hata oluştu.');
    }
  }
};
