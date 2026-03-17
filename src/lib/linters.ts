import { type Diagnostic, linter } from '@codemirror/lint'
import { EditorView } from '@codemirror/view'
import * as yaml from 'js-yaml'
import * as toml from 'toml'
import type { CredentialType } from '@/commons/constant/apiConstant'

const envLinter = linter((view: EditorView): Diagnostic[] => {
  const diagnostics: Diagnostic[] = []
  let pos = 0

  for (const line of view.state.doc.toString().split('\n')) {
    const trimmed = line.trim()
    const isEmpty = trimmed === ''
    const isComment = trimmed.startsWith('#')
    const isValid = /^[A-Z_][A-Z0-9_]*=.*/i.test(trimmed)

    if (!isEmpty && !isComment && !isValid) {
      diagnostics.push({
        from: pos,
        to: pos + line.length,
        severity: 'warning',
        message: 'Expected KEY=VALUE format (e.g. DB_HOST=localhost)',
      })
    }
    pos += line.length + 1
  }

  return diagnostics
})

const yamlLinter = linter((view: EditorView): Diagnostic[] => {
  try {
    yaml.load(view.state.doc.toString())
    return []
  } catch (e: unknown) {
    if (e instanceof yaml.YAMLException) {
      const pos = e.mark?.position ?? 0
      return [
        {
          from: pos,
          to: pos + 1,
          severity: 'error',
          message: e.reason ?? e.message,
        },
      ]
    }
    return []
  }
})

const dockerLinter = linter((view: EditorView): Diagnostic[] => {
  const value = view.state.doc.toString()
  try {
    const parsed = yaml.load(value) as Record<string, unknown> | null
    if (parsed && !parsed.services) {
      return [
        {
          from: 0,
          to: Math.min(value.indexOf('\n'), value.length),
          severity: 'warning',
          message: "Docker Compose file should have a 'services' key",
        },
      ]
    }
    return []
  } catch (e: unknown) {
    if (e instanceof yaml.YAMLException) {
      const pos = e.mark?.position ?? 0
      return [
        {
          from: pos,
          to: pos + 1,
          severity: 'error',
          message: e.reason ?? e.message,
        },
      ]
    }
    return []
  }
})

interface TomlError {
  line?: number
  column?: number
  message: string
}

const terraformLinter = linter((view: EditorView): Diagnostic[] => {
  try {
    toml.parse(view.state.doc.toString())
    return []
  } catch (e: unknown) {
    const err = e as TomlError
    const lines = view.state.doc.toString().split('\n')
    const line = (err.line ?? 1) - 1
    const col = (err.column ?? 1) - 1
    const from =
      lines.slice(0, line).reduce((acc, l) => acc + l.length + 1, 0) + col

    return [
      {
        from,
        to: from + (lines[line]?.length ?? 1),
        severity: 'error',
        message: err.message,
      },
    ]
  }
})

const nginxLinter = linter((view: EditorView): Diagnostic[] => {
  const value = view.state.doc.toString()
  const diagnostics: Diagnostic[] = []
  const stack: number[] = []

  for (let i = 0; i < value.length; i++) {
    if (value[i] === '{') {
      stack.push(i)
    } else if (value[i] === '}') {
      if (stack.length === 0) {
        diagnostics.push({
          from: i,
          to: i + 1,
          severity: 'error',
          message: 'Unexpected closing brace — no matching opening brace',
        })
      } else {
        stack.pop()
      }
    }
  }

  for (const pos of stack) {
    diagnostics.push({
      from: pos,
      to: pos + 1,
      severity: 'error',
      message: 'Unclosed block — missing closing brace',
    })
  }

  return diagnostics
})

const databaseUrlLinter = linter((view: EditorView): Diagnostic[] => {
  const value = view.state.doc.toString().trim()
  if (!value) return []

  const known =
    /^(postgresql|postgres|mysql|mongodb(\+srv)?|redis|sqlite):\/\//i
  if (!known.test(value)) {
    return [
      {
        from: 0,
        to: value.length,
        severity: 'warning',
        message:
          'Expected a connection string (e.g. postgresql://user:pass@host:5432/db)',
      },
    ]
  }
  return []
})

const sshKeyLinter = linter((view: EditorView): Diagnostic[] => {
  const value = view.state.doc.toString().trim()
  if (!value) return []

  const hasPemHeader = /-----BEGIN .+-----/.test(value)
  const hasPemFooter = /-----END .+-----/.test(value)

  if (!hasPemHeader) {
    return [
      {
        from: 0,
        to: Math.min(value.indexOf('\n'), value.length),
        severity: 'warning',
        message:
          'SSH key should start with a PEM header (e.g. -----BEGIN OPENSSH PRIVATE KEY-----)',
      },
    ]
  }

  if (!hasPemFooter) {
    return [
      {
        from: value.lastIndexOf('\n') + 1,
        to: value.length,
        severity: 'warning',
        message:
          'SSH key appears to be missing its closing footer (-----END ... -----)',
      },
    ]
  }

  return []
})

const tlsCertLinter = linter((view: EditorView): Diagnostic[] => {
  const value = view.state.doc.toString().trim()
  if (!value) return []

  const hasCert = /-----BEGIN CERTIFICATE-----/.test(value)
  const hasKey =
    /-----BEGIN (RSA |EC |PRIVATE )?PRIVATE KEY-----/.test(value) ||
    /-----BEGIN ENCRYPTED PRIVATE KEY-----/.test(value)

  if (!hasCert && !hasKey) {
    return [
      {
        from: 0,
        to: Math.min(value.indexOf('\n'), value.length),
        severity: 'warning',
        message:
          'Expected a PEM certificate (-----BEGIN CERTIFICATE-----) or private key',
      },
    ]
  }

  return []
})

const apiKeyLinter = linter((view: EditorView): Diagnostic[] => {
  const value = view.state.doc.toString()
  if (!value.trim()) return []

  const lines = value.split('\n').filter((l) => l.trim() !== '')

  if (lines.length > 1) {
    return [
      {
        from: 0,
        to: value.length,
        severity: 'warning',
        message: 'API key should be a single line — multiple lines detected',
      },
    ]
  }

  if (/\s/.test(value.trim())) {
    return [
      {
        from: 0,
        to: value.length,
        severity: 'warning',
        message: 'API key should not contain spaces or whitespace',
      },
    ]
  }

  return []
})

export const getLinterExtension = (type: CredentialType) => {
  switch (type) {
    case 'ENV_VAR':
      return envLinter
    case 'CONFIG_FILE':
      return yamlLinter
    case 'DOCKER_CONFIG':
      return dockerLinter
    case 'TERRAFORM':
      return terraformLinter
    case 'NGINX_CONFIG':
      return nginxLinter
    case 'DATABASE_URL':
      return databaseUrlLinter
    case 'SSH_KEY':
      return sshKeyLinter
    case 'TLS_CERT':
      return tlsCertLinter
    case 'API_KEY':
      return apiKeyLinter
    case 'OTHER':
      return null
    default:
      return null
  }
}
