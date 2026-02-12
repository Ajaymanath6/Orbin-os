import { useState, useEffect, useMemo } from 'react'
import {
  RiMailLine,
  RiUserLine,
  RiFileTextLine,
  RiPencilLine,
  RiEyeLine,
  RiSendPlaneLine,
  RiCheckLine,
  RiEditLine,
} from '@remixicon/react'

import { parseRecipients as parseRecipientsUtil, type ParsedRecipient } from '../utils/emailRecipients'

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

export interface RecipientRow {
  id: string
  name: string
  company: string
  email: string
  notes: string
  status: 'Ready' | 'Missing'
}

export interface EmailFlowData {
  purpose?: string
  recipientCount?: string
  rawRecipients?: string
  tone?: string
  commonContent?: string
  ready?: boolean
}

interface PersonalizedEmail {
  recipientId: string
  name: string
  company: string
  subject: string
  body: string
  accepted: boolean
}

interface EmailStep {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed'
}

const STEP_IDS = ['define-recipients', 'draft-base', 'personalize', 'review', 'send-emails'] as const
const STEP_TITLES = ['Define recipients', 'Draft base email', 'Personalize per client', 'Review & approve', 'Send emails']

function parseRecipients(raw: string): RecipientRow[] {
  const parsed = parseRecipientsUtil(raw)
  return parsed.map((p: ParsedRecipient, i: number) => ({
    id: `r-${i}-${Date.now()}`,
    name: p.name,
    company: p.company,
    email: p.email,
    notes: '',
    status: p.email && p.name.length >= 2 ? 'Ready' : 'Missing',
  }))
}

function defaultJobApplicationTemplate(purpose: string, commonContent: string): string {
  const roleOrIntro = purpose?.trim() || '[Role/position you are applying for]'
  return `Dear Hiring Manager,

I am writing to apply for ${roleOrIntro} at {{company_name}}. I am excited about the opportunity to contribute to your team.

${commonContent ? `${commonContent}\n\n` : ''}I would welcome the chance to discuss my background and how I can add value. Thank you for your consideration.

Best regards,
{{your_name}}`
}

interface SendGroupEmailsPageProps {
  emailFlowData?: EmailFlowData | null
  isReady?: boolean
  onStepsUpdate?: (steps: EmailStep[]) => void
  onRequestSend?: (count: number) => void
  /** When set (e.g. timestamp), parent has authorized send; run simulated send and update progress. */
  sendAuthorizedAt?: number
}

