export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null

  return <span className="text-xs text-red-600">{messages[0]}</span>
}
