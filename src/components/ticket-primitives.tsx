import type * as React from "react"
import { ClockIcon, FrownIcon, MehIcon, SmileIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getClassificationPresentation,
  getPriorityPresentation,
  getSlaPresentation,
  getStatusPresentation,
} from "@/lib/ticket-presentation"
import { cn } from "@/lib/utils"

function Dot({ className }: { className?: string }) {
  return <span className={cn("size-1.5 shrink-0 rounded-full bg-current", className)} />
}

export function PriorityBadge({
  priority,
  compact = false,
  className,
}: {
  priority: number | string | null | undefined
  compact?: boolean
  className?: string
}) {
  const meta = getPriorityPresentation(priority)

  return (
    <Badge className={cn("border-transparent font-semibold tabular-nums", meta.className, className)}>
      {compact ? meta.short : meta.label}
    </Badge>
  )
}

export function ClassificationBadge({
  classification,
  compact = false,
  className,
}: {
  classification: number | string | null | undefined
  compact?: boolean
  className?: string
}) {
  const meta = getClassificationPresentation(classification)

  return (
    <Badge
      className={cn(
        "border-transparent bg-[color:var(--relay-accent-soft)] text-[color:var(--relay-accent-text)]",
        className
      )}
    >
      {compact ? meta.compactLabel : meta.label}
    </Badge>
  )
}

export function StatusPill({
  status,
  className,
}: {
  status: string | null | undefined
  className?: string
}) {
  const meta = getStatusPresentation(status)

  return (
    <Badge className={cn("rounded-full border-transparent px-2.5", meta.className, className)}>
      <Dot />
      {meta.label}
    </Badge>
  )
}

export function SlaBadge({
  deadline,
  status,
  now = new Date(),
  className,
}: {
  deadline?: Date | string | null
  status?: string | null
  now?: Date
  className?: string
}) {
  const state = getSlaPresentation(deadline, status, now)

  if (!state.icon) {
    return (
      <Badge variant="ghost" className={cn(state.className, className)}>
        {state.label}
      </Badge>
    )
  }

  return (
    <Badge className={cn("border-transparent tabular-nums", state.className, className)}>
      <ClockIcon className="size-3" />
      {state.label}
    </Badge>
  )
}

const sentimentMeta = {
  frustrated: {
    label: "Frustrated",
    icon: FrownIcon,
    className: "text-[color:var(--relay-bad)]",
  },
  neutral: {
    label: "Neutral",
    icon: MehIcon,
    className: "text-muted-foreground",
  },
  calm: {
    label: "Calm",
    icon: SmileIcon,
    className: "text-[color:var(--relay-good)]",
  },
} as const

export function SentimentChip({
  sentiment,
  className,
}: {
  sentiment?: keyof typeof sentimentMeta | string | null
  className?: string
}) {
  if (!sentiment) return null

  const meta = sentimentMeta[sentiment as keyof typeof sentimentMeta]
  if (!meta) return null

  const Icon = meta.icon

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", meta.className, className)}>
      <Icon className="size-3" />
      {meta.label}
    </span>
  )
}

export function FilterChip({
  active,
  children,
  className,
  removable,
  ...props
}: React.ComponentProps<typeof Button> & {
  active?: boolean
  removable?: boolean
}) {
  return (
    <Button
      size="sm"
      variant={active ? "default" : "outline"}
      className={cn(
        "h-[30px] rounded-md px-3 text-[12.5px]",
        active && "border-foreground bg-foreground text-background hover:bg-foreground",
        className
      )}
      {...props}
    >
      {children}
      {removable ? <XIcon className="size-3 opacity-70" /> : null}
    </Button>
  )
}
