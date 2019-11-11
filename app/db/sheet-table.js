import { toSheetColumn }  from './sheet-math';
import sift               from 'sift';
import _                  from 'lodash';

const clone = _.cloneDeep;

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
    this.schema = schema;
    this.prepare = this.init();
  }

  ready() {
    return this.prepare;
  }

  async init() {
    await this.createTable();
    await this.syncColumns();

    this.records = await this.fetchRecords();
  }

  async find(query) {
    await this.ready();
    return this.records
      .filter(sift(query))
      .map(clone);
  }

  async all() {
    return await this.find({});
  }

  async first() {
    return (await this.all())[0];
  }

  create(record) {
    delete record['id'];
    return this.upsert(record);
  }

  async upsert(record) {
    await this.ready();

    record = clone(record);

    let idx = this.records.findIndex(r => r.id === record.id);

    record.updatedAt = new Date();

    if (idx < 0) { // New record
      record.id = this.nextId();
      idx = this.records.length;
      record.createdAt = new Date();
    }

    const row = this.schema.serialize(record, this.columns);

    await this.writeRow(row, idx);

    this.records[idx] = record;

    return clone(record)
  }

  // ---- SETUP HELPERS

  writeRow(row, idx) {
    const y     = 2 + idx;
    const range = this.createRange(0, this.columns.length, y, y);
    return this.io.writeRange(range, [row]);
  }

  nextId() {
    const isNumber = (n) => (n !== null && !isNaN(n));

    const ids = this.records
      .map(r => Number(r.id))
      .filter(isNumber);

    if (!ids.length) {
      return 1;
    }

    return Math.max(...ids) + 1;
  }

  createRange(left, right, top, bottom) {
    const rangeLeft   = toSheetColumn(left);
    const rangeRight  = toSheetColumn(right);
    return `${this.name}!${rangeLeft}${top}:${rangeRight}${bottom}`;
  }

  /**
   * Creates the table if it doesn't exist
   *
   * @memberof SheetTable
   */
  async createTable() {
    if (await this.io.findSheet(this.name)) {
      return; // Already exists
    }

    await this.io.createSheet(this.name);
    await this.io.writeCell(this.name, 'A1', 'id');
  }

  /**
   * Updates the sheet's columns to match the schema's
   *
   * @memberof SheetTable
   */
  async syncColumns() {
    this.columns = await this.fetchColumns();

    const expectedColumns = this.schema.keys;
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
      const range = this.createRange(offset, offset + pageSize, 1, 1);
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
  async fetchRecords() {
    let pageSize    = 100;
    let offset      = 2;
    let result      = [];
    let complete    = false;

    while (!complete) {
      const range   = this.createRange(0, this.columns.length, offset, offset + pageSize);
      console.log(range);
      const values  = await this.io.fetchRange(range);

      complete = (values.length < pageSize);
      result = [ ...result, ...values ];
      offset += pageSize + 1;
    }

    return result.map(row => this.schema.deserialize(row, this.columns));
  }
}