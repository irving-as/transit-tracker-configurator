<script lang="ts">
  import { Pencil } from "@lucide/svelte"
  import { Button } from "../../ui/button"
  import { Input } from "../../ui/input"
  import { Label } from "../../ui/label"
  import * as RadioGroup from "../../ui/radio-group"
  import RouteStopChooser from "./RouteStopChooser.svelte"
  import { config, type RouteAtStop } from "$lib/state"
  import {
    maxArrivalTimeWindow,
    maxPageDurationMs,
    maxTransitionDurationMs,
    minPageDurationMs,
    minTransitionDurationMs
  } from "$lib/config"
  import { scale } from "svelte/transition"
  import { pluralize } from "$lib/utils"

  let showRouteEditor = $state(false)

  let routesCount = $derived(new Set($config.routes.map((route) => route.routeId)).size)
  let stopsCount = $derived(new Set($config.routes.map((route) => route.stopId)).size)

  function saveRoutes(routes: RouteAtStop[], timeOffsets: Record<string, number>) {
    $config.routes = routes
    $config.stopTimeOffsets = timeOffsets
    $config.routeStyles = $config.routeStyles.filter((style) =>
      routes.some((route) => route.routeId === style.routeId)
    )
    showRouteEditor = false
  }

  function setArrivalTimeWindow(input: HTMLInputElement) {
    const minutes = Number.parseInt(input.value, 10)
    const clampedMinutes = Number.isNaN(minutes)
      ? 0
      : Math.min(maxArrivalTimeWindow, Math.max(0, minutes))
    $config.arrivalTimeWindow = clampedMinutes
    input.value = clampedMinutes.toString()
  }

  function setDuration(
    value: string,
    setting: "pageDuration" | "transitionDuration",
    min: number,
    max: number
  ) {
    const milliseconds = Number.parseFloat(value) * 1000
    if (!Number.isNaN(milliseconds) && milliseconds >= min && milliseconds <= max) {
      $config[setting] = milliseconds
    }
  }

  function normalizeDuration(
    input: HTMLInputElement,
    setting: "pageDuration" | "transitionDuration",
    min: number,
    max: number
  ) {
    const milliseconds = Number.parseFloat(input.value) * 1000
    $config[setting] = Number.isNaN(milliseconds) ? min : Math.min(max, Math.max(min, milliseconds))
    input.value = ($config[setting] / 1000).toString()
  }
</script>

