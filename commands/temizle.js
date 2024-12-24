const { google } = require('googleapis');
const { SCOP, SERVİCES_FİLES, SAMPLE_ID } = require('../config/config.json');

const auth = new google.auth.GoogleAuth({
    keyFile: SERVİCES_FİLES,
    scopes: SCOP,
});

async function clearSpreadsheetData() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    try {
        const ranges = [
            { sheetName: 'Gün1', range: 'B3:M29' },
            { sheetName: 'Gün2', range: 'B3:M29' },
            { sheetName: 'Gün3', range: 'B3:M29' },
            { sheetName: 'Gün4', range: 'B3:M29' }        ];

        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SAMPLE_ID,
        });

        const sheetIds = {};
        spreadsheet.data.sheets.forEach(sheet => {
            sheetIds[sheet.properties.title] = sheet.properties.sheetId;
        });

        const updateRequests = ranges.map(({ sheetName, range }) => {
            const [startCell, endCell] = range.split(':');
            const startRow = parseInt(startCell.substring(1)) - 1;
            const endRow = parseInt(endCell.substring(1));
            const startCol = startCell.charCodeAt(0) - 'A'.charCodeAt(0);
            const endCol = endCell.charCodeAt(0) - 'A'.charCodeAt(0) + 1;

            return {
                repeatCell: {
                    range: {
                        sheetId: sheetIds[sheetName],
                        startRowIndex: startRow,
                        endRowIndex: endRow,
                        startColumnIndex: startCol,
                        endColumnIndex: endCol,
                    },
                    cell: {
                        userEnteredValue: { stringValue: '' },
                    },
                    fields: 'userEnteredValue',
                },
            };
        });

        const clearDataRequest = {
            spreadsheetId: SAMPLE_ID,
            requestBody: {
                requests: updateRequests,
            },
        };

        const response = await sheets.spreadsheets.batchUpdate(clearDataRequest);
        console.log('Veri temizlendi:', response.status);
        return response.status === 200;
    } catch (error) {
        console.error('Veri temizleme hatası:', error);
        return false;
    }
}

module.exports = {
    name: 'temizle',
    description: 'E tabloyu temizler.',
    async execute(message, args) {
        const success = await clearSpreadsheetData();
        if (success) {
            message.channel.send('Veri temizleme işlemi başarılı.');
        } else {
            message.channel.send('Veri temizleme işleminde bir hata oluştu.');
        }
    },
};
