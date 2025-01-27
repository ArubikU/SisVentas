import { useTheme } from "../contexts/ThemeContext"
import { translations, type TranslationKey } from "../translations"

interface LangProps {
  text: TranslationKey
  args?: Record<string, string>
}

export function Lang({ text, args }: LangProps) {
  const { language } = useTheme()

  if (!(text in translations[language])) {
    return <>{text}</>
  }

  const translatedText = (translations[language] as Record<TranslationKey, string>)[text]
  const formattedText = formatText(translatedText, args)

  return <>{formattedText}</>
}

export function getTranslation(text: TranslationKey, args?: Record<string, string>) {
  const { language } = useTheme()

  if (!(text in translations[language])) {
    return text
  }

  const translatedText = (translations[language] as Record<TranslationKey, string>)[text]
  return formatText(translatedText, args)
}

function formatText(template: string, args?: Record<string, string>): string {
  if (!args) {
    return template
  }

  return template.replace(/{(\w+)}/g, (_, key) => args[key] || `{${key}}`)
}
