import "./env.js"
import { getEnv } from "./env.js"
import { initSentry } from "./sentry.js"
import { initPrisma } from "./db.js"
import { app } from "./app.js"

initSentry()

async function start() {
  const env = getEnv()
  await initPrisma()
  const port = env.PORT ?? 3000
  app.listen(port, () => {
    console.log(`PromptVault API running on port ${port}`)
  })
}

start().catch((err) => {
  console.error("Failed to start server:", err)
  process.exit(1)
})
