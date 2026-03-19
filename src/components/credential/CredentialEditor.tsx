import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { lintGutter } from '@codemirror/lint'
import { yaml } from '@codemirror/lang-yaml'
import { javascript } from '@codemirror/lang-javascript'
import { getLinterExtension } from '#/lib/linters.ts'
import type { CredentialType } from '#/commons/constant/apiConstant.ts'
import { nginx } from '@codemirror/legacy-modes/mode/nginx'
import { StreamLanguage } from '@codemirror/language'

const getLanguageExtension = (type: CredentialType) => {
  switch (type) {
    case 'CONFIG_FILE':
    case 'DOCKER_CONFIG':
      return yaml()

    case 'NGINX_CONFIG':
      return StreamLanguage.define(nginx)

    case 'TERRAFORM':
      return javascript({ jsx: false })

    case 'ENV_VAR':
      return javascript({ jsx: false })

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
  linter?: any
}

export const CredentialEditor = ({
  value,
  type,
  onChange,
  error = false,
  linter,
}: CredentialEditorProps) => {
  const extensions = useMemo(() => {
    const exts = [lintGutter()]

    const lang = getLanguageExtension(type)
    if (lang) exts.push(lang)

    if (linter) {
      exts.push(linter)
    } else {
      const customLinter = getLinterExtension(type)
      if (customLinter) exts.push(customLinter)
    }

    return exts
  }, [type, linter])

  return (
    <div
      className={[
        'rounded-lg overflow-hidden border transition-colors',
        error ? 'border-2 border-red-500' : 'border border-gray-200',
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
          indentOnInput: true,
        }}
        theme="light"
        style={{ fontSize: '13px', minHeight: '180px' }}
      />
    </div>
  )
}
