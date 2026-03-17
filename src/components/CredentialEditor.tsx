import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { lintGutter } from '@codemirror/lint'
import { yaml } from '@codemirror/lang-yaml'
import { getLinterExtension } from '@/lib/linters'
import type { CredentialType } from '@/commons/constant/apiConstant'

const getLanguageExtension = (type: CredentialType) => {
  switch (type) {
    case 'CONFIG_FILE':
    case 'DOCKER_CONFIG':
      return yaml()
    case 'ENV_VAR':
    case 'TERRAFORM':
    case 'NGINX_CONFIG':
    case 'SSH_KEY':
    case 'TLS_CERT':
    case 'DATABASE_URL':
    case 'API_KEY':
    case 'OTHER':
    default:
      return null
  }
}

interface CredentialEditorProps {
  value: string
  type: CredentialType
  onChange: (value: string) => void
  error?: boolean
}

export const CredentialEditor = ({
  value,
  type,
  onChange,
  error = false,
}: CredentialEditorProps) => {
  const extensions = useMemo(() => {
    const exts = [lintGutter()]

    const lang = getLanguageExtension(type)
    const linter = getLinterExtension(type)

    if (lang) exts.push(lang)
    if (linter) exts.push(linter)

    return exts
  }, [type])

  return (
    <div
      className={[
        'rounded-lg overflow-hidden transition-colors',
        error ? 'outline outline-2 outline-danger-base' : 'outline-none',
      ].join(' ')}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          autocompletion: false,
        }}
        theme="light"
        style={{ fontSize: '13px' }}
      />
    </div>
  )
}