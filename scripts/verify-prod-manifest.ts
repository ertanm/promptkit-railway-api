import fs from "fs"
import path from "path"

type WebAccessibleResource = {
  matches?: string[]
  resources?: string[]
}

type Manifest = {
  content_security_policy?: {
    extension_pages?: string
  }
  host_permissions?: string[]
  web_accessible_resources?: WebAccessibleResource[]
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function main() {
  const manifestPath = path.resolve(
    process.cwd(),
    "build",
    "chrome-mv3-prod",
    "manifest.json"
  )

  if (!fs.existsSync(manifestPath)) {
    fail(`Manifest not found at ${manifestPath}`)
  }

  const raw = fs.readFileSync(manifestPath, "utf8")
  let manifest: Manifest

  try {
    manifest = JSON.parse(raw) as Manifest
  } catch (err) {
    fail(`Failed to parse manifest.json: ${(err as Error).message}`)
  }

  const expectedCsp =
    "script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';"
  const actualCsp = manifest.content_security_policy?.extension_pages

  if (actualCsp !== expectedCsp) {
    fail(
      `Invalid CSP for extension_pages.\nExpected: ${expectedCsp}\nActual:   ${actualCsp ?? "undefined"}`
    )
  }

  const hostPermissions = manifest.host_permissions ?? []
  if (hostPermissions.includes("http://localhost:3000/*")) {
    fail(
      'host_permissions must not contain "http://localhost:3000/*" in production manifest'
    )
  }

  const webResources = manifest.web_accessible_resources ?? []

  for (const entry of webResources) {
    const matches = entry.matches ?? []
    if (matches.some((m) => m.includes("<all_urls>"))) {
      fail(
        'web_accessible_resources must not contain "<all_urls>" in matches for production manifest'
      )
    }
  }

  for (const entry of webResources) {
    const resources = entry.resources ?? []
    if (resources.includes("__plasmo_hmr_proxy__")) {
      fail(
        'web_accessible_resources must not expose "__plasmo_hmr_proxy__" in production manifest'
      )
    }
  }

  // Ensure API URL is not localhost (must set PLASMO_PUBLIC_API_URL when building for production)
  const buildDir = path.dirname(manifestPath)
  const popupFiles = fs.readdirSync(buildDir).filter((f) => f.startsWith("popup.") && f.endsWith(".js"))
  if (popupFiles.length === 0) {
    fail(`No popup bundle found in ${buildDir}`)
  }
  for (const file of popupFiles) {
    const content = fs.readFileSync(path.join(buildDir, file), "utf8")
    if (content.includes("http://localhost:3000")) {
      fail(
        "Production build contains localhost API URL. Set PLASMO_PUBLIC_API_URL to your HTTPS API (e.g. https://api.injectkit.dev) and rebuild."
      )
    }
  }

  // Scan all .js files (including subdirs) for localhost:3000
  const jsFiles = fs.readdirSync(buildDir, { recursive: true }) as string[]
  for (const relPath of jsFiles) {
    if (!relPath.endsWith(".js")) continue
    const filePath = path.join(buildDir, relPath)
    if (!fs.statSync(filePath).isFile()) continue
    const content = fs.readFileSync(filePath, "utf8")
    if (content.includes("localhost:3000")) {
      fail(
        `FAIL: Found localhost:3000 in ${relPath}. Rebuild with PLASMO_PUBLIC_API_URL set to your production API URL.`
      )
    }
  }

  console.log("Production manifest OK")
  process.exit(0)
}

main()
