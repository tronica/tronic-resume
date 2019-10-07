import _ from 'lodash'

const SEPARATOR = '&|&'
const ARRAY_REXP = /\[\]$/;

const DESERIALIZERS = {
  'date': (val) => new Date(val),
  'number': (val) => Number(val),
};

const SERIALIZERS = {
  'ref': (val) => _.isString(val) ? val : val.id
};

const identity = (val) => val;

const isArrayType = (type) => ARRAY_REXP.test(type);

const itemType = (arrayType) => arrayType.replace(ARRAY_REXP, '');

const isRef = type => /ref/.test(type);

/**
 * Schema wrapper with serialization helpers
 */
class Schema {

  /**
   * Creates an instance of Schema.
   *
   * @param {object} fields the table columns with their types
   * @memberof Schema
   */
  constructor(fields) {
    this.fields = { ...fields, id: 'number' };
    this.keys = Object.keys(this.fields);
    this.relationships = _.pickBy(this.fields, isRef);
  }

  /**
   * Transforms an XLS string value to it's expected JS type
   *
   * @param {string} type
   * @param {string} value
   * @returns {any}
   * @memberof Schema
   */
  deserializeValue(type, value) {
    if (isArrayType(type)) {
      type = itemType(type);
      return (value || '').split(SEPARATOR).map(v => this.deserializeValue(type, v));
    }

    return (DESERIALIZERS[type] || identity)(value);
  }

  /**
   * Transforms a JS variable to a string for the table
   *
   * @param {string} type
   * @param {any} value
   * @returns {string}
   * @memberof Schema
   */
  serializeValue(type, value) {
    if (isArrayType(type)) {
      type = itemType(type);
      return (value || []).map(v => this.serializeValue(type, v)).join(SEPARATOR);
    }

    if (_.isUndefined(value)) {
      return '';
    }

    return (SERIALIZERS[type] || String)(value);
  }

  /**
   * Transforms a row into a record
   *
   * @param {string[]} row
   * @param {string[]} columns
   * @returns {object}
   * @memberof Schema
   */
  deserialize(row, columns) {
    // Transform an array of values into an object
    return columns
      .reduce((record, key, idx) => {
        if (this.fields.hasOwnProperty(key)) {
          const type = this.fields[key];
          record[key] = this.deserializeValue(type, row[idx])
        }
        return record;
      }, {})
  }

  /**
   * Transforms a record into a row
   *
   * @param {object} record
   * @param {string[]} columns
   * @returns {string[]}
   * @memberof Schema
   */
  serialize(record, columns) {
    // Transform an object into an array of values
    return columns.reduce((row, key, idx) => {
      const type = this.fields[key];
      row[idx] = this.serializeValue(type, record[key]);
      return row;
    }, [])
  }
}

// ----------------------------------------------------
//                SCHEMA DEFINITIONS
// ----------------------------------------------------

export const ResumeSchema = new Schema({
  firstName:  'string',
  lastName:   'string',
  title:      'string',
  email:      'string',
  phone:      'string',
  website:    'string',
  intro:      'string',
  hobbies:    'string[]'
});

export const JobSchema = new Schema({
  resumeId:     'ref',
  company:      'string',
  position:     'string',
  startDate:    'date',
  endDate:      'date',
  description:  'string'
});

export const Schemas = {
  'resumes':  ResumeSchema,
  'jobs':     JobSchema
};