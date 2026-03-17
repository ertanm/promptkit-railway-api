import path from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") })

process.env.NODE_ENV = "development"
if (!process.env.ALLOW_DEV_AUTO_AUTH) {
  process.env.ALLOW_DEV_AUTO_AUTH = "true"
}
