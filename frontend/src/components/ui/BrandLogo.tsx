import React from 'react'

interface BrandLogoProps {
  dark?: boolean
  showTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function BrandLogo({ dark = false, showTagline = true, size = 'md' }: BrandLogoProps) {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 36 : 28

  return (
    <div className="flex items-center gap-2.5">
      <svg width={iconSize} height={iconSize} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <path d="M10 8C14 6 18 10 16 15C14 20 8 18 7 14C6 10 6 10 10 8Z" fill="#FF6B53" />
        <path d="M18 14C22 10 26 12 25 18C24 24 18 24 16 20C14 16 14 18 18 14Z" fill="#C0E862" />
        <path d="M26 22C30 18 34 22 32 26C30 30 24 30 23 26C22 22 22 26 26 22Z" fill="#4DB6AC" />
      </svg>
      <div>
        <span className={`font-bold tracking-tight block leading-none ${dark ? 'text-white' : 'text-[#0C2D27]'} ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'}`}>
          Migrant Saathi
        </span>
        {showTagline && (
          <span className={`text-[10px] font-medium tracking-wide block mt-1 ${dark ? 'text-emerald-200/70' : 'text-slate-500'}`}>
            साथ बढ़ें · साथ रहें
          </span>
        )}
      </div>
    </div>
  )
}
