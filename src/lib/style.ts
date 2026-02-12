export type ColorProfile = 'truecolor' | 'ansi256' | 'ansi16' | 'none'

let _profile: ColorProfile | undefined

// Open Color palette
export const COLOR = {
  get CYAN_5() {
    return foreground('#22b8cf')
  },
  get GRAPE_5() {
    return foreground('#cc5de8')
  },
  get GRAY_5() {
    return foreground('#adb5bd')
  },
  get TEAL_5() {
    return foreground('#20c997')
  },
  get YELLOW_5() {
    return foreground('#fcc419')
  }
}

export const ANSI = {
  RESET: '0',
  BOLD: '1',
  DIM: '2',
  ITALIC: '3',
  UNDERLINE: '4'
} as const

const ANSI_16_PALETTE = [
  [0, 0, 0],
  [205, 49, 49],
  [13, 188, 121],
  [229, 229, 16],
  [36, 114, 200],
  [188, 63, 188],
  [17, 168, 205],
  [229, 229, 229],
  [102, 102, 102],
  [241, 76, 76],
  [35, 209, 139],
  [245, 245, 67],
  [59, 142, 234],
  [214, 112, 214],
  [41, 184, 219],
  [255, 255, 255]
] as const

export const CSI = '\x1b[' as const
export const RESET = '\x1b[0m' as const

// biome-ignore lint/suspicious/noControlCharactersInRegex: off
const SGR_REGEX = /\x1b\[[0-9;]*m/g

function mapColorDepth(depth: number): ColorProfile {
  if (depth >= 24) return 'truecolor'
  if (depth >= 8) return 'ansi256'
  if (depth >= 4) return 'ansi16'
  return 'none'
}

/** Detect color profile based on environment variables and terminal capabilities. */
export function detectProfile(
  stream: NodeJS.WriteStream = process.stdout,
  env: NodeJS.ProcessEnv = process.env
): ColorProfile {
  if (env.FORCE_COLOR === '0' || env.FORCE_COLOR?.toLowerCase() === 'false') return 'none'
  if (typeof env.NO_COLOR !== 'undefined') return 'none'
  if (!stream.isTTY) return 'none'
  if (typeof stream.getColorDepth === 'function') {
    return mapColorDepth(stream.getColorDepth(env))
  }
  return 'none'
}

function rgbToAnsi256(red: number, green: number, blue: number): number {
  if (red === green && green === blue) {
    if (red < 8) return 16
    if (red > 248) return 231
    return 232 + Math.round(((red - 8) / 247) * 24)
  }
  return (
    16 +
    36 * Math.round((red / 255) * 5) +
    6 * Math.round((green / 255) * 5) +
    Math.round((blue / 255) * 5)
  )
}

function rgbToAnsi16(red: number, green: number, blue: number): number {
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < 16; i++) {
    const [r, g, b] = ANSI_16_PALETTE[i]
    const dist = (red - r) ** 2 + (green - g) ** 2 + (blue - b) ** 2
    if (dist < bestDist) {
      best = i
      bestDist = dist
    }
  }
  return best
}

function ansi16Code(index: number): string {
  const base = index < 8 ? 30 : 90
  return String(base + (index % 8))
}

function getProfile(): ColorProfile {
  if (_profile === undefined) {
    _profile = detectProfile()
  }
  return _profile
}

function parseHexColor(value: string): [number, number, number] | undefined {
  const raw = value.startsWith('#') ? value.slice(1) : value
  if (!/^[0-9a-f]{3}$/i.test(raw) && !/^[0-9a-f]{6}$/i.test(raw)) {
    return undefined
  }
  const expanded =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : raw
  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16)
  ]
}

function isByte(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 255
}

/** Returns the SGR opener string for a foreground color (no reset). */
export function foreground(hex: string): string
export function foreground(red: number, green: number, blue: number): string
export function foreground(redOrHex: number | string, green?: number, blue?: number): string {
  let red: number
  let greenValue: number
  let blueValue: number
  if (typeof redOrHex === 'string') {
    const rgb = parseHexColor(redOrHex)
    if (!rgb) {
      throw new TypeError('foreground() hex color must be #RGB, RGB, #RRGGBB, or RRGGBB')
    }
    red = rgb[0]
    greenValue = rgb[1]
    blueValue = rgb[2]
  } else {
    if (green === undefined || blue === undefined) {
      throw new TypeError('foreground() requires either a hex string or 3 RGB integers')
    }
    if (!isByte(redOrHex) || !isByte(green) || !isByte(blue)) {
      throw new RangeError('foreground() RGB values must be integers between 0 and 255')
    }
    red = redOrHex
    greenValue = green
    blueValue = blue
  }

  // Return the highest-fidelity SGR code for the given color based on the detected profile
  const p = getProfile()
  if (p === 'none') return ''
  if (p === 'truecolor') return `38;2;${red};${greenValue};${blueValue}`
  if (p === 'ansi256') return `38;5;${rgbToAnsi256(red, greenValue, blueValue)}`
  return ansi16Code(rgbToAnsi16(red, greenValue, blueValue))
}

/** Wraps text in SGR codes with reset. */
export function sgr(text: string, ...codes: string[]): string {
  const filtered = codes.filter(Boolean)
  if (filtered.length === 0 || getProfile() === 'none') return text
  return `${CSI}${filtered.join(';')}m${text}${RESET}`
}

/** Strip ANSI SGR codes from a string. */
function stripSGR(input: string): string {
  return input.replace(SGR_REGEX, '')
}

/** Wraps content lines in a rounded border with 2-space padding on each side. */
export function border(lines: string[], borderColor?: string): string[] {
  const paint = borderColor ? (s: string) => sgr(s, borderColor) : (s: string) => s

  // Measure visible widths
  const visibleWidths = lines.map((l) => stripSGR(l).length)
  const maxWidth = Math.max(...visibleWidths, 0)

  const top = paint(`╭${'─'.repeat(maxWidth + 4)}╮`)
  const bottom = paint(`╰${'─'.repeat(maxWidth + 4)}╯`)

  const middle = lines.map((line, i) => {
    const pad = maxWidth - visibleWidths[i]
    return `${paint('│')}  ${line}${' '.repeat(pad)}  ${paint('│')}`
  })

  return [top, ...middle, bottom]
}
