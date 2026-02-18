import yaml from 'js-yaml'

export interface BankAccount {
  name: string
  account: string
}

export interface Parent {
  name: string
  account?: string
}

export interface GroomBride {
  name: string
  account?: string
  father: Parent
  mother: Parent
}

export interface VenueMaps {
  naver: string | { web: string }
  kakao: string | { web: string; placeId?: string }
}

export interface Venue {
  name: string
  address: string
  maps: VenueMaps
}

export interface Wedding {
  date: string
  time: string
  hero_image: string
  venue: Venue
}

export interface Transport {
  public: string
  parking: string
}

export interface Copy {
  hero_greeting: string
  contribution_info: string
  guestbook_cta: string
  guestbook_placeholder?: string
  rsvp_cta?: string
  section_location: string
  section_contribution: string
  section_gallery: string
  section_guestbook: string
  section_rsvp: string
}

export interface InvitationConfig {
  groom: GroomBride
  bride: GroomBride
  wedding: Wedding
  transport: Transport
  copy: Copy
}

let cachedConfig: InvitationConfig | null = null

export async function loadInvitationConfig(): Promise<InvitationConfig> {
  if (cachedConfig) return cachedConfig

  const res = await fetch('/config/invitation.yaml')
  if (!res.ok) throw new Error('Failed to load invitation config')
  const text = await res.text()
  cachedConfig = yaml.load(text) as InvitationConfig
  return cachedConfig!
}
