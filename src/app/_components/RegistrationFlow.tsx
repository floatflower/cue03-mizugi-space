"use client"

import { useState, useRef } from "react"
import { gql } from "@apollo/client"
import { useQuery, useMutation } from "@apollo/client/react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useNewebPay from "@/hooks/use-newebpay"

const SESSIONS_QUERY = gql`
  query Sessions {
    sessions {
      id
      date
      startTime
      endTime
      capacity
      registeredCount
      available
    }
  }
`

const CREATE_REGISTRATION = gql`
  mutation CreateRegistration($data: CreateRegistrationData!) {
    createRegistration(data: $data) {
      registrationId
      payment {
        merchantId
        tradeInfo
        tradeSha
      }
    }
  }
`

interface Session {
  id: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  registeredCount: number
  available: number
}

const schema = yup.object({
  name: yup.string().required("請輸入姓名"),
  phone: yup
    .string()
    .required("請輸入電話")
    .matches(/^[\d\s\-+()]{8,20}$/, "請輸入有效的電話號碼"),
  email: yup.string().email("請輸入有效的電子郵件").required("請輸入電子郵件"),
})

type FormData = yup.InferType<typeof schema>

const DATES = [
  { key: "2026-06-13", label: "6/13 (六)" },
  { key: "2026-06-14", label: "6/14 (日)" },
] as const

