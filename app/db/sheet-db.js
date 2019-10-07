import SheetTable   from './sheet-table';
import SheetIO      from './sheet-io';

export default class SheetDB {

  constructor(spreadsheetId, gapi) {
    this.spreadsheetId = spreadsheetId;
    this.gapi = gapi;

    this.tables = {};
    this.io = new SheetIO(spreadsheetId, gapi);
  }

  /**
   * Creates a table if it does not exist and returns it
   *
   * @param {String} name
   * @param {Object} schema
   * @returns {SheetTable}
   * @memberof SheetDB
   */
  table(name, schema) {
    if (!this.tables[name]) {
      this.tables[name] = new SheetTable(this, name, schema);
    }
    return this.tables[name];
  }

  exists(name) {
    return !!(this.tables[name]);
  }
}
