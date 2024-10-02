import { NesApuNode } from 'https://cdn.jsdelivr.net/npm/@dtinth/nes-apu-worklet@1.0.1/nes-apu-node.js'

const context = (window.context = new AudioContext())

const NES_CPU_CLOCK_FREQ = 1_789_773

const ftot = (frequency) => {
  return Math.round(NES_CPU_CLOCK_FREQ / (16 * frequency)) - 1
}

const mtof = (midiNote) => {
  return 440 * 2 ** ((midiNote - 69) / 12)
}

context.audioWorklet
  .addModule(
    'https://cdn.jsdelivr.net/npm/@dtinth/nes-apu-worklet@1.0.1/nes-apu-worklet.js',
  )
  .then(() => {
    play.disabled = false
    play.className =
      'border border-#d7fc70 bg-#d7fc70 text-#090807 font-bold py-2 px-4 rounded'

    const apu = new NesApuNode(context)
    apu.connect(context.destination)
    apu.port.onmessage = ({ data }) => {
      const address = data.address.toString(16)
      const element = document.getElementById(`reg${address}`)
      const value = data.value.toString(2).padStart(8, '0')
      element.textContent = value
      console.log('APU', '$' + address, value, '@', data.time)
    }
    window.apu = apu

    play.onclick = () => {
      context.resume()

      apu.storeRegisterAtTime(0x4015, 0b00001111)

      // Enable channels
      const t = context.currentTime

      const setTriangle = (frequency, time) => {
        apu.storeRegisterAtTime(0x4008, 0xff, time)
        const timer = ftot(frequency * 2)
        apu.storeRegisterAtTime(0x400a, timer & 0xff, time)
        apu.storeRegisterAtTime(0x400b, timer >> 8, time)
      }

      const setPulse = (index, duty, frequency, volume = 1, time) => {
        const base = 0x4000 + index * 4
        apu.storeRegisterAtTime(
          base,
          0b00110000 | (Math.min(15, volume * 16) & 0xf) | (duty << 6),
          time,
        )

        const timer = ftot(frequency * 2)
        if (frequency != null) {
          apu.storeRegisterAtTime(base + 2, timer & 0xff, time)
          apu.storeRegisterAtTime(base + 3, timer >> 8, time)
        }
      }

      const silenceTriangle = (time) => {
        apu.storeRegisterAtTime(0x4008, 0x80, time)
      }

      for (const [i, n] of [
        38,
        [37, 38, 40],
        41,
        32,
        31,
        [31, 35, 39],
        43,
        37,
        36,
      ].entries()) {
        if (Array.isArray(n)) {
          for (const [j, nt] of n.entries()) {
            setTriangle(mtof(nt + 48 - 36), t + (i + j / n.length) / 2)
            silenceTriangle(t + (i + (j + 0.64) / n.length) / 2)
          }
        } else {
          setTriangle(mtof(n + 48 - 36), t + i / 2)
        }

        // Noise channel
        apu.storeRegisterAtTime(
          0x400c,
          i === 8 ? 0b00001111 : 0b00000001,
          t + i / 2,
        )
        apu.storeRegisterAtTime(0x400e, 0b00000001, t + i / 2)
        apu.storeRegisterAtTime(0x400f, 0b00001000, t + i / 2)
        if (i === 0 || i === 4 || i === 7) {
          apu.storeRegisterAtTime(0x400c, 0b00000100, t + (i + 0.64) / 2)
          apu.storeRegisterAtTime(0x400e, 0b00000001, t + (i + 0.64) / 2)
          apu.storeRegisterAtTime(0x400e, 0b00000010, t + (i + 0.65) / 2)
          apu.storeRegisterAtTime(0x400e, 0b00000100, t + (i + 0.66) / 2)
          apu.storeRegisterAtTime(0x400e, 0b00001000, t + (i + 0.67) / 2)
          apu.storeRegisterAtTime(0x400f, 0b00001000, t + (i + 0.64) / 2)
        }
        if (i === 1 || i === 5) {
          apu.storeRegisterAtTime(0x400c, 0b00011011, t + (i + 0.64) / 2)
          apu.storeRegisterAtTime(0x400e, 0b00001011, t + (i + 0.64) / 2)
          apu.storeRegisterAtTime(0x400f, 0b00111000, t + (i + 0.64) / 2)
        }
        if (i === 5) {
          apu.storeRegisterAtTime(0x400c, 0b00011011, t + (i + 0.33) / 2)
          apu.storeRegisterAtTime(0x400e, 0b00001001, t + (i + 0.33) / 2)
          apu.storeRegisterAtTime(0x400f, 0b00111000, t + (i + 0.33) / 2)
        }
        if (i === 6) {
          apu.storeRegisterAtTime(0x400c, 0b00011000, t + (i + 0.75) / 2)
          apu.storeRegisterAtTime(0x400e, 0b00000100, t + (i + 0.75) / 2)
          apu.storeRegisterAtTime(0x400f, 0b00101000, t + (i + 0.75) / 2)
          apu.storeRegisterAtTime(0x400c, 0b00011100, t + (i + 0.88) / 2)
          apu.storeRegisterAtTime(0x400e, 0b00000011, t + (i + 0.88) / 2)
          apu.storeRegisterAtTime(0x400f, 0b00101000, t + (i + 0.88) / 2)
        }
      }

      // Pulse 1
      for (const [i, ns] of [
        0,
        65,
        [67, 68, null, 69],
        76,
        [74, null, 75, null, 76],
        74,
        71,
        74,
        67,
      ].entries()) {
        if (ns) {
          for (let j = 0; j < 16; j++) {
            const n = (Array.isArray(ns) ? ns : [ns])[j]
            setPulse(
              0,
              0,
              n != null ? mtof(n - 12) : null,
              (j / 15) * 0.5 + 0.3,
              t + i / 2 + j * 0.02,
            )
          }
        }
      }

      // Pulse 2 notes
      for (const [i, n] of [0, 62, 65, 72, 71, 68, 67, 65].entries()) {
        if (n) {
          for (let j = 0; j < 16; j++) {
            setPulse(
              1,
              1,
              j == 0 ? mtof(n - 12) : null,
              (j / 15) * 0.5 + 0.3,
              t + i / 2 + j * 0.02,
            )
          }
        }
      }

      // Pulse 2 arpeggio
      {
        let k = 0
        for (let i = 4; i < 6; i += 0.04) {
          const n = [55, 59, 64][k++ % 3]
          setPulse(1, 0, mtof(n - 12), 0.7, t + i)
        }
      }
      apu.storeRegisterAtTime(0x4015, 0, t + 6)
    }
  })
  .catch((error) => {
    console.error(error)
  })
