'use client'

/**
 * Dashboard Design Variations - Bold & Creative
 *
 * 5 completely different aesthetic approaches to dashboard design
 */

import { useState } from 'react'
import { NeonNoir } from './NeonNoir'

type VariantKey = 'neon' | 'desert' | 'nordic' | 'baroque' | 'brutalist'

const variants = {
  neon: {
    name: 'Neon Noir Tokyo',
    description: 'Cyberpunk aesthetic with electric colors and glitch effects',
    colors: ['#ff00ff', '#00ffff', '#0a0a14'],
    component: NeonNoir
  },
  desert: {
    name: 'Desert Bloom',
    description: 'Psychedelic southwest with terracotta and sage',
    colors: ['#E07A5F', '#81B29A', '#F2CC8F'],
    component: () => <div className="p-8 text-center" style={{ background: '#F4F1DE', minHeight: '80vh' }}>
      <h1 className="text-6xl mb-4" style={{ fontFamily: 'Georgia, serif', color: '#E07A5F' }}>Desert Bloom</h1>
      <p style={{ color: '#3D405B' }}>Coming soon - Psychedelic southwest aesthetic</p>
    </div>
  },
  nordic: {
    name: 'Nordic Void',
    description: 'Inverted Scandinavian minimalism with aurora accents',
    colors: ['#000000', '#00ff9f', '#ffffff'],
    component: () => <div className="p-8 text-center" style={{ background: '#000000', color: '#ffffff', minHeight: '80vh' }}>
      <h1 className="text-6xl mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 100 }}>Nordic Void</h1>
      <p style={{ color: '#00ff9f' }}>Coming soon - Extreme minimalism meets northern lights</p>
    </div>
  },
  baroque: {
    name: 'Baroque Maximalist',
    description: 'Digital rococo with vaporwave pastels and gold',
    colors: ['#FFD700', '#FF6FD8', '#B4A7D6'],
    component: () => <div className="p-8 text-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '80vh' }}>
      <h1 className="text-6xl mb-4" style={{ fontFamily: '"Playfair Display", serif', color: '#FFD700' }}>Baroque Maximalist</h1>
      <p style={{ color: '#ffffff' }}>Coming soon - Versailles meets vaporwave</p>
    </div>
  },
  brutalist: {
    name: 'Brutalist Rave',
    description: 'Post-Soviet techno with concrete and aggressive neon',
    colors: ['#ff0000', '#00ff00', '#808080'],
    component: () => <div className="p-8 text-center" style={{ background: '#808080', minHeight: '80vh' }}>
      <h1 className="text-6xl mb-4 font-black" style={{ fontFamily: 'Arial Black, sans-serif', color: '#ff0000', textTransform: 'uppercase' }}>BRUTALIST RAVE</h1>
      <p style={{ color: '#00ff00' }}>Coming soon - Raw concrete meets underground techno</p>
    </div>
  }
}

export default function DashboardDesignsPage() {
  const [selected, setSelected] = useState<VariantKey>('neon')
  const CurrentVariant = variants[selected].component

  return (
    <div className="min-h-screen bg-black">
      {/* Theme Selector */}
      <div className="border-b-2 border-white p-4" style={{ background: '#000' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-4">Dashboard Design Variations</h1>
          <div className="flex gap-3 flex-wrap">
            {(Object.keys(variants) as VariantKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className="px-4 py-2 rounded text-sm font-medium transition-all"
                style={{
                  background: selected === key ? variants[key].colors[0] : '#333',
                  color: selected === key ? '#000' : '#fff',
                  border: '2px solid',
                  borderColor: selected === key ? variants[key].colors[0] : '#666'
                }}
              >
                {variants[key].name}
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 rounded" style={{ background: '#1a1a1a' }}>
            <div className="text-white font-semibold mb-2">{variants[selected].name}</div>
            <div className="text-gray-400 text-sm mb-3">{variants[selected].description}</div>
            <div className="flex gap-2">
              {variants[selected].colors.map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded"
                  style={{ background: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Variant */}
      <CurrentVariant />
    </div>
  )
}
