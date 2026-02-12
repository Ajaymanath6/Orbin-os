import { RiLoader4Fill } from '@remixicon/react'

// Dark Gray Monochromatic Palette
const DARK_PALETTE = {
  primary: '#1F2937',    // Dark gray
  secondary: '#374151',  // Medium gray  
  tertiary: '#4B5563',   // Light gray
  accent: '#6B7280',     // Lighter gray
}

interface AgentStatus {
  name: string
  icon: React.ComponentType<{ size?: string | number }>
  status: 'ready' | 'analyzing' | 'processing' | 'completed'
  statusText: string
  subheading?: string
  useLogo?: boolean
  /** When set, show this image instead of icon or useLogo (e.g. Find agent logo). */
  customLogoSrc?: string
}

interface NotificationBannerProps {
  activeAgent: AgentStatus
  className?: string
}

export default function NotificationBanner({ activeAgent, className = '' }: NotificationBannerProps) {
  return (
    <div
      className={`mb-8 p-4 rounded-2xl border flex items-center gap-4 w-full ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        borderColor: '#E5E7EB',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: activeAgent.status === 'analyzing' ? '#DBEAFE' : '#F9FAFB',
            color: activeAgent.status === 'analyzing' ? DARK_PALETTE.primary : '#374151'
          }}
        >
          {activeAgent.status === 'analyzing' ? (
            <RiLoader4Fill size={16} className="animate-spin" />
          ) : activeAgent.customLogoSrc ? (
            <img
              src={activeAgent.customLogoSrc}
              alt={activeAgent.name}
              className="w-8 h-8 object-contain rounded-lg"
              style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
            />
          ) : activeAgent.useLogo ? (
            <>
              <img
                src="https://claude.ai/images/claude_app_icon.png"
                alt="Claude"
                className="w-9 h-8 object-contain rounded-lg"
                style={{
                  borderRadius: '50% 40% 50% 40%',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <span className="text-xs font-bold text-purple-600 hidden">C</span>
            </>
          ) : (
            <activeAgent.icon size={16} />
          )}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">AI Agent: {activeAgent.name}</div>
          {activeAgent.subheading && (
            <div className="text-xs text-gray-500">{activeAgent.subheading}</div>
          )}
          <div className="text-xs text-gray-600">{activeAgent.statusText}</div>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            activeAgent.status === 'analyzing' ? 'bg-blue-500 animate-pulse' :
            activeAgent.status === 'completed' ? 'bg-green-500' :
            'bg-gray-400'
          }`}
        ></div>
        <span className="text-xs text-gray-500">
          {activeAgent.status === 'analyzing' ? 'Processing' :
           activeAgent.status === 'completed' ? 'Complete' :
           'Ready'}
        </span>
      </div>
    </div>
  )
}