{#if showRouteEditor}
  <div
    class="fixed left-0 top-0 z-50 h-full w-full bg-background"
    transition:scale={{ duration: 300, start: 0.9 }}
  >
    <RouteStopChooser onsave={saveRoutes} config={$config} />
  </div>
{/if}

<div class="mb-5">
  <h4 class="scroll-m-20 text-xl font-semibold tracking-tight">Selected Routes</h4>
  <div class="mb-2 text-sm text-muted-foreground">
    Displaying {routesCount}
    {pluralize(routesCount, "route", "routes")} at {stopsCount}
    {pluralize(stopsCount, "stop", "stops")}.
  </div>

  <Button size="sm" variant="secondary" onclick={() => (showRouteEditor = true)}>
    <Pencil />
    Edit routes
  </Button>
</div>

<div class="mb-5">
  <h4 class="mb-2 scroll-m-20 text-xl font-semibold tracking-tight">Time Display</h4>

  <RadioGroup.Root bind:value={$config.timeDisplay}>
    <div class="flex items-center space-x-2">
      <RadioGroup.Item value="arrival" id="arrival" />
      <Label for="arrival">Arrival time</Label>
    </div>
    <div class="flex items-center space-x-2">
      <RadioGroup.Item value="departure" id="departure" />
      <Label for="departure">Departure time</Label>
    </div>
  </RadioGroup.Root>
</div>

<div class="mb-5">
  <h4 class="mb-2 scroll-m-20 text-xl font-semibold tracking-tight">Time Units</h4>

  <RadioGroup.Root bind:value={$config.timeUnits}>
    <div class="flex items-center space-x-2">
      <RadioGroup.Item value="long" id="long" />
      <Label for="long">Long (e.g., "5min" / "1h15m")</Label>
    </div>
    <div class="flex items-center space-x-2">
      <RadioGroup.Item value="short" id="short" />
      <Label for="short">Short (e.g., "5m" / "1h15m")</Label>
    </div>
    <div class="flex items-center space-x-2">
      <RadioGroup.Item value="none" id="none" />
      <Label for="none">None (e.g., "5" / "1:15")</Label>
    </div>
  </RadioGroup.Root>
</div>

<div class="mb-5">
  <h4 class="mb-2 scroll-m-20 text-xl font-semibold tracking-tight">Schedule Mode</h4>

  <RadioGroup.Root bind:value={$config.listMode}>
    <div class="flex items-center space-x-2">
      <RadioGroup.Item value="sequential" id="sequential" />
      <Label for="sequential">Show {$config.timeDisplay}s from all routes sequentially</Label>
    </div>
    <div class="flex items-center space-x-2">
      <RadioGroup.Item value="nextPerRoute" id="nextPerRoute" />
      <Label for="nextPerRoute">Show only the next {$config.timeDisplay} for each route</Label>
    </div>
  </RadioGroup.Root>
</div>

<div class="mb-5">
  <h4 class="scroll-m-20 text-xl font-semibold tracking-tight">Arrival Window</h4>
  <div class="mb-2 text-sm text-muted-foreground">
    Rotate through up to 20 {$config.timeDisplay}s in the next specified number of minutes. Set to 0
    to show only the next {$config.timeDisplay}s without rotating.
  </div>

  <div class="flex max-w-48 items-center gap-2">
    <Input
      type="number"
      min="0"
      max={maxArrivalTimeWindow}
      step="1"
      value={$config.arrivalTimeWindow}
      oninput={(event) => setArrivalTimeWindow(event.currentTarget)}
    />
    <Label>minutes</Label>
  </div>
</div>

<div class="mb-5">
  <h4 class="mb-2 scroll-m-20 text-xl font-semibold tracking-tight">Page Transition</h4>

  <RadioGroup.Root bind:value={$config.pageTransition}>
    <div class="flex items-center space-x-2">
      <RadioGroup.Item value="none" id="transition-none" />
      <Label for="transition-none">None &mdash; switch pages immediately</Label>
    </div>
    <div class="flex items-center space-x-2">
      <RadioGroup.Item value="fade" id="transition-fade" />
      <Label for="transition-fade">Fade &mdash; fade through black between pages</Label>
    </div>
    <div class="flex items-center space-x-2">
      <RadioGroup.Item value="scroll" id="transition-scroll" />
      <Label for="transition-scroll">Scroll &mdash; move the full list upward</Label>
    </div>
  </RadioGroup.Root>

  <div class="mt-3 grid max-w-md grid-cols-2 gap-3">
    <div>
      <Label for="page-duration">Page duration</Label>
      <div class="mt-1 flex items-center gap-2">
        <Input
          id="page-duration"
          type="number"
          min={minPageDurationMs / 1000}
          max={maxPageDurationMs / 1000}
          step="1"
          value={$config.pageDuration / 1000}
          oninput={(event) =>
            setDuration(
              event.currentTarget.value,
              "pageDuration",
              minPageDurationMs,
              maxPageDurationMs
            )}
          onblur={(event) =>
            normalizeDuration(
              event.currentTarget,
              "pageDuration",
              minPageDurationMs,
              maxPageDurationMs
            )}
        />
        <span class="text-sm text-muted-foreground">sec</span>
      </div>
    </div>

    {#if $config.pageTransition !== "none"}
      <div>
        <Label for="transition-duration">Transition duration</Label>
        <div class="mt-1 flex items-center gap-2">
          <Input
            id="transition-duration"
            type="number"
            min={minTransitionDurationMs / 1000}
            max={maxTransitionDurationMs / 1000}
            step="0.1"
            value={$config.transitionDuration / 1000}
            oninput={(event) =>
              setDuration(
                event.currentTarget.value,
                "transitionDuration",
                minTransitionDurationMs,
                maxTransitionDurationMs
              )}
            onblur={(event) =>
              normalizeDuration(
                event.currentTarget,
                "transitionDuration",
                minTransitionDurationMs,
                maxTransitionDurationMs
              )}
          />
          <span class="text-sm text-muted-foreground">sec</span>
        </div>
      </div>
    {/if}
  </div>
</div>

<div class="mb-5">
  <h4 class="scroll-m-20 text-xl font-semibold tracking-tight">Headsign Overflow</h4>
  <div class="mb-2 text-sm text-muted-foreground">
    Change how headsign text is displayed when it exceeds the available space.
  </div>

  <RadioGroup.Root bind:value={$config.headsignOverflow}>
    <div class="flex items-center space-x-2">
      <RadioGroup.Item value="hidden" id="hidden" />
      <Label for="hidden">Hidden &mdash; excess text will be cut off</Label>
    </div>
    <div class="flex items-center space-x-2">
      <RadioGroup.Item value="scroll" id="scroll" />
      <Label for="scroll"
        >Scroll &mdash; headsigns will scroll back and forth to reveal all text</Label
      >
    </div>
  </RadioGroup.Root>
</div>