const HOURS = ["11", "13", "14", "15"]

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3">
      {([1, 2] as const).map((n, i) => (
        <div key={n} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                step === n
                  ? "bg-primary text-primary-foreground"
                  : step > n
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {step > n ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                n
              )}
            </div>
            <span
              className={cn(
                "text-sm",
                step === n
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {n === 1 ? "選擇梯次" : "填寫資料"}
            </span>
          </div>
          {i === 0 && (
            <div
              className={cn(
                "h-px w-8 transition-colors",
                step > 1 ? "bg-primary/40" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function RegistrationFlow() {
  const [step, setStep] = useState<1 | 2>(1)
  const [activeDate, setActiveDate] = useState<"2026-06-13" | "2026-06-14">(
    "2026-06-13"
  )
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const pendingPayment = useRef(false)
  const { submitTransaction } = useNewebPay()

  const { data, loading: sessionsLoading } = useQuery<{ sessions: Session[] }>(
    SESSIONS_QUERY,
    {
      pollInterval: 30000,
    }
  )

  const [createRegistration, { loading: submitting }] =
    useMutation(CREATE_REGISTRATION)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  })

  const sessions = data?.sessions ?? []
  const filteredSessions = sessions.filter((s) => s.date === activeDate)
  const selectedSessions = sessions.filter((s) => selectedIds.includes(s.id))
  const total = selectedIds.length * 600

  const sessionsByHour = HOURS.reduce(
    (acc, hour) => {
      acc[hour] = filteredSessions.filter((s) =>
        s.startTime.startsWith(hour + ":")
      )
      return acc
    },
    {} as Record<string, Session[]>
  )

  const toggleSession = (session: Session) => {
    if (session.available <= 0) return
    setSelectedIds((prev) =>
      prev.includes(session.id)
        ? prev.filter((id) => id !== session.id)
        : [...prev, session.id]
    )
  }

  const onSubmit = async (formData: FormData) => {
    setSubmitError(null)
    pendingPayment.current = true

    try {
      const { data: result } = await createRegistration({
        variables: {
          data: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            sessionIds: selectedIds,
          },
        },
      })

      const r = result as {
        createRegistration: {
          payment: { merchantId: string; tradeInfo: string; tradeSha: string }
        }
      }
      await submitTransaction(r.createRegistration.payment)
    } catch (err: unknown) {
      pendingPayment.current = false
      const graphqlErr = err as { graphQLErrors?: { message: string }[] }
      setSubmitError(
        graphqlErr?.graphQLErrors?.[0]?.message ?? "報名失敗，請稍後再試"
      )
    }
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-8 md:px-12">
        <p className="mb-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Cue 03
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          競賽泳裝團拍活動
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          2026 年 6 月 13 日（六）& 14 日（日）· 每梯次 20 分鐘 · NT$600 / 梯次
        </p>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-10 md:px-8">
        {/* Step Indicator */}
        <div className="mb-10">
          <StepIndicator step={step} />
        </div>

        {/* ── Step 1: 選擇梯次 ── */}
        {step === 1 && (
          <div className="space-y-8">
            {/* Date Tabs */}
            <div>
              <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                選擇日期
              </p>
              <div className="flex gap-2">
                {DATES.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveDate(key)}
                    className={cn(
                      "rounded-lg px-5 py-2 text-sm font-medium transition-colors",
                      activeDate === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Grid */}
            <div>
              <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                選擇梯次
              </p>
              {sessionsLoading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  載入中...
                </div>
              ) : (
                <div className="space-y-3">
                  {HOURS.map((hour, hourIndex) => {
                    const hourSessions = sessionsByHour[hour]
                    if (!hourSessions?.length) return null
                    const folder = activeDate === "2026-06-13" ? "0613" : "0614"
                    const imgNum = String(hourIndex + 1).padStart(2, "0")
                    return (
                      <div
                        key={hour}
                        className="flex overflow-hidden border border-border"
                      >
                        {/* Session Image */}
                        <div className="w-32 shrink-0 self-stretch sm:w-44">
                          <img
                            src={`/images/${folder}/session${imgNum}.png`}
                            alt={`${hour}:00 時段`}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Sessions */}
                        <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                          <p className="text-xs text-muted-foreground">
                            {hour}:00 –{" "}
                            {String(parseInt(hour) + 1).padStart(2, "0")}:00
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {hourSessions.map((session) => {
                              const selected = selectedIds.includes(session.id)
                              const full = session.available <= 0
                              return (
                                <button
                                  key={session.id}
                                  onClick={() => toggleSession(session)}
                                  disabled={full && !selected}
                                  className={cn(
                                    "relative flex flex-col items-start border p-3 text-left transition-all",
                                    selected
                                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                                      : full
                                        ? "cursor-not-allowed border-border bg-muted/30 opacity-50"
                                        : "border-border hover:border-primary/40 hover:bg-accent"
                                  )}
                                >
                                  <span className="text-sm font-semibold">
                                    {session.startTime}
                                    <span className="mx-0.5 text-muted-foreground">
                                      –
                                    </span>
                                    {session.endTime}
                                  </span>
                                  <span
                                    className={cn(
                                      "mt-1 text-xs",
                                      full
                                        ? "text-destructive"
                                        : session.available <= 2
                                          ? "text-amber-500 dark:text-amber-400"
                                          : "text-muted-foreground"
                                    )}
                                  >
                                    {full
                                      ? "已額滿"
                                      : `剩 ${session.available} 位`}
                                  </span>
                                  {selected && (
                                    <span className="absolute top-2 right-2 text-primary">
                                      <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Selected Summary */}
            {selectedSessions.length > 0 && (
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  已選擇 {selectedSessions.length} 個梯次
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSessions.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {s.date.slice(5).replace("-", "/")} {s.startTime}–
                      {s.endTime}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Next Button */}
            <div className="space-y-2">
              <Button
                className="h-11 w-full text-sm font-medium tracking-wide"
                disabled={selectedIds.length === 0}
                onClick={() => setStep(2)}
              >
                下一步：填寫資料 →
              </Button>
              {selectedIds.length === 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  請先至少選擇一個梯次
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: 填寫資料 ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Order Summary */}
            <div className="rounded-xl border border-border p-4">
              <p className="mb-3 text-sm font-medium">已選擇的梯次</p>
              <div className="space-y-2">
                {selectedSessions.map((s) => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {s.date.slice(5).replace("-", "/")} &nbsp;{s.startTime}–
                      {s.endTime}
                    </span>
                    <span>NT$600</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold">
                <span>合計</span>
                <span>NT${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                報名資料
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  placeholder="請輸入真實姓名"
                  aria-invalid={!!errors.name}
                  className="h-10 text-sm"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">電話</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0912345678"
                  aria-invalid={!!errors.phone}
                  className="h-10 text-sm"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">電子郵件</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  aria-invalid={!!errors.email}
                  className="h-10 text-sm"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 text-sm"
                onClick={() => setStep(1)}
                disabled={submitting}
              >
                ← 上一步
              </Button>
              <Button
                type="submit"
                className="h-11 flex-[2] text-sm font-medium tracking-wide"
                disabled={!isValid || submitting}
              >
                {submitting ? "處理中..." : "確認購票 →"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
