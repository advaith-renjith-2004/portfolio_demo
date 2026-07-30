'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'

type Airport = { code: string; lat: number; lng: number; tz: string }

const AIRPORTS: Airport[] = [
  // India
  { code: 'TRV', lat: 8.4821, lng: 76.9201, tz: 'Asia/Kolkata' },
  { code: 'BLR', lat: 13.1986, lng: 77.7066, tz: 'Asia/Kolkata' },
  { code: 'DEL', lat: 28.5562, lng: 77.1, tz: 'Asia/Kolkata' },
  { code: 'BOM', lat: 19.0896, lng: 72.8656, tz: 'Asia/Kolkata' },
  { code: 'MAA', lat: 12.9941, lng: 80.1709, tz: 'Asia/Kolkata' },
  { code: 'HYD', lat: 17.2403, lng: 78.4294, tz: 'Asia/Kolkata' },
  { code: 'CCU', lat: 22.6547, lng: 88.4467, tz: 'Asia/Kolkata' },
  { code: 'COK', lat: 10.152, lng: 76.4019, tz: 'Asia/Kolkata' },
  // Middle East
  { code: 'DXB', lat: 25.2532, lng: 55.3657, tz: 'Asia/Dubai' },
  // Europe
  { code: 'LHR', lat: 51.47, lng: -0.4543, tz: 'Europe/London' },
  { code: 'CDG', lat: 49.0097, lng: 2.5479, tz: 'Europe/Paris' },
  // Americas
  { code: 'JFK', lat: 40.6413, lng: -73.7781, tz: 'America/New_York' },
  { code: 'SFO', lat: 37.6213, lng: -122.379, tz: 'America/Los_Angeles' },
  { code: 'LAX', lat: 33.9416, lng: -118.4085, tz: 'America/Los_Angeles' },
]

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function nearestAirport(lat: number, lng: number): Airport {
  return AIRPORTS.reduce((best, a) =>
    haversine(lat, lng, a.lat, a.lng) < haversine(lat, lng, best.lat, best.lng) ? a : best
  )
}

function useClockTime(tz: string) {
  const [time, setTime] = useState(() => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date())
    } catch (e) {
      return '00:00:00'
    }
  })

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    const tick = () => {
      try {
        setTime(fmt.format(new Date()))
      } catch (e) {}
    }
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tz])

  return time
}

function ClockRow({ code, tz }: { code: string; tz: string }) {
  const time = useClockTime(tz)
  return (
    <div className="flex items-center gap-1.5 leading-none">
      <MapPin className="h-3 w-3 shrink-0 opacity-70 text-emerald-400" />
      <span className="font-mono text-[9px] tracking-wider opacity-60">{code}</span>
      <span className="font-mono text-[10px] tracking-wider tabular-nums">{time}</span>
    </div>
  )
}

export function ClockWidget() {
  const [mounted, setMounted] = useState(false)
  const [userAirport, setUserAirport] = useState<Airport | null>(null)

  useEffect(() => {
    setMounted(true)
    if (!navigator.geolocation) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const match = AIRPORTS.find((a) => a.tz === tz)
      setUserAirport(match ?? null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserAirport(nearestAirport(coords.latitude, coords.longitude))
      },
      () => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        const match = AIRPORTS.find((a) => a.tz === tz)
        setUserAirport(match ?? null)
      },
      { timeout: 6000, maximumAge: 300000 }
    )
  }, [])

  const userTz = userAirport?.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  const userCode = userAirport?.code ?? '···'
  const sameAsTRV = userAirport?.code === 'TRV'

  if (!mounted) return null

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col gap-1.5 border border-white/5 bg-black/40 p-2.5 px-3 rounded-lg backdrop-blur-md text-foreground select-none pointer-events-none shadow-[0_4px_20px_-8px_rgba(0,0,0,0.8)]">
      <ClockRow code="TRV" tz="Asia/Kolkata" />
      {!sameAsTRV && <ClockRow code={userCode} tz={userTz} />}
    </div>
  )
}
