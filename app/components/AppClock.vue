<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Scheme {
  name: string
  panel: string
  ink: string
  dim: string
  accent: string
  handH: string
  handM: string
  handS: string
  light: string
  dark: string
  lightSoft: string
  darkSoft: string
}

const SCHEMES: Scheme[] = [
  { name: 'light grey', panel: '#e0e5ec', ink: '#5a6473', dim: '#8a94a6', accent: '#5a6473', handH: '#4a5364', handM: '#586273', handS: '#d36b5e', light: 'rgba(255,255,255,.9)', dark: 'rgba(163,177,198,.7)', lightSoft: 'rgba(255,255,255,.55)', darkSoft: 'rgba(163,177,198,.45)' },
  { name: 'dark slate', panel: '#2a2f3a', ink: '#aeb6c4', dim: '#8189a0', accent: '#cdd4e2', handH: '#c6cdda', handM: '#aab2c2', handS: '#f0936a', light: 'rgba(63,71,86,.9)', dark: 'rgba(13,16,22,.85)', lightSoft: 'rgba(63,71,86,.6)', darkSoft: 'rgba(13,16,22,.6)' },
  { name: 'warm sand', panel: '#e7ddc8', ink: '#6f6247', dim: '#9a8b6c', accent: '#6f6247', handH: '#5c5138', handM: '#6f6247', handS: '#c2724a', light: 'rgba(255,250,236,.92)', dark: 'rgba(184,166,128,.7)', lightSoft: 'rgba(255,250,236,.55)', darkSoft: 'rgba(184,166,128,.45)' },
  { name: 'cool blue', panel: '#cfd9e8', ink: '#4a5a72', dim: '#7587a3', accent: '#4a5a72', handH: '#3c4c64', handM: '#4a5a72', handS: '#e08a5a', light: 'rgba(255,255,255,.92)', dark: 'rgba(140,160,190,.7)', lightSoft: 'rgba(255,255,255,.55)', darkSoft: 'rgba(140,160,190,.45)' }
]

const KEY = 'emboss.theme'
const index = ref(0)
const hourDeg = ref(0)
const minDeg = ref(0)
const secDeg = ref(0)
const displayH = ref('--')
const displayM = ref('--')
const displayS = ref('--')
const screenReaderText = ref('Loading the embossed clock.')

let raf: number | null = null
let lastMinute = ''

const currentScheme = computed(() => SCHEMES[index.value] ?? SCHEMES[0])

const rootStyle = computed(() => {
  const s = currentScheme.value!
  return {
    '--panel': s.panel,
    '--ink': s.ink,
    '--dim': s.dim,
    '--accent': s.accent,
    '--hand-h': s.handH,
    '--hand-m': s.handM,
    '--hand-s': s.handS,
    '--light': s.light,
    '--dark': s.dark,
    '--light-soft': s.lightSoft,
    '--dark-soft': s.darkSoft
  }
})

function pad(n: number) {
  return n < 10 ? '0' + n : '' + n
}

function tick() {
  const now = new Date()
  const ms = now.getMilliseconds()
  const sec = now.getSeconds() + ms / 1000
  const min = now.getMinutes() + sec / 60
  const hr = (now.getHours() % 12) + min / 60

  hourDeg.value = hr * 30
  minDeg.value = min * 6
  secDeg.value = sec * 6

  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()

  displayH.value = pad(h)
  displayM.value = pad(m)
  displayS.value = pad(s)

  const minuteStr = `${pad(h)}:${pad(m)}`
  if (minuteStr !== lastMinute) {
    lastMinute = minuteStr
    screenReaderText.value = `Emboss, a soft analog clock. The time is ${minuteStr}.`
  }
  raf = requestAnimationFrame(tick)
}

function start() {
  if (!raf) raf = requestAnimationFrame(tick)
}

function stop() {
  if (raf) {
    cancelAnimationFrame(raf)
    raf = null
  }
}

function handleVisibilityChange() {
  if (document.hidden) stop()
  else start()
}