export default function SendGroupEmailsPage({
  emailFlowData,
  isReady = false,
  onStepsUpdate,
  onRequestSend,
  sendAuthorizedAt,
}: SendGroupEmailsPageProps) {
  const [steps, setSteps] = useState<EmailStep[]>(() =>
    STEP_IDS.map((id, i) => ({
      id,
      title: STEP_TITLES[i],
      status: (i === 0 ? 'in-progress' : 'pending') as 'pending' | 'in-progress' | 'completed',
    }))
  )
  const [recipients, setRecipients] = useState<RecipientRow[]>([])
  const [baseSubject, setBaseSubject] = useState('')
  const [baseBody, setBaseBody] = useState('')
  const [personalized, setPersonalized] = useState<PersonalizedEmail[]>([])
  const [sendProgress, setSendProgress] = useState<{ current: number; total: number; done: boolean }>({ current: 0, total: 0, done: false })
  const [notesByRecipientId, setNotesByRecipientId] = useState<Record<string, string>>({})

  // Parse recipients when raw data is available
  useEffect(() => {
    if (emailFlowData?.rawRecipients) {
      const parsed = parseRecipients(emailFlowData.rawRecipients)
      setRecipients(parsed)
    }
  }, [emailFlowData?.rawRecipients])

  // Initial draft: job application template from purpose and commonContent
  useEffect(() => {
    if (!emailFlowData?.purpose || baseBody) return
    const body = defaultJobApplicationTemplate(
      emailFlowData.purpose,
      emailFlowData.commonContent || ''
    )
    setBaseBody(body)
    if (!baseSubject) {
      const role = emailFlowData.purpose.slice(0, 30) + (emailFlowData.purpose.length > 30 ? '...' : '')
      setBaseSubject(`Application for ${role} at {{company_name}} – {{your_name}}`)
    }
  }, [emailFlowData?.purpose, emailFlowData?.commonContent])

  // Generate personalized variants when recipients and template are ready
  const personalizedList = useMemo(() => {
    if (recipients.length === 0 || !baseBody || !baseSubject) return []
    return recipients.map((r) => {
      const existing = personalized.find((p) => p.recipientId === r.id)
      if (existing) return existing
      const body = baseBody
        .replace(/\{\{first_name\}\}/gi, r.name || 'there')
        .replace(/\{\{company_name\}\}/gi, r.company || 'your company')
        .replace(/\{\{your_name\}\}/gi, 'Your Name')
      return {
        recipientId: r.id,
        name: r.name,
        company: r.company,
        subject: baseSubject.replace(/\{\{.*?\}\}/g, (m) => {
          if (m.toLowerCase().includes('company')) return r.company || ''
          if (m.toLowerCase().includes('first')) return r.name || ''
          return m
        }),
        body,
        accepted: false,
      }
    })
  }, [recipients, baseBody, baseSubject, personalized])

  useEffect(() => {
    if (personalizedList.length > 0 && personalized.length !== personalizedList.length) {
      setPersonalized(personalizedList)
    }
  }, [personalizedList])

  const markStepComplete = (stepIndex: number) => {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i === stepIndex) return { ...s, status: 'completed' as const }
        if (i === stepIndex + 1) return { ...s, status: 'in-progress' as const }
        return s
      })
    )
  }

  useEffect(() => {
    onStepsUpdate?.(steps)
  }, [steps, onStepsUpdate])

  const allAccepted = personalized.length > 0 && personalized.every((p) => p.accepted)
  const completedCount = steps.filter((s) => s.status === 'completed').length

  // When parent authorizes send, run simulated progress and mark step 5 complete
  useEffect(() => {
    if (!sendAuthorizedAt || personalized.length === 0) return
    setSendProgress({ current: 0, total: personalized.length, done: false })
    let current = 0
    const total = personalized.length
    const id = setInterval(() => {
      current += 1
      setSendProgress((prev) => ({ ...prev, current, done: current >= total }))
      if (current >= total) {
        clearInterval(id)
        setSteps((prev) =>
          prev.map((s, i) => (i === 4 ? { ...s, status: 'completed' as const } : s))
        )
      }
    }, 400)
    return () => clearInterval(id)
  }, [sendAuthorizedAt])

  if (!isReady) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <RiMailLine size={40} className="text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Waiting for your input</h3>
        <p className="text-gray-600 text-center max-w-md">
          Answer the Orbin agent&apos;s questions in the chat panel. Your answers will be used to build a draft and recipient list in this workspace.
        </p>
        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>Orbin is asking questions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white min-h-full p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
            <RiMailLine size={24} className="text-gray-700" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Send Group Emails</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {emailFlowData?.purpose || 'Group outreach'} · {recipients.length} recipients
            </p>
          </div>
        </div>
      </div>

      {/* Card 1: Define recipients */}
      <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {steps[0].status === 'completed' ? <RiCheckLine className="text-green-600" size={20} /> : <RiUserLine size={20} className="text-gray-500" />}
            Define recipients
          </h2>
          {steps[0].status === 'completed' && <span className="text-sm text-green-600 font-medium">Completed</span>}
        </div>
        {recipients.length > 0 && (
          <p className="text-sm text-gray-600 mb-3">Review and edit the list below. Fix any missing name or email before continuing.</p>
        )}
        {recipients.length === 0 ? (
          <p className="text-sm text-gray-500">No recipients parsed yet. Use the chat to paste recipient details (e.g. Name – Company – email@company.com).</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-600">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Company</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Notes</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((r) => {
                    const updateStatus = (name: string, email: string) =>
                      email && name.length >= 2 ? 'Ready' : 'Missing'
                    return (
                      <tr key={r.id} className="border-b border-gray-100">
                        <td className="py-2 pr-4">
                          <input
                            type="text"
                            className="w-full min-w-[80px] max-w-[160px] border border-gray-200 rounded px-2 py-1 text-xs"
                            placeholder="Name"
                            value={r.name}
                            onChange={(e) => {
                              const name = e.target.value
                              setRecipients((prev) =>
                                prev.map((x) =>
                                  x.id === r.id
                                    ? { ...x, name, status: updateStatus(name, x.email) }
                                    : x
                                )
                              )
                            }}
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input
                            type="text"
                            className="w-full min-w-[80px] max-w-[160px] border border-gray-200 rounded px-2 py-1 text-xs"
                            placeholder="Company"
                            value={r.company}
                            onChange={(e) =>
                              setRecipients((prev) =>
                                prev.map((x) => (x.id === r.id ? { ...x, company: e.target.value } : x))
                              )
                            }
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input
                            type="text"
                            className="w-full min-w-[120px] max-w-[200px] border border-gray-200 rounded px-2 py-1 text-xs"
                            placeholder="email@company.com"
                            value={r.email}
                            onChange={(e) => {
                              const email = e.target.value
                              setRecipients((prev) =>
                                prev.map((x) =>
                                  x.id === r.id
                                    ? { ...x, email, status: updateStatus(x.name, email) }
                                    : x
                                )
                              )
                            }}
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input
                            type="text"
                            className="w-full max-w-[140px] border border-gray-200 rounded px-2 py-1 text-xs"
                            placeholder="e.g. met at conference"
                            value={notesByRecipientId[r.id] ?? r.notes}
                            onChange={(e) => setNotesByRecipientId((prev) => ({ ...prev, [r.id]: e.target.value }))}
                          />
                        </td>
                        <td className="py-2">
                          <span className={r.status === 'Ready' ? 'text-green-600' : 'text-amber-600'}>{r.status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {steps[0].status !== 'completed' && (
              <button
                type="button"
                onClick={() => markStepComplete(0)}
                className="mt-3 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black"
              >
                Confirm recipients
              </button>
            )}
          </>
        )}
      </section>

      {/* Card 2: Draft base email */}
      <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {steps[1].status === 'completed' ? <RiCheckLine className="text-green-600" size={20} /> : <RiFileTextLine size={20} className="text-gray-500" />}
            Draft base email
          </h2>
          <div className="flex items-center gap-2">
            {steps[1].status === 'completed' && (
              <button
                type="button"
                onClick={() => setSteps((prev) => prev.map((s, i) => (i === 1 ? { ...s, status: 'in-progress' as const } : s)))}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium"
              >
                <RiEditLine size={14} />
                Edit
              </button>
            )}
            {steps[1].status === 'completed' && <span className="text-sm text-green-600 font-medium">Completed</span>}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={baseSubject}
              onChange={(e) => setBaseSubject(e.target.value)}
              placeholder="Subject line"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Body
            </label>
            <p className="text-xs text-gray-500 mb-1">
              {'Placeholders {{first_name}}, {{company_name}}, and {{your_name}} will be filled per recipient.'}
            </p>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[180px]"
              value={baseBody}
              onChange={(e) => setBaseBody(e.target.value)}
              placeholder="Email body..."
            />
          </div>
          {steps[1].status !== 'completed' && (
            <button
              type="button"
              onClick={() => markStepComplete(1)}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black"
            >
              Use this draft
            </button>
          )}
        </div>
      </section>

      {/* Card 3: Personalize per client – one master draft + table (no Completed state) */}
      <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <RiPencilLine size={20} className="text-gray-500" />
            One draft for all – personalize subjects
          </h2>
        </div>
        {personalized.length === 0 ? (
          <p className="text-sm text-gray-500">Complete &quot;Draft base email&quot; first to generate personalized subjects.</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">Same body for everyone; subjects are personalized per recipient below.</p>
            <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Master draft (same body for all)</p>
              <p className="text-xs text-gray-700 whitespace-pre-wrap max-h-[120px] overflow-y-auto">{baseBody}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-600">
                    <th className="py-2 pr-4">Recipient</th>
                    <th className="py-2 pr-4">Company</th>
                    <th className="py-2 pr-4">Subject</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {personalized.map((p) => (
                    <tr key={p.recipientId} className="border-b border-gray-100">
                      <td className="py-2 pr-4">{p.name}</td>
                      <td className="py-2 pr-4">{p.company}</td>
                      <td className="py-2 pr-4 max-w-[200px] truncate">{p.subject}</td>
                      <td className="py-2">
                        {p.accepted ? (
                          <span className="text-green-600 text-xs font-medium">Accepted</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setPersonalized((prev) =>
                                prev.map((x) => (x.recipientId === p.recipientId ? { ...x, accepted: true } : x))
                              )
                            }
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Accept
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!allAccepted && (
              <button
                type="button"
                onClick={() => setPersonalized((prev) => prev.map((p) => ({ ...p, accepted: true })))}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                Accept all
              </button>
            )}
            {steps[2].status !== 'completed' && allAccepted && (
              <button
                type="button"
                onClick={() => markStepComplete(2)}
                className="mt-3 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black"
              >
                Done
              </button>
            )}
          </>
        )}
      </section>

      {/* Card 4: Review & approve */}
      <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {steps[3].status === 'completed' ? <RiCheckLine className="text-green-600" size={20} /> : <RiEyeLine size={20} className="text-gray-500" />}
            Review & approve
          </h2>
          {steps[3].status === 'completed' && !sendProgress.done && <span className="text-sm text-green-600 font-medium">Approved</span>}
        </div>
        {personalized.length === 0 ? (
          <p className="text-sm text-gray-500">Complete personalization first.</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">All emails use the same body; subjects and recipients are listed below. Review and authorize send when ready.</p>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-600">
                    <th className="py-2 pr-4">Recipient</th>
                    <th className="py-2 pr-4">Company</th>
                    <th className="py-2 pr-4">Subject</th>
                    <th className="py-2">Send time</th>
                  </tr>
                </thead>
                <tbody>
                  {personalized.map((p) => (
                    <tr key={p.recipientId} className="border-b border-gray-100">
                      <td className="py-2 pr-4">{p.name}</td>
                      <td className="py-2 pr-4">{p.company}</td>
                      <td className="py-2 pr-4 max-w-[200px] truncate">{p.subject}</td>
                      <td className="py-2">Send now</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mb-3">Ready to send {personalized.length} emails. Do you want to proceed?</p>
            {steps[3].status !== 'completed' && (
              <button
                type="button"
                onClick={() => {
                  markStepComplete(3)
                  onRequestSend?.(personalized.length)
                }}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black"
              >
                Authorize & send
              </button>
            )}
          </>
        )}
      </section>

      {/* Card 5: Send emails */}
      <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {steps[4].status === 'completed' ? <RiCheckLine className="text-green-600" size={20} /> : <RiSendPlaneLine size={20} className="text-gray-500" />}
            Send emails
          </h2>
          {sendProgress.done && <span className="text-sm text-green-600 font-medium">All sent</span>}
        </div>
        {sendProgress.total > 0 && (
          <>
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Sending {sendProgress.current} / {sendProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-800 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${sendProgress.total ? (sendProgress.current / sendProgress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="space-y-1 text-sm">
              {personalized.map((p, i) => (
                <div key={p.recipientId} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className={sendProgress.done || sendProgress.current > i ? 'text-green-600' : 'text-gray-500'}>
                    {sendProgress.done || sendProgress.current > i ? '✓ Sent' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
            {sendProgress.done && (
              <p className="mt-2 text-xs text-gray-500">Track replies in a future version.</p>
            )}
          </>
        )}
        {sendProgress.total === 0 && steps[4].status === 'pending' && (
          <p className="text-sm text-gray-500">After you authorize send in the step above, emails will be sent here and progress will appear below.</p>
        )}
      </section>

      {/* Progress summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Progress Summary</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="text-sm font-medium text-gray-900">
              {completedCount} / {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-700 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

