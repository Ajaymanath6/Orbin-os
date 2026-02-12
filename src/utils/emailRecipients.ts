const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

export interface ParsedRecipient {
  name: string
  company: string
  email: string
}

/**
 * Parse raw pasted text into recipient rows (name, company, email).
 * Supports lines like "Alice – Acme Corp – alice@acme.com" or tab-separated.
 */
export function parseRecipients(raw: string): ParsedRecipient[] {
  if (!raw?.trim()) return []
  const lines = raw.split(/\n/).map((l) => l.trim()).filter(Boolean)
  const rows: ParsedRecipient[] = []
  const sep = /[\t–—\-]\s*|\s{2,}/
  lines.forEach((line) => {
    const parts = line.split(sep).map((p) => p.trim()).filter(Boolean)
    const emailPart = parts.find((p) => EMAIL_REGEX.test(p)) || ''
    const name = parts[0] && parts[0] !== emailPart ? parts[0] : ''
    const company = parts[1] && parts[1] !== emailPart ? parts[1] : parts.length > 2 ? parts[1] : ''
    rows.push({
      name: name || '',
      company: company || '',
      email: emailPart,
    })
  })
  return rows
}
