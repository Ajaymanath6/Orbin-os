import { RiCloseLine, RiShieldCheckLine, RiLockLine, RiBankCardLine, RiEyeLine } from '@remixicon/react'

interface PackageData {
  id: string
  name: string
  price: string
  highlights: string[]
}

interface PaymentMethod {
  id: string
  type: 'visa' | 'mastercard' | 'amex' | 'paypal'
  last4: string
  name: string
}

interface SecureAuthorizationModalProps {
  isOpen: boolean
  packageData: PackageData | null
  onAuthorize: () => void
  onSecureHandoff: () => void
  onSecureHandoffInline?: () => void
  onOpenInNewTab?: () => void
  onShowPackagePreview?: () => void
  onCancel: () => void
}

export default function SecureAuthorizationModal({
  isOpen,
  packageData,
  onAuthorize,
  onSecureHandoff,
  onShowPackagePreview,
  onCancel
}: SecureAuthorizationModalProps) {
  if (!isOpen || !packageData) return null

  // Mock primary payment method (in real app, this would come from user profile/wallet)
  const primaryMethod: PaymentMethod = {
    id: '1',
    type: 'visa',
    last4: '6157',
    name: 'John Doe'
  }

  const getCardIcon = (type: string) => {
    // Use generic card icon with color coding
    const colorClass = type === 'visa' ? 'text-blue-600' : type === 'mastercard' ? 'text-red-500' : 'text-gray-600'
    return <RiBankCardLine size={24} className={colorClass} />
  }

  const formatCardNumber = (last4: string) => {
    return `•••• •••• •••• ${last4}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <RiShieldCheckLine size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 tracking-wide">TOTAL ORDER</p>
              <h2 className="text-2xl font-semibold text-gray-900">{packageData.price}</h2>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <RiCloseLine size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Card summary */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded-md bg-black flex items-center justify-center">
                {getCardIcon(primaryMethod.type)}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">
                  {primaryMethod.type === 'visa' ? 'Visa' : primaryMethod.type} &nbsp; {formatCardNumber(primaryMethod.last4)}
                </p>
                <p className="text-[11px] text-gray-500">This card will be used for this booking.</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 uppercase tracking-wide">
              Authorized
            </span>
          </div>

          {/* Package details */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{packageData.name}</h3>
                {onShowPackagePreview && (
                  <button
                    onClick={onShowPackagePreview}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900"
                  >
                    <RiEyeLine size={12} />
                    <span>View package details</span>
                  </button>
                )}
              </div>
            </div>
            <div className="mt-3 border-t border-gray-100 pt-3 space-y-1.5">
              {packageData.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start justify-between text-xs">
                  <span className="text-gray-500">•</span>
                  <span className="ml-2 text-gray-700 flex-1">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order details */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Order details</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Service price</span>
                <span className="text-gray-900 font-medium">{packageData.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Booking fee</span>
                <span className="text-gray-900">$1.99</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Currency</span>
                <span className="text-gray-900">USD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Card type</span>
                <span className="text-gray-900 capitalize">Debit card</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Processor</span>
                <span className="text-xs font-semibold text-purple-600">stripe</span>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5">
            <RiLockLine size={16} className="text-blue-600 mt-0.5" />
            <p className="text-[11px] text-blue-900">
              Your full card details never touch Orbin. Authorization is completed via PCI‑compliant payment providers.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-3">
            <button
              onClick={onAuthorize}
              className="w-full py-3 px-6 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <RiShieldCheckLine size={20} />
              <span>Authorize execution</span>
            </button>
            <button
              onClick={onSecureHandoff}
              className="w-full py-3 px-6 bg-white border border-gray-300 hover:border-gray-400 text-gray-900 rounded-lg font-medium transition-colors text-sm"
            >
              Complete payment securely
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2 px-6 text-gray-500 hover:text-gray-900 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
