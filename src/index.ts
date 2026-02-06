#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { styleText } from 'node:util'

import { parseCli } from './lib/cli.ts'
import { centralNow, formatDatePath, resolveDate } from './lib/date.ts'
import { extractErrorMessage, fetchJson } from './lib/fetch.ts'
import { mergeRepos, printList, type Repo } from './lib/format.ts'

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

const cli = parseCli(process.argv.slice(2), {
  name: programName,
  description: programDescription,
  version: programVersion
})

if (cli.type === 'exit') {
  process.exit(cli.code)
}

run(cli.date, cli.options).catch((err) => {
  console.error(`Error: ${err.message}`)
  process.exit(1)
})
