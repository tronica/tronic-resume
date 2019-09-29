/**
 * A helper class for the gapi read/write functions
 *
 * @export
 * @class SheetIO
 */
export default class SheetIO {

  /**
   *Creates an instance of SheetIO
   *
   * @param {String} spreadsheetId
   * @param {Object} gapi
   * @memberof SheetIO
   */
  constructor(spreadsheetId, gapi) {
    this.spreadsheetId = spreadsheetId;
    this.gapi = gapi;
  }

  /**
   * Fetches all the sheets of the page
   *
   * @returns {Promise<Object[]>}
   * @memberof SheetDB
   */
  async fetchSheets() {
    const { result: { sheets } } = await this.gapi.client.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId
    });

    return sheets.map(s => s['properties']);
  }

  /**
   * Returns a sheet's properties if it exists
   *
   * @param {String} name
   * @returns {Promise<Object>}
   * @memberof SheetDB
   */
  async findSheet(name) {
    const sheets = await this.fetchSheets();
    return sheets.find(s => s.title === name);
  }

  /**
   * Retrieves a range of data from the spreadsheet
   *
   * @param {String} range
   * @returns {Promise<any[][]>}
   */
  async fetchRange(range) {
    const { result } = await this.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range
    })
    return result.values || [];
  }

  /**
   * Writes the value into the specified range
   *
   * @param {String} range
   * @param {any[][]} values
   * @memberof SheetDB
   */
  async writeRange(range, values) {
    await this.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: range,
      valueInputOption: 'RAW',
      resource: { values }
   })
  }

  /**
   * Write the data of a single cell
   *
   * @param {String} sheet the sheet name
   * @param {String} cell the cell to write in
   * @param {any} value the data to write
   * @memberof SheetDB
   */
  async writeCell(sheet, cell, value) {
    return this.writeRange(`${sheet}!${cell}:${cell}`, [[value]]);
  }

  /**
   * Creates a sheet with the specified name
   *
   * @param {String} name
   * @memberof SheetDB
   */
  async createSheet(name) {
    await this.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      resource: {
        requests: [
          {
            'addSheet':{
              'properties':{
                  'title': name
              }
            }
          }
        ]
      }
    });
  }
}