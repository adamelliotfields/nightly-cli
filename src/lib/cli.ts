export type CliConfig = {
  name: string
  description: string
  version: string
}

export type CliOptions = {
  limit?: string
  color?: boolean
}

export type CliResult =
  | {
      type: 'run'
      date?: string
      options: CliOptions
    }
  | {
      type: 'exit'
      code: number
    }

function helpText(config: CliConfig): string {
  return `Usage: ${config.name} [options] [date]

${config.description}

Arguments:
  date                  YYYYMMDD, YYYY-MM-DD, or YYYY/MM/DD

Options:
  -v, --version         output the version number
  -l, --limit <number>  limit number of repos displayed
  --no-color            disable ANSI colors in output
  -h, --help            display help for command

Examples:
  ${config.name}               Show most recent trending repos
  ${config.name} 20250115      Show repos for January 15, 2025
  ${config.name} 2025-01-15    Same, with dashes
  ${config.name} 2025/01/15    Same, with slashes
  ${config.name} -l 5          Limit output to 5 repos`
}

function fail(config: CliConfig, message: string): CliResult {
  console.error(`Error: ${message}\nRun '${config.name} --help' for usage.`)
  return { type: 'exit', code: 1 }
}

export function parseCli(args: string[], config: CliConfig): CliResult {
  const options: CliOptions = {}
  let date: string | undefined

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === '--') {
      const rest = args.slice(index + 1)
      if (rest.length > 1) return fail(config, 'too many arguments')
      if (rest.length === 1) {
        if (date) return fail(config, 'too many arguments')
        date = rest[0]
      }
      break
    }

    if (arg === '--help' || arg === '-h') {
      console.log(helpText(config))
      return { type: 'exit', code: 0 }
    }

    if (arg === '--version' || arg === '-v') {
      console.log(config.version)
      return { type: 'exit', code: 0 }
    }

    if (arg === '--no-color') {
      options.color = false
      continue
    }

    if (arg === '--limit' || arg === '-l') {
      const value = args[index + 1]
      if (!value || value.startsWith('-')) {
        return fail(config, 'missing value for --limit')
      }
      options.limit = value
      index += 1
      continue
    }

    if (arg.startsWith('--limit=')) {
      const value = arg.slice('--limit='.length)
      if (!value) return fail(config, 'missing value for --limit')
      options.limit = value
      continue
    }

    if (arg.startsWith('-l') && arg.length > 2) {
      options.limit = arg.slice(2)
      continue
    }

    if (arg.startsWith('-')) return fail(config, `unknown option '${arg}'`)
    if (date) return fail(config, 'too many arguments')

    date = arg
  }

  return { type: 'run', date, options }
}
