'use client'
import { useEffect, useRef } from 'react'
import { Slot } from '@/lib/types'

interface Props {
  slots: Slot[]
  hoveredId: string | null
  onHover: (id: string | null) => void
}

// Approximate coordinates from address strings
const COORD_MAP: Record<string, [number, number]> = {
  'Williamstown':        [39.6854, -74.9993],
  'Sicklerville':        [39.7251, -74.9882],
  'Glassboro':           [39.7026, -75.1116],
  'Turnersville':        [39.7651, -75.0552],
  'Washington Township': [39.6887, -75.0552],
  'Philadelphia':        [39.9526, -75.1652],
  'Cherry Hill':         [39.9248, -74.9913],
  'Mount Laurel':        [39.9445, -74.9093],
  'Marlton':             [39.8912, -74.9229],
  'Voorhees':            [39.8551, -74.9510],
}

function getCoords(address: string): [number, number] {
  const match = Object.keys(COORD_MAP).find(k => address?.toLowerCase().includes(k.toLowerCase()))
  return match ? COORD_MAP[match] : [39.87, -75.07]
}

export default function MapClient({ slots, hoveredId, onHover }: Props) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then(L => {
      // Fix marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        center: [39.87, -75.07],
        zoom: 10,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      mapRef.current = map
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update markers when slots change
  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then(L => {
      // Remove old markers
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      const seen = new Set<string>()
      slots.forEach(slot => {
        const key = slot.business_name || ''
        if (seen.has(key)) return
        seen.add(key)

        const coords = getCoords(slot.business_address || '')
        const disc = Math.round((slot.original_price - slot.deal_price) / slot.original_price * 100)
        const isHovered = hoveredId === slot.id

        const icon = L.divIcon({
          html: `<div style="
            background: ${isHovered ? '#059669' : '#10b981'};
            color: white;
            border: 2px solid white;
            border-radius: 20px;
            padding: 3px 8px;
            font-family: 'Outfit', sans-serif;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            transform: ${isHovered ? 'scale(1.15)' : 'scale(1)'};
            transition: all 0.15s;
          ">${disc}% off</div>`,
          className: '',
          iconAnchor: [20, 10],
        })

        const marker = L.marker(coords, { icon })
          .addTo(mapRef.current)
          .bindPopup(`<strong style="font-family:Outfit,sans-serif">${slot.business_name}</strong><br><span style="font-size:12px;color:#6b7280">${slot.service_name}</span><br><strong style="color:#10b981">$${slot.deal_price}</strong> <span style="text-decoration:line-through;color:#9ca3af">$${slot.original_price}</span>`)

        marker.on('mouseover', () => onHover(slot.id))
        marker.on('mouseout', () => onHover(null))

        markersRef.current.push(marker)
      })
    })
  }, [slots, hoveredId])

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <div style={{ padding: '10px 14px', background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: "'Outfit', sans-serif" }}>Greater Philadelphia</span>
        <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: "'Outfit', sans-serif" }}>{slots.length} open slots</span>
      </div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div ref={containerRef} style={{ height: 220, width: '100%', background: '#e8f0e9' }} />
      <div style={{ padding: '6px 14px', background: '#fff', borderTop: '1px solid #f1f5f9', fontSize: 10, color: '#9ca3af', fontFamily: "'Outfit', sans-serif" }}>
        Hover a pin to preview · Scroll to zoom
      </div>
    </div>
  )
}