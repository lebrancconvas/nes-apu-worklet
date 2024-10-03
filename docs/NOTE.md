# NES APU WORKLET's Note

## APU Registers

### Pulse 1 & 2 Channel

- Duty Cycle (D)
  - The Shape and Character of Pulse Wave
  - Percentage of the period that the pulse is active and inactive.
  - Mode
    - 12.5% (Mode 1) -> 0b00: Brighter, More Nasal Tones
    - 25% (Mode 2) -> 0b01: Brighter, More Nasal Tones
    - 50% (Mode 3) -> 0b10: Fuller, Rounder Tones
    - 75% (Mode 4) -> 0b11: Fuller, Rounder Tones
  - Pulse Form from Mode
      12.5% (1/8):   _______-_______-_______-_______-
      25%   (1/4):   ______--______--______--______--
      50%   (1/2):   ____----____----____----____----
      75%   (3/4):   __------__------__------__------
- Loop Envelope (L)
  - Control How the volume of sound evolves over time.
  - Stage:
    - __Attack__: Reach its maximum volume.
    - __Decay__: Decrease after the initial peak.
    - __Sustain__: Steady volume level during the main part of the sound.
    - __Release__: Fade out after it stops being played.
  - Bit:
    - __0__: The envelope plays once and then stops. (Envelope does not loop or Length Counter halt disabled).
    - __1__: The envelope cycles repeat indefinitely, (Envelope loops or Length Counter halt enabled).

### Triangle Channel

### Noise Channel
