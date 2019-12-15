const database = require('..');

class Row {
  static async findAll(
    tableName,
    where,
    conn = database,
    mapFn = data => new Row(tableName, data, conn)
  ) {
    return conn(tableName)
      .where(where)
      .map(mapFn);
  }

  static async find(tableName, where, conn, mapFn) {
    const [row = null] = await Row.findAll(tableName, where, conn, mapFn);
    return row;
  }

  static async insertAll(tableName, data, conn = database) {
    await conn(tableName).insert(data);
  }

  static async insert(
    tableName,
    data,
    conn = database,
    findFn = id => Row.find(tableName, { id }, conn)
  ) {
    const [id] = await conn(tableName).insert(data);
    return findFn(id);
  }

  constructor(tableName, data, conn = database) {
    this._tableName = tableName;
    this._data = data;
    this._conn = conn;
    this._connInitial = conn;
  }

  isColumn(key) {
    return typeof this._data[key] !== 'undefined';
  }

  getColumn(key) {
    if (!this.isColumn(key)) {
      throw new Error(`${key} is not a column for ${this._tableName}`);
    }

    return this._data[key];
  }

  get id() {
    return this.getColumn('id');
  }

  get createdTime() {
    return this.getColumn('created_time');
  }

  get updatedTime() {
    return this.getColumn('updated_time');
  }

  get deletedTime() {
    return this.getColumn('deleted_time');
  }

  get isDeleted() {
    return this.deletedTime !== null;
  }

  get connection() {
    return this._conn;
  }

  set connection(value) {
    this._conn = value || this._connInitial;
  }

  get query() {
    return this._conn(this._tableName).where('id', this.id);
  }

  async setData(data) {
    await this.query.update(data);
    Object.assign(this._data, data);
  }
}

module.exports = Row;
