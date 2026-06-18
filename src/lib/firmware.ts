import semver from "semver"

export const FIRMWARE_BIN_URL = "https://transit-tracker.eastsideurbanism.org/firmware/firmware.bin"

const MANIFEST_URL = "https://transit-tracker.eastsideurbanism.org/firmware/manifest.json"

export function isUpdateAvailable(deviceVersion: string | null, latestVersion: string): boolean {
  if (deviceVersion === null) return true
  if (deviceVersion === "dev") return false
  return semver.lt(deviceVersion, latestVersion)
}

export function releaseNotesUrl(version: string) {
  return `https://github.com/EastsideUrbanism/transit-tracker/releases/tag/${version}`
}

export async function getLatestFirmwareVersion(): Promise<string> {
  const resp = await fetch(MANIFEST_URL)
  if (!resp.ok) {
    throw new Error(`Failed to fetch firmware manifest: ${resp.status} ${resp.statusText}`)
  }

  const { version } = await resp.json()
  return version
}
