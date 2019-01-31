const {connection: conn} = require('./connection')

class Row {
  static findAllBy(tableName, where, map = data => new Row(tableName, data)) {
    return conn(tableName).where(where).map(map)
  }

  static insertAll(tableName, data) {
    return conn(tableName).insert(data)
  }

  static async findBy(tableName, where, map = data => new Row(tableName, data)) {
    const [result] = await Row.findAllBy(tableName, where, map)
    return result || null
  }

  static async insert(tableName, data) {
    const [result] = await Row.insertAll(tableName, data)
    return result
  }

  constructor(tableName, data, opts = {}) {
    const {
      relations = {}
    } = opts

    this.tableName = tableName
    this.data = data
    this.relations = relations
  }

  isData(col) {
    return typeof this.data[col] !== 'undefined'
  }

  getData(col) {
    if (!this.isData(col)) {
      throw new TypeError(`Column '${col}' does not exist`)
    }

    return this.data[col]
  }

  isRelation(key) {
    return typeof this.relations[key] !== 'undefined'
  }

  isRelationReady(key) {
    if (!this.isRelation(key)) {
      throw new TypeError(`Relation '${key}' does not exist`)
    }

    return typeof this.relations[key] !== 'function'
  }

  getRelationSync(key) {
    if (!this.isRelationReady(key)) {
      throw new Error(`Relation '${key}' is not ready`)
    }

    return this.relations[key]
  }

  async getRelation(key) {
    if (!this.isRelationReady(key)) {
      const relation = await this.relations[key]()
      this.relations[key] = relation
    }

    return this.relations[key]
  }

  get id() {
    return this.getData('id')
  }

  get createdTime() {
    return this.getData('created_time')
  }

  get updatedTime() {
    return this.getData('updated_time')
  }
}
exports.Row = Row

class ActiveRow extends Row {
  constructor(tableName, data, opts = {}) {
    super(tableName, data, opts)

    const {
      primaryCols = ['id']
    } = opts

    this.primaryCols = primaryCols
  }

  setData(col, val) {
    if (!this.isData(col)) {
      throw new TypeError(`Column '${col}' does not exist`)
    }

    this.data[col] = val
  }

  get primaryData() {
    const data = {}

    for (const col of this.primaryCols) {
      data[col] = this.getData(col)
    }

    return data
  }

  async pull() {
    const [data] = await conn(this.tableName).where(this.primaryData)
    this.data = data
  }

  async push() {
    await conn(this.tableName).where(this.primaryData).update(this.data)
  }
}
exports.ActiveRow = ActiveRow
