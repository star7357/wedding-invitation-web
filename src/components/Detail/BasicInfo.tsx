import { Section } from '@/components/layout/Section'
import { Icon } from '@/components/ui/Icon'
import type { InvitationConfig } from '@/config/invitation'

interface BasicInfoProps {
  config: InvitationConfig
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function isHoliday(month: number, day: number): boolean {
  return (month === 4 && day === 5) // 5월 5일 어린이날
}

function Calendar({ dateStr }: { dateStr: string }) {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth()
  const weddingDay = date.getDate()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const days: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const weekdays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="mt-6 w-full max-w-[360px] px-1">
      <div className="grid w-full grid-cols-7 gap-x-2 gap-y-3 text-center font-maruburi text-[12.9px]">
        {weekdays.map((w, i) => (
          <span
            key={w}
            className={`flex h-[34px] items-center justify-center font-semibold ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-[#c4b5a8]' : 'text-[#fdeee0]'
            }`}
          >
            {w}
          </span>
        ))}
        {days.map((d, i) => {
          const dayOfWeek = i % 7
          const isSunday = dayOfWeek === 0
          const isSaturday = dayOfWeek === 6
          const isWeddingDay = d === weddingDay
          const isHolidayDay = d !== null && isHoliday(month, d)
          const isRed = isSunday || isHolidayDay

          return (
            <span
              key={i}
              className={`relative flex h-[51px] w-full min-w-0 items-center justify-center rounded-[19px] font-normal text-[15px] ${
                d === null
                  ? ''
                  : isWeddingDay
                    ? 'bg-[#3b291e] font-bold text-[#fdeee0]'
                    : isRed
                      ? 'text-red-400'
                      : isSaturday
                        ? 'text-[#c4b5a8]'
                        : 'text-[#fdeee0]'
              }`}
            >
              {isWeddingDay ? (
                <span className="relative flex h-full w-full flex-col items-center justify-center gap-0">
                  <img
                    src="/assets/icons/section/wedding-date.svg"
                    alt=""
                    className="absolute left-1/2 top-1/2 h-[51.4px] w-[51.4px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-90"
                    aria-hidden
                  />
                  <span className="relative z-10 font-bold text-[#3b291e]">{d}</span>
                </span>
              ) : (
                d ?? ''
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function BasicInfo({ config }: BasicInfoProps) {
  const { groom, bride, wedding } = config
  const dDay = getDaysUntil(wedding.date)

  return (
    <Section>
      <div className="flex flex-col items-center gap-[30px] px-5">
        <div className="flex items-center justify-center gap-2">
          <Icon src="/assets/icons/section/invitation.svg" size={26} className="text-[#fdeee0]" />
          <h2 className="font-maruburi text-base font-bold text-[#fdeee0]">Invitation</h2>
        </div>
        <div className="flex w-[289px] items-center justify-between">
          <div className="flex flex-col items-center gap-3.5">
            <p className="font-maruburi text-lg font-bold text-[#feeee0]">{groom.name}</p>
            <p className="font-maruburi text-[13px] font-normal text-[#feeee0]">
              {groom.father.name} ∙ {groom.mother.name}의 아들
            </p>
          </div>
          <Icon src="/assets/icons/section/heart.svg" size={20} className="text-white" />
          <div className="flex flex-col items-center gap-3.5">
            <p className="font-maruburi text-lg font-bold text-[#feeee0]">{bride.name}</p>
            <p className="font-maruburi text-[13px] font-normal text-[#feeee0]">
              {bride.father.name} ∙ {bride.mother.name}의 딸
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-center font-maruburi text-lg font-bold text-[#fdeee0]">
            {new Date(wedding.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}{' '}
            {wedding.time.includes(':') ? wedding.time.replace(':', '시') + '분' : wedding.time}
          </p>
          <p className="text-center font-maruburi text-sm font-normal text-[#fdeee0]">
            결혼식까지 D-{dDay}
          </p>
        </div>
        <Calendar dateStr={wedding.date} />
      </div>
    </Section>
  )
}
