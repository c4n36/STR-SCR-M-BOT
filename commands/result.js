const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const { google } = require('googleapis');
const { yantablo, yantablo2, live, live2, result, result2, mvp, mvp2, slot, slot2, win } = require('../config/tabloisim.json')
const { result_e_tablo, SCOP, SERVİCES_FİLES, SAMPLE_ID, resultkanalId , puansistemi} = require('../config/config.json')
const {  ResultX, ResultY, ResultlogonunIsimdenUzakliğiX, ResultlogonunIsimdenUzakliğiY, ResultlogoBuyuklugu } = require('../config/kordinat.json')
const { createCanvas, loadImage, registerFont } = require('canvas');

const SCOPES = SCOP;
const SERVICE_ACCOUNT_FILE = SERVİCES_FİLES;
const SAMPLE_SPREADSHEET_ID = SAMPLE_ID;


const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES,
});


async function Data() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SAMPLE_SPREADSHEET_ID,
      range: result_e_tablo,
    });
    return response.data.values;
}
  

function replaceTurkishCharacters(teamName) {
  if (!teamName) return '';
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

async function updateGun2TeamNames(teamNames) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const resource = {
      values: teamNames.map(name => [name]) // takım isimlerini yay
  };



  const promises = result_e_tablo.map(range => sheets.spreadsheets.values.update({
    spreadsheetId: SAMPLE_SPREADSHEET_ID,
    range: range,
    valueInputOption: 'RAW',
    resource: resource,
  }));

  await Promise.all(promises);
}



