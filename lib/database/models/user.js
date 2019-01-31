const Haru = require('@tkesgar/haru')
const {ActiveRow} = require('../row')
const {connection: conn} = require('../connection')

const TBL_USER = 'user'
const TBL_STAFF = 'staff'

class User extends ActiveRow {
  static findById(id) {
    return ActiveRow.findBy(TBL_USER, {id}, data => new User(data))
  }

  static findByName(name) {
    return ActiveRow.findBy(TBL_USER, {name}, data => new User(data))
  }

  static findByEmail(email) {
    return ActiveRow.findBy(TBL_USER, {email}, data => new User(data))
  }

  static async insert(name, opts = {}) {
    const {
      password = null,
      email = null,
      emailVerified = false
    } = opts

    const passwordHash = password ? await Haru.fromPassword(password) : null

    return ActiveRow.insert(TBL_USER, {
      name,
      email,
      password_hash: passwordHash,
      email_verified: emailVerified
    })
  }

  constructor(data, opts = {}) {
    const {relations = {}} = opts

    super(TBL_USER, data, {
      relations: {
        staffInfo: async () => {
          const [staffRow] = await conn(TBL_STAFF).where({user_id: this.id})
          if (!staffRow) {
            return null
          }

          return {
            roles: staffRow.roles.split(',').filter(r => r)
          }
        },
        ...relations
      }
    })
  }

  get name() {
    return this.getData('name')
  }

  set name(value) {
    this.setData('name', value)
  }

  get passwordHash() {
    return Haru.fromJSON(this.getData('password_hash'))
  }

  set passwordHash(value) {
    this.setData('password_hash', value.toJSON())
  }

  get email() {
    return this.getData('email')
  }

  set email(value) {
    this.setData('email', value)
    this.setData('email_verified', 0)
  }

  get isEmailVerified() {
    return Boolean(this.getData('email_verified'))
  }

  async getStaffInfo() {
    return this.getRelation('staffInfo')
  }

  get staffInfo() {
    return this.getRelationSync('staffInfo')
  }

  get isStaff() {
    return this.staffInfo !== null
  }

  async getUserData() {
    const data = {
      id: this.id,
      name: this.name,
      email: this.email,
      isEmailVerified: this.isEmailVerified
    }

    const staffInfo = await this.getStaffInfo()
    if (staffInfo) {
      data.staff = staffInfo
    }

    return data
  }
}

module.exports = User
