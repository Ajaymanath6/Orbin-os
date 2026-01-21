import { RiCloseLine, RiShieldCheckLine, RiLockLine, RiBankCardLine, RiArrowRightLine, RiExternalLinkLine, RiEyeLine } from '@remixicon/react'

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
  onSecureHandoffInline,
  onOpenInNewTab,
  onShowPackagePreview,
  onCancel
}: SecureAuthorizationModalProps) {
  if (!isOpen || !packageData) return null

  // Mock saved payment methods (in real app, this would come from user profile/wallet)
  const savedPaymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'visa',
      last4: '1234',
      name: 'John Doe'
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '5678',
      name: 'John Doe'
    }
  ]

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
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <RiShieldCheckLine size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Authorize Execution</h2>
              <p className="text-sm text-gray-500">Secure payment authorization</p>
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
          {/* Package Summary */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Package Selected</h3>
              {onShowPackagePreview && (
                <button
                  onClick={onShowPackagePreview}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="View package details in browser preview"
                >
                  <RiEyeLine size={14} />
                  <span>Preview</span>
                </button>
              )}
            </div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{packageData.name}</h4>
                <p className="text-2xl font-bold text-gray-900 mt-2">{packageData.price}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">Includes:</p>
              <ul className="space-y-1">
                {packageData.highlights.map((highlight, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start">
                    <span className="mr-2 text-green-600">✓</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <RiLockLine size={18} className="text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-900">PCI-Compliant Secure Handoff</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Your payment information is never shared with the AI. All transactions are processed through secure, encrypted payment gateways.
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Payment Method</h3>
            <div className="space-y-2">
              {savedPaymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getCardIcon(method.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {method.type === 'visa' ? 'Visa' : method.type === 'mastercard' ? 'Mastercard' : method.type}
                        </p>
                        <p className="text-xs text-gray-500">{formatCardNumber(method.last4)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {onSecureHandoffInline && (
                      <button
                        onClick={onSecureHandoffInline}
                        className="flex-1 px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <RiArrowRightLine size={14} />
                        <span>Pay Inline</span>
                      </button>
                    )}
                    {onOpenInNewTab && (
                      <button
                        onClick={onOpenInNewTab}
                        className="px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <RiExternalLinkLine size={14} />
                        <span>New Tab</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Add New Payment Method */}
              <button
                onClick={onSecureHandoff}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all text-left"
              >
                <p className="text-sm font-medium text-gray-700">+ Add new payment method</p>
                <p className="text-xs text-gray-500 mt-1">Opens secure payment gateway</p>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onAuthorize}
              className="w-full py-3 px-6 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <RiShieldCheckLine size={20} />
              <span>Authorize Execution</span>
            </button>
            <button
              onClick={onSecureHandoff}
              className="w-full py-3 px-6 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-900 rounded-lg font-medium transition-colors"
            >
              Complete Payment Securely
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2 px-6 text-gray-600 hover:text-gray-900 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              By authorizing, you agree to proceed with the selected package. Payment will be processed securely through our PCI-compliant payment gateway.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
