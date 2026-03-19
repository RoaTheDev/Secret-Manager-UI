import { useEffect, useState } from 'react'
import { Check, Copy, Download, Eye, EyeOff } from 'lucide-react'
import { IconButton, Tooltip } from '@mui/material'
import { codeToHtml } from 'shiki'
import { formatDistanceToNow } from 'date-fns'
import type { CredentialRevealResponse } from '@/commons/types/crendentialType'
import type { CredentialType } from '#/commons/constant/apiConstant.ts'

const LANGUAGE_MAP: Record<CredentialType, string> = {
  ENV_VAR: 'dotenv',
  NGINX_CONFIG: 'nginx',
  DOCKER_CONFIG: 'yaml',
  TERRAFORM: 'hcl',
  CONFIG_FILE: 'yaml',
  SSH_KEY: 'pem',
  DATABASE_URL: 'bash',
  TLS_CERT: 'pem',
  API_KEY: 'plaintext',
  OTHER: 'plaintext',
}

const EXTENSION_MAP: Record<CredentialType, string> = {
  ENV_VAR: '.env',
  NGINX_CONFIG: '.conf',
  DOCKER_CONFIG: 'docker-compose.yml',
  TERRAFORM: '.tf',
  CONFIG_FILE: '.yaml',
  SSH_KEY: '.pem',
  DATABASE_URL: '.txt',
  TLS_CERT: '.pem',
  API_KEY: '.txt',
  OTHER: '.txt',
}

export const CredentialViewer = ({
                                   credential,
                                 }: {
  credential: CredentialRevealResponse
}) => {
  const [revealed, setRevealed] = useState(false)
  const [html, setHtml] = useState('')
  const [copied, setCopied] = useState(false)
  const [highlighting, setHighlighting] = useState(false)

  const isExpired = credential.expiresAt
    ? new Date() > new Date(credential.expiresAt)
    : false

  useEffect(() => {
    if (!revealed) {
      setHtml('')
      return
    }

    setHighlighting(true)
    const lang = LANGUAGE_MAP[credential.type] ?? 'plaintext'

    codeToHtml(credential.value, {
      lang,
      theme: 'github-light',
    })
      .then(setHtml)
      .catch(() => setHtml(`<pre>${credential.value}</pre>`)) // fallback
      .finally(() => setHighlighting(false))
  }, [revealed, credential.value, credential.type])

  const handleCopy = () => {
    navigator.clipboard.writeText(credential.value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const handleDownload = () => {
    const cleanName = credential.name.replace(/[^a-z0-9_-]/gi, '_')
    const ext = EXTENSION_MAP[credential.type]
    const filename = `${cleanName}${ext}`
    const blob = new Blob([credential.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="border border-gray-200 rounded-[10px] overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-mono text-gray-500">{LANGUAGE_MAP[credential.type] ?? 'text'}</span>
          {credential.expiresAt && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                isExpired
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isExpired ? 'Expired' : `Expires ${formatDistanceToNow(new Date(credential.expiresAt), { addSuffix: true })}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Tooltip title={revealed ? 'Hide value' : 'Reveal value'}>
            <IconButton size="small" onClick={() => setRevealed((r) => !r)}>
              {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
            </IconButton>
          </Tooltip>

          {revealed && (
            <>
              <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                <IconButton size="small" onClick={handleCopy}>
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton size="small" onClick={handleDownload}>
                  <Download size={16} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {!revealed ? (
        <div className="px-6 py-5 bg-gray-50 font-mono text-lg tracking-widest select-none text-gray-300">
          {'••••••••••••••••••••••••••••••••••••••••'}
        </div>
      ) : highlighting ? (
        <div className="px-6 py-5 text-gray-400 min-h-[120px] flex items-center justify-center">
          Highlighting...
        </div>
      ) : (
        <div
          className="overflow-auto max-h-[500px] bg-white text-[13px] leading-relaxed p-5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  )
}