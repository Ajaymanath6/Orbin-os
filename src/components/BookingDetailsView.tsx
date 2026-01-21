import { RiPlaneLine, RiHotelLine, RiCalendarLine, RiRestaurantLine, RiShieldCheckLine, RiCheckLine, RiCloseLine, RiMapPinLine } from '@remixicon/react'

interface BookingDetails {
  [key: string]: any
}

interface Subtask {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed'
  agent?: string
  details?: BookingDetails
}

interface BookingDetailsViewProps {
  subtask: Subtask | null
  onClose: () => void
}

export default function BookingDetailsView({ subtask, onClose }: BookingDetailsViewProps) {
  if (!subtask || !subtask.details) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No booking details available</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const getIcon = (subtaskId: string) => {
    switch (subtaskId) {
      case '1':
        return RiPlaneLine
      case '2':
        return RiHotelLine
      case '3':
        return RiCalendarLine
      case '4':
        return RiRestaurantLine
      case '5':
        return RiShieldCheckLine
      default:
        return RiCheckLine
    }
  }

  const Icon = getIcon(subtask.id)

  const renderDetails = () => {
    const details = subtask.details || {}
    
    // Flight details
    if (subtask.id === '1' && details.flight) {
      return (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <RiCheckLine size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Flight Booked</h3>
            </div>
            <p className="text-sm text-green-700">Your flight has been successfully booked!</p>
          </div>

          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Flight Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Flight Number</p>
                  <p className="text-sm font-medium text-gray-900">{details.flight.flightNumber || 'AA 1234'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Airline</p>
                  <p className="text-sm font-medium text-gray-900">{details.flight.airline || 'American Airlines'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Departure</p>
                  <p className="text-sm font-medium text-gray-900">{details.flight.departure || 'JFK Airport'}</p>
                  <p className="text-xs text-gray-500">{details.flight.departureTime || '10:30 AM'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Arrival</p>
                  <p className="text-sm font-medium text-gray-900">{details.flight.arrival || 'NRT Airport'}</p>
                  <p className="text-xs text-gray-500">{details.flight.arrivalTime || '2:45 PM'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="text-sm font-medium text-gray-900">{details.flight.date || 'March 15, 2025'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Passengers</p>
                  <p className="text-sm font-medium text-gray-900">{details.flight.passengers || '2'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Booking Reference</h4>
              <p className="text-sm font-mono text-gray-900">{details.flight.confirmationCode || 'ABC123XYZ'}</p>
            </div>
          </div>
        </div>
      )
    }

    // Hotel details
    if (subtask.id === '2' && details.hotel) {
      return (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <RiCheckLine size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Hotel Booked</h3>
            </div>
            <p className="text-sm text-green-700">Your hotel reservation has been confirmed!</p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{details.hotel.name || 'Grand Tokyo Hotel'}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <RiMapPinLine size={16} />
                <span>{details.hotel.address || 'Tokyo, Japan'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Check-in</p>
                <p className="text-sm font-medium text-gray-900">{details.hotel.checkIn || 'March 15, 2025'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Check-out</p>
                <p className="text-sm font-medium text-gray-900">{details.hotel.checkOut || 'March 22, 2025'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Guests</p>
                <p className="text-sm font-medium text-gray-900">{details.hotel.guests || '2'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Room Type</p>
                <p className="text-sm font-medium text-gray-900">{details.hotel.roomType || 'Deluxe Suite'}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Confirmation Number</h4>
              <p className="text-sm font-mono text-gray-900">{details.hotel.confirmationNumber || 'HTL789456'}</p>
            </div>
          </div>
        </div>
      )
    }

    // Generic details display
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <RiCheckLine size={20} className="text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">{subtask.title} - Completed</h3>
          </div>
        </div>
        <div className="space-y-2">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className="text-sm font-medium text-gray-900">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Icon size={24} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{subtask.title}</h2>
            <p className="text-sm text-gray-500">Booking Details</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <RiCloseLine size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderDetails()}
      </div>
    </div>
  )
}
