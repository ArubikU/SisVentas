import type { DatabaseInterface } from "./interfaces"
import { JSONImplementation } from "./json-implementation"
import { MySQLImplementation } from "./mysql-implementation"
import { SupabaseImplementation } from "./supabase-implementation"

const dbType = process.env.DB_TYPE || "json"

let implementation: DatabaseInterface

switch (dbType) {
  case "mysql":
    implementation = new MySQLImplementation()
    break
  case "supabase":
    implementation = new SupabaseImplementation()
    break
  case "json":
  default:
    implementation = new JSONImplementation()
}

export { implementation }

