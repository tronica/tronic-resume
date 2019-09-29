import { toSheetColumn }  from './sheet-math';
import SheetDB            from './sheet-db';
import sift               from 'sift';

console.log(sift);

export default class SheetTable {

  /**
   * Database table wrapper
   *
   * @param {SheetDB} db
   * @param {String} tableName
   * @param {Object} schema
   */
  constructor(db, tableName, schema) {
    this.db = db;
    this.io = db.io;
    this.name = tableName;
    this.schema = { ...schema, id: 'string' };
    this.prepare = this.init();
  }

  ready() {
    return this.prepare;
  }

  async init() {
    await this.createTable();
    await this.syncColumns();

    this.rows = await this.fetchRows();
  }

  async find(query) {
    await this.ready();
    return this.rows.filter(sift(query));
  }

  async all() {
    return await this.find({});
  }

  // ---- SETUP HELPERS

  async createTable() {
    if (await this.io.findSheet(this.name)) {
      return; // Already exists
    }

    await this.io.createSheet(this.name);
  }

  async syncColumns() {
    this.columns = await this.fetchColumns();

    const expectedColumns = Object.keys(this.schema);
    for (let col of expectedColumns) {
      const exists = this.columns.find(c => c === col);

      if (!exists) {
        await this.io.writeCell(this.name, `${toSheetColumn(this.columns.length)}1`, col);
        this.columns.push(col);
      }
    }
  }

  /**
   * Retrieves the existing columns of the spreadsheet
   *
   * @returns {Promise<String[]>}
   * @memberof SheetDB
   */
  async fetchColumns() {
    let pageSize    = 20;
    let offset      = 0;
    let result      = [];
    let complete    = false;

    while (!complete) {
      const rangeLeft   = toSheetColumn(offset);
      const rangeRight  = toSheetColumn(offset + pageSize);
      const range       = `${this.name}!${rangeLeft}1:${rangeRight}1`;
      const [ columns = [] ] = await this.io.fetchRange(range);

      complete = (columns.length < pageSize);
      result = [ ...result, ...columns ];
      offset += pageSize + 1;
    }

    return result;
  }

  /**
   * Retrieves the data rows of the sheet
   *
   * @returns {Promise<Object[]>}
   * @memberof SheetDB
   */
  async fetchRows() {
    let pageSize    = 100;
    let offset      = 1;
    let result      = [];
    let complete    = false;

    while (!complete) {
      const rangeLeft   = toSheetColumn(0);
      const rangeRight  = toSheetColumn(this.columns.length);
      const range       = `${this.name}!${rangeLeft}${offset}:${rangeRight}${offset + pageSize}`;
      const values      = await this.io.fetchRange(range);

      complete = (values.length < pageSize);
      result = [ ...result, ...values ];
      offset += pageSize + 1;
    }

    return result.map(row => {
      // Transform an array of values into an object
      return this.columns.reduce((record, key, idx) => {
        record[key] = row[idx];
        return record;
      }, {})
    });
  }
}