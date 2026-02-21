import { useEffect, useRef, useState } from 'react'
import { Section } from '@/components/layout/Section'
import { Icon } from '@/components/ui/Icon'
import type { InvitationConfig } from '@/config/invitation'

interface HeroProps {
  config: InvitationConfig
}

function formatDateTime(dateStr: string, timeStr: string) {
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }
  const datePart = date.toLocaleDateString('ko-KR', options)
  const [hour, min] = timeStr.split(':')
  return `${datePart} ${hour}시${min}분`
}

export function Hero({ config }: HeroProps) {
  const { groom, bride, wedding } = config
  const dateTime = formatDateTime(wedding.date, wedding.time)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const src = wedding.bg_music
    if (!src) return
    const audio = new Audio(src)
    audio.loop = true
    audioRef.current = audio
    audio.play().then(() => setIsPlaying(true)).catch(() => { /* autoplay blocked */ })
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [wedding.bg_music])

  const toggleMusic = async () => {
    const src = wedding.bg_music
    if (!src) return
    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.loop = true
    }
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch {
        /* autoplay blocked or file not found */
      }
    }
  }

  return (
    <Section className="relative h-[888px] min-h-[70vh] overflow-hidden px-0 pt-0 pb-0" animate={false}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-[var(--color-bg)]"
        style={{
          backgroundImage: `url(${wedding.hero_image})`,
          backgroundSize: 'cover',
        }}
      />

      {wedding.bg_music && (
        <button
          type="button"
          onClick={toggleMusic}
          className={`absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-[7px] bg-[#feeee0]/32 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_1px_rgba(0,0,0,0.13)] backdrop-blur-sm transition-opacity ${!isPlaying ? 'opacity-70' : 'opacity-100'}`}
          aria-label={isPlaying ? '배경음악 일시정지' : '배경음악 재생'}
        >
          <Icon src="/assets/icons/icon_music.svg" size={20} className="text-[#feeee0]" />
        </button>
      )}

      <div
        className="absolute bottom-0 left-0 right-0 z-20 h-[221px] bg-gradient-to-t from-[var(--color-bg)] to-transparent"
        aria-hidden
      />

      <div className="absolute left-1/2 top-[118px] z-10 w-[330px] -translate-x-1/2">
        <img
          src="/assets/icons/icon_name.png"
          alt={`${groom.name} ${bride.name}`}
          className="h-[90px] w-full object-contain object-center"
        />
      </div>

      <img
        src="/assets/icons/hero/heart.svg"
        alt=""
        className="absolute left-1/2 top-[323px] z-10 h-[52px] w-[68px] animate-sway opacity-90"
      />

      <img
        src="/assets/icons/hero/bird.svg"
        alt=""
        className="absolute left-[289px] top-[432px] z-10 h-[42px] w-6 opacity-90"
      />

      <img
        src="/assets/icons/hero/snail.svg"
        alt=""
        className="absolute left-[76px] top-[555px] z-10 h-8 w-[50px] opacity-90"
      />

      <div className="absolute left-0 right-0 top-[667px] z-30 flex flex-col items-center gap-[7px] px-4">
        <p className="font-maruburi text-center text-[15px] font-normal leading-[17.2px] tracking-normal text-[#feeee0]">
          {dateTime}
        </p>
        <p className="font-maruburi text-center text-[15px] font-normal leading-[17.2px] tracking-normal text-[#feeee0]">
          {wedding.venue.name}
        </p>
      </div>
    </Section>
  )
}