async function getTeamNames() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SAMPLE_SPREADSHEET_ID,
      range: result_e_tablo,
  });

  const data = response.data.values || [];
  const teamNames = data.map(row => row[0]); // takım adlarını alıyosun baby

  return teamNames;
}
async function someEventHandler() {
  try {
    const client = await auth.getClient(); 
    const sheets = google.sheets({ version: 'v4', auth: client }); 

    const promises = result_e_tablo.map(range => sheets.spreadsheets.values.get({
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

async function settingsData() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SAMPLE_SPREADSHEET_ID,
    range: result_e_tablo,
  });
  return response.data.values;
}

module.exports = {
  name: 'result',
  description: 'Result tablosu oluşturur.',
  async execute(message, args) {
      var desingno = false;
      var segmentedno = false;
      var canvas = createCanvas(1760, 990);
      var context = canvas.getContext('2d');
      data = await someEventHandler();
      console.log(data)
      registerFont('./font/x.ttf', { family: 'American Captain'})
      context.fillStyle = '#ffff';
      context.font = '35px American Captain';

      const backgroundImagePath = args[0] === '2' ? `./Tablolar/${result2}` : `./Tablolar/${result}`;
      const backgroundImage = await loadImage(backgroundImagePath);

      context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      if (data && data.length > 0) {
          var teams = {};
          const puanlar = [0]   
          for(let i = 0; i < 20; i++){
              puanlar.push(puansistemi[i])
          }
          
          for (let i = 0; i < data.length; i++) {
            var teamName = replaceTurkishCharacters(data[i][0]) || "";
            if (!teams[teamName]) {
                teams[teamName] = { totalPuan: 0, totalKill: 0, totalSira: 0, winCount: 0 };
            }
            
            for (let j = 0; j < 5; j++) {
                let kill = parseInt(data[i][2 + (j * 2)]) || 0;
                let sira = parseInt(data[i][3 + (j * 2)]) || 0;

                if (!isNaN(kill) && !isNaN(sira)) {
                    let totalPuan = 0;
                    if (sira == 1) {
                        totalPuan = puansistemi[1];
                        sira = 15
                        teams[teamName].winCount++;
                    } 
                    else if (sira == 2) {
                        totalPuan = puansistemi[2];
                        sira = 12
                    } 
                    else if (sira == 3) {
                        totalPuan = puansistemi[3];
                        sira = 10
                    } 
                    else if (sira == 4) {
                        totalPuan = puansistemi[4];
                        sira = 8
                    } 
                    else if (sira == 5) {
                        totalPuan = puansistemi[5];
                        sira =  6
                    }
                    else if (sira == 6) {
                        totalPuan = puansistemi[6];
                        sira = 4
                    } 
                    else if (sira == 7) {
                        totalPuan = puansistemi[7];
                        sira =  2
                    }
                    else if (sira == 8) {
                      totalPuan = puansistemi[8];
                      sira =  1
                  }
                  else if (sira == 9) {
                      totalPuan = puansistemi[9];
                      sira =  1
                  }
                  else if (sira == 10) {
                      totalPuan = puansistemi[10];
                      sira =  1
                  }
                  else if (sira == 11) {
                      totalPuan = puansistemi[11];
                      sira =  1
                  }
                    else {
                        totalPuan = 0
                        sira = 0
                    }
                  
                    teams[teamName].totalPuan += parseInt(kill) + parseInt(sira)
                    teams[teamName].totalKill += kill;
                    teams[teamName].totalSira += sira;
                }
            }
        }

          var sortedTeams = Object.entries(teams).sort((a, b) => b[1].totalPuan - a[1].totalPuan);
          const embed = new Discord.MessageEmbed()
          .setTitle('🎉 Sonuçlar 🎉')
          .setDescription('👑 Tebrikler, en iyi takımlar belli oldu!')
          .setColor('#FFA500') 
        //   .setThumbnail(message.guild.iconURL()) 
          .setTimestamp()
          .setFooter(`Canlı skor tablosu !!!`, message.guild.iconURL());  
          
      
      for (let i = 0; i < 3 && i < sortedTeams.length; i++) {
          const [teamName, teamData] = sortedTeams[i];
          const crown = i === 0 ? '👑' : i === 1 ? '🥈' : '🥉'; 
          embed.addField(`${crown} #${i + 1} - ${teamName}`, `Toplam Puan: **${teamData.totalPuan}**`, true);
      }
      
      if (embed.fields.length === 0) {
          embed.setDescription('🔍 Sonuçlar mevcut değil.');
      }

          for (const [teamName, teamData] of Object.entries(teams)) {}

          context.textAlign = 'left';
          var spaceOfNameKill = 360
          var spaceOfKillSira = 87
          var spaceOfSiraTotal = 90
          
          for (let index = 0; index < sortedTeams.length; index++) {
              const [teamName, teamData] = sortedTeams[index];


            //   if (index >= 11) {
            //     console.log('MERHABA')
            //     spaceOfNameKill = 400;
            //     spaceOfKillSira = 80;
            //     spaceOfSiraTotal = 80;
            //  }
          
              if (teamName.trim() !== "") {
                  var teamNameX = ResultX[index]
                  var initialY = ResultY[index]
          
                  context.fillText(teamName, teamNameX, initialY); // takım adı
                  context.fillText(teamData.totalSira, teamNameX + spaceOfNameKill, initialY); // kill
                  context.fillText(teamData.totalKill, teamNameX + spaceOfNameKill + spaceOfKillSira, initialY); // sira
                  context.fillText(teamData.totalPuan, teamNameX + spaceOfNameKill + spaceOfKillSira + spaceOfSiraTotal, initialY ); // total
                  
                  try {
                      const logo = await loadImage(`./Logolar/${teamName}.png`);
                      context.drawImage(logo, teamNameX - ResultlogonunIsimdenUzakliğiX , initialY - ResultlogonunIsimdenUzakliğiY, ResultlogoBuyuklugu[0], ResultlogoBuyuklugu[1]);
                  } catch (error) {
                      var logosuzlar = [];
                      logosuzlar.push(teamName);
                  }

                  if (teamData.winCount >= 1) {
                    const winnerLogo = await loadImage(`./Tablolar/${win}`);
                    context.font = '28px American Captain';
                    context.fillText(`X`, teamNameX + 250 , initialY)
                    context.font = '35px American Captain';
                    context.fillText(`${teamData.winCount}`, teamNameX +  265, initialY)
                    context.drawImage(winnerLogo , teamNameX + 275, initialY - 45, 53, 50);
                }
              }
          }

          const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'result.png');
          embed.attachFiles([attachment]);
          embed.setImage('attachment://result.png');

          const sentMessage = await message.channel.send(embed);
          console.log('--')
          await sentMessage.react('✅');

          const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id;
          const collector = sentMessage.createReactionCollector(filter, { time: 30000 });

          collector.on('collect', async (reaction, user) => {
            const channelId = args[0] === '2' ? resultkanalId[1] : resultkanalId[0];
            const channel = message.guild.channels.cache.get(channelId);
            if (channel) {
                await channel.send(embed);
                message.channel.send('Embed başarıyla belirtilen kanala gönderildi.');
            } else {
                message.channel.send('TİKE TIKLAMA SÜRENİZ BİTTİ.');
                throw new Error('Belirtilen kanal bulunamadı.');
            }
        });
      }
  }
};
