import type { SetEntityResult, TransitTrackerDevice } from "./transit-tracker-device"

export interface FakeDeviceOptions {
  projectVersion: string | null
  simulateFailures: boolean
}

export const defaultFakeDeviceOptions: FakeDeviceOptions = {
  projectVersion: null,
  simulateFailures: false
}

export class FakeTransitTrackerDevice implements TransitTrackerDevice {
  constructor(private readonly options: FakeDeviceOptions = defaultFakeDeviceOptions) {}

  async getProjectVersion(): Promise<string | null> {
    return this.options.projectVersion
  }

  private async result(name: string): Promise<SetEntityResult> {
    // simulate small delay
    await new Promise((resolve) => setTimeout(resolve, 50))

    if (this.options.simulateFailures) {
      throw new Error(`Simulated failure for entity ${name}`)
    }

    return { ok: true, name }
  }

  async setTextEntity(id: string, _value: string): Promise<SetEntityResult> {
    return this.result(id)
  }

  async setSelectEntity(id: string, _value: string): Promise<SetEntityResult> {
    return this.result(id)
  }

  async setSwitchEntity(id: string, _value: "ON" | "OFF"): Promise<SetEntityResult> {
    return this.result(id)
  }

  async pressButton(id: string): Promise<SetEntityResult> {
    return this.result(id)
  }
}
