import { PUBLIC_API_HOST } from "$env/static/public"

export const defaultBaseUrl = PUBLIC_API_HOST

export const defaultPageDurationMs = 5000
export const defaultTransitionDurationMs = 700
export const minPageDurationMs = 1000
export const maxPageDurationMs = 60000
export const minTransitionDurationMs = 100
export const maxTransitionDurationMs = 5000
export const maxArrivalTrips = 20
export const maxArrivalTimeWindow = 180
export const arrivalTimeWindowMinFirmwareVersion = "3.4.0"
