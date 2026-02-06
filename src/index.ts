#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { styleText } from 'node:util'

import { Command } from 'commander'

import { centralNow, formatDatePath, resolveDate } from './lib/date.ts'
import { extractErrorMessage, fetchJson } from './lib/fetch.ts'
import { mergeRepos, printList, type Repo, stripFinalNewline } from './lib/format.ts'

type NightlyData = {
  top_new?: Repo[]
  top_all?: Repo[]
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'))
const programName = pkg.name.replace(/-cli$/, '')
const programVersion = pkg.version
const programDescription = pkg.description

function buildUrl(date: Date): string {
  return `https://nightly.changelog.com/${formatDatePath(date)}/data.json`
}

async function run(dateStr: string | undefined, options: { limit?: string; color?: boolean }) {
  const date = resolveDate(dateStr)
  const url = buildUrl(date)
  const useColor = options.color !== false

  const result = await fetchJson(url)

  if (!result.ok) {
    const msg = result.status === 404 ? `Not Found: ${url}` : extractErrorMessage(result)
    console.error(`${programName}: ${msg}`)
    process.exit(1)
  }

  const data = result.data as NightlyData
  const topNew = data.top_new ?? []
  const topAll = data.top_all ?? []
  const combined = mergeRepos(topNew, topAll)

  const nowDate = centralNow()
  const limit = options.limit ? parseInt(options.limit, 10) : undefined

  const appTitle = 'CHANGELOG NIGHTLY'
  const appLink = url.replace('/data.json', '')

  console.log(appTitle)
  console.log(useColor ? styleText('gray', appLink) : appLink)

  if (combined.length > 0) {
    const rule = '─'.repeat(appLink.length)
    console.log(useColor ? styleText(['dim', 'gray'], rule) : rule)
    console.log()
  }

  printList(combined, nowDate, useColor, limit)
}

const program = new Command()

program
  .name(programName)
  .description(programDescription)
  .version(programVersion, '-v, --version')
  .argument('[date]', 'YYYYMMDD, YYYY-MM-DD, or YYYY/MM/DD')
  .option('-l, --limit <number>', 'limit number of repos displayed')
  .option('--no-color', 'disable ANSI colors in output')

program.configureOutput({
  writeOut: (str) => process.stdout.write(stripFinalNewline(str)),
  writeErr: (str) => process.stderr.write(stripFinalNewline(str))
})

program.addHelpText(
  'after',
  `
Examples:
  ${programName}               Show most recent trending repos
  ${programName} 20250115      Show repos for January 15, 2025
  ${programName} 2025-01-15    Same, with dashes
  ${programName} 2025/01/15    Same, with slashes
  ${programName} -l 5          Limit output to 5 repos
`
)

program.action(async (dateArg: string | undefined, options) => {
  await run(dateArg, options)
})

program.parseAsync().catch((err) => {
  console.error(`Error: ${err.message}`)
  process.exit(1)
})