onMounted(() => {
  try {
    const saved = parseInt(localStorage.getItem(KEY) || '0', 10)
    if (!isNaN(saved)) {
      index.value = ((saved % SCHEMES.length) + SCHEMES.length) % SCHEMES.length
    }
  } catch {
    // Fallback if localStorage fails
  }
  start()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stop()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div
    :style="rootStyle"
    class="clock-wrapper"
  >
    <main class="stage">
      <div
        class="clock"
        role="img"
        aria-label="A soft embossed analog clock with raised hands and inset hour marks showing the current time."
      >
        <div class="dial">
          <div
            v-for="i in 12"
            :key="i - 1"
            :class="['mark', { q: (i - 1) % 3 === 0 }]"
            :style="{
              left: `${50 + Math.sin((i - 1) * Math.PI / 6) * 41}%`,
              top: `${50 - Math.cos((i - 1) * Math.PI / 6) * 41}%`,
              transform: 'translate(-50%, -50%)'
            }"
          />
        </div>
        <div
          class="hand h"
          :style="{ transform: `rotate(${hourDeg}deg)` }"
        />
        <div
          class="hand m"
          :style="{ transform: `rotate(${minDeg}deg)` }"
        />
        <div
          class="hand s"
          :style="{ transform: `rotate(${secDeg}deg)` }"
        />
        <div class="boss" />
      </div>
    </main>

    <div
      class="readout"
      aria-hidden="true"
      dir="ltr"
    >
      <span>{{ displayH }}</span><span class="sep">:</span><span>{{ displayM }}</span><span class="sep">:</span><span>{{ displayS }}</span>
    </div>

    <a
      class="help"
      href="https://lukesteuber.com"
      aria-label="Luke Steuber's website"
    >?</a>
    <div
      class="sr-only"
      aria-live="polite"
    >
      {{ screenReaderText }}
    </div>
  </div>
</template>

<style scoped>
.clock-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* Let the parent container or utility classes control the sizing directly */
}

.stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.clock {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: var(--panel);
}

.dial {
  position: absolute; inset: 9%;
  border-radius: 50%;
  background: var(--panel);
  box-shadow:
    inset 0.28rem 0.28rem 0.6rem var(--dark),
    inset -0.28rem -0.28rem 0.6rem var(--light);
}

.mark {
  position: absolute; top: 50%; left: 50%;
  width: 2.6%; height: 2.6%;
  margin: -1.3% 0 0 -1.3%;
  border-radius: 50%;
  background: var(--panel);
  box-shadow:
    inset .14rem .14rem .4rem var(--dark),
    inset -.14rem -.14rem .4rem var(--light);
}
.mark.q { width: 3.6%; height: 3.6%; margin: -1.8% 0 0 -1.8%; }

.hand {
  position: absolute; left: 50%; top: 50%;
  transform-origin: 50% 100%;
  border-radius: 999px;
  background: var(--panel);
}
.hand.h {
  width: 3.4%; height: 28%;
  margin-left: -1.7%; margin-top: -28%;
  background: var(--hand-h);
  box-shadow: .3rem .3rem .9rem var(--dark-soft), -.2rem -.2rem .6rem var(--light-soft);
}
.hand.m {
  width: 2.4%; height: 40%;
  margin-left: -1.2%; margin-top: -40%;
  background: var(--hand-m);
  box-shadow: .3rem .3rem .9rem var(--dark-soft), -.2rem -.2rem .6rem var(--light-soft);
}
.hand.s {
  width: 1.1%; height: 44%;
  margin-left: -0.55%; margin-top: -44%;
  background: var(--hand-s);
  box-shadow: .2rem .2rem .7rem var(--dark-soft);
}

.boss {
  position: absolute; top: 50%; left: 50%;
  width: 9%; height: 9%;
  margin: -4.5% 0 0 -4.5%;
  border-radius: 50%;
  background: var(--panel);
  box-shadow:
    .5rem .5rem 1.1rem var(--dark),
    -.4rem -.4rem 1rem var(--light),
    inset .15rem .15rem .4rem var(--light);
}
.boss::after {
  content: ""; position: absolute; inset: 34%;
  border-radius: 50%;
  background: var(--hand-s);
  box-shadow: inset .1rem .1rem .3rem rgba(0,0,0,.25);
}

.readout {
  position: absolute;
  bottom: -22px;
  left: 0;
  right: 0;
  display: flex; justify-content: center; align-items: baseline; gap: .06ch;
  color: var(--ui-text);
  font-variant-numeric: tabular-nums; letter-spacing: .05em;
  font-size: 0.75rem; font-weight: 700;
}
.readout .sep { color: var(--hand-s); }

.help { display: none; }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
</style>
