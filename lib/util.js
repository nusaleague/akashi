function mapJSONRPCCode(code) {
  switch (code) {
    // JSON-RPC 2.0 specification-defined errors
    case -32700: return 400 // Parse error
    case -32600: return 400 // Invalid request
    case -32601: return 404 // Method not found
    case -32602: return 400 // Invalid params
    case -32603: return 500 // Internal error

    // JSON-RPC 2.0 implementation-defined errors
    case -32001: return 401 // Not authenticated
    case -32003: return 403 // Unauthorized

    // Application-defined errors
    default: return 400
  }
}

exports.mapJSONRPCCode = mapJSONRPCCode
