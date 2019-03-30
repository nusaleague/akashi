const DEFAULT_COUNT = 20
const MAX_COUNT = 100

function paginateOffset(query, cfg = {}, opts = {}) {
  const {
    maxCount = MAX_COUNT
  } = cfg

  const {
    page = 0,
    count = DEFAULT_COUNT
  } = opts

  const limit = Math.min(count, maxCount)
  query.limit(limit).offset(page * limit)

  return query
}

exports.paginateOffset = paginateOffset

function paginateKeyset(query, cfg = {}, opts = {}) {
  const {
    key = 'id',
    maxCount = MAX_COUNT
  } = cfg

  const {
    dir = 'after',
    current = 0,
    count = DEFAULT_COUNT
  } = opts

  const limit = Math.min(count, maxCount)

  switch (dir) {
    case 'before':
      query.where(key, '<', current).orderBy(key, 'desc').limit(limit)
      break
    case 'after':
      query.where(key, '>', current).orderBy(key, 'asc').limit(count)
      break
    default:
      throw new TypeError(`Invalid direction: ${dir}`)
  }

  return query
}

exports.paginateKeyset = paginateKeyset

function paginate(query, type = 'page', cfg = {}, opts = {}) {
  switch (type) {
    case 'page':
      return paginateOffset(query, cfg, opts)
    case 'key':
      return paginateKeyset(query, cfg, opts)
    default:
      throw new TypeError(`Invalid pagination type: ${type}`)
  }
}

exports.paginate = paginate
