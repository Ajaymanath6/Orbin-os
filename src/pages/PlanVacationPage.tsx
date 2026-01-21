import { useState, useEffect, useRef } from 'react'
import { RiPlaneLine, RiHotelLine, RiCalendarLine, RiRestaurantLine, RiShieldCheckLine, RiLoader2Line, RiCheckLine } from '@remixicon/react'

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

interface PlanVacationPageProps {
  destination?: string
  duration?: string
  budget?: string
  people?: string
  tripType?: string
  isReady?: boolean
  subtasks?: Subtask[]
  onSubtaskUpdate?: (subtasks: Subtask[]) => void
  onCardClick?: (subtask: Subtask) => void
}

export default function PlanVacationPage({
  destination: initialDestination,
  duration: initialDuration,
  isReady = false,
  subtasks: externalSubtasks,
  onSubtaskUpdate,
  onCardClick
}: PlanVacationPageProps = {}) {
  const [destination, setDestination] = useState(initialDestination || '')
  const [duration, setDuration] = useState(initialDuration || '')

  // Sync state when props change
  useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination)
    }
  }, [initialDestination])

  useEffect(() => {
    if (initialDuration) {
      setDuration(initialDuration)
    }
  }, [initialDuration])

  const [subtasks, setSubtasks] = useState<Subtask[]>(externalSubtasks || [
    { id: '1', title: 'Find flights', status: 'pending' },
    { id: '2', title: 'Book hotels', status: 'pending' },
    { id: '3', title: 'Create itinerary', status: 'pending' },
    { id: '4', title: 'Reserve restaurants', status: 'pending' },
    { id: '5', title: 'Get travel insurance', status: 'pending' }
  ])

  const isExternalUpdateRef = useRef(false)
  
  // Sync with external subtasks - only update if they're different
  useEffect(() => {
    if (externalSubtasks) {
      // Check if external subtasks are actually different
      const hasChanged = externalSubtasks.length !== subtasks.length || 
        externalSubtasks.some((extTask, idx) => {
          const currentTask = subtasks[idx]
          return !currentTask || 
            extTask.id !== currentTask.id ||
            extTask.status !== currentTask.status ||
            JSON.stringify(extTask.details) !== JSON.stringify(currentTask.details)
        })
      
      if (hasChanged) {
        isExternalUpdateRef.current = true
        setSubtasks(externalSubtasks)
        // Reset flag after state update
        setTimeout(() => {
          isExternalUpdateRef.current = false
        }, 0)
      }
    }
  }, [externalSubtasks])

  // Notify parent of subtask updates - only when NOT from external update
  useEffect(() => {
    // Skip callback if this update came from external props
    if (isExternalUpdateRef.current) {
      return
    }
    
    if (onSubtaskUpdate) {
      onSubtaskUpdate(subtasks)
    }
  }, [subtasks, onSubtaskUpdate])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <RiCheckLine size={20} className="text-green-600" />
      case 'in-progress':
        return <RiLoader2Line size={20} className="text-blue-600 animate-spin" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  const handleCardClick = (subtask: Subtask) => {
    if (onCardClick) {
      onCardClick(subtask)
    }
  }


  // Show empty state only until the mission is "ready"
  // Once isReady is true (e.g. after authorization), always show the cards,
  // even if destination/duration are missing or still being refined.
  if (!isReady) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
          <RiPlaneLine size={40} className="text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Waiting for your input</h3>
        <p className="text-gray-600 text-center max-w-md">
          Answer the AI's questions in the chat panel to get started with your vacation planning.
        </p>
        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>AI is asking questions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white min-h-full p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
            <RiPlaneLine size={24} className="text-gray-700" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Plan My Vacation</h1>
            <p className="text-sm text-gray-500 mt-0.5">{duration} trip to {destination}</p>
          </div>
        </div>
      </div>

      {/* Subtasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subtasks.map((subtask, index) => {
          const icons = [RiPlaneLine, RiHotelLine, RiCalendarLine, RiRestaurantLine, RiShieldCheckLine]
          const Icon = icons[index] || RiPlaneLine
          
          return (
            <div
              key={subtask.id}
              onClick={() => handleCardClick(subtask)}
              className={`rounded-lg border p-4 bg-white transition-all cursor-pointer ${
                subtask.status === 'completed' 
                  ? 'border-green-300 hover:border-green-400 hover:shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  subtask.status === 'completed' ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <Icon size={20} className={subtask.status === 'completed' ? 'text-green-600' : 'text-gray-600'} />
                </div>
                {getStatusIcon(subtask.status)}
              </div>
              
              <h3 className={`text-base font-medium mb-2 ${
                subtask.status === 'completed' ? 'text-green-900' : 'text-gray-900'
              }`}>
                {subtask.title}
              </h3>
              
              {subtask.agent && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Agent:</span> {subtask.agent}
                  </p>
                </div>
              )}
              
              {subtask.status === 'pending' && (
                <p className="text-xs text-gray-400 mt-2">Waiting to start...</p>
              )}
              
              {subtask.status === 'in-progress' && (
                <p className="text-xs text-blue-600 mt-2">Working on it...</p>
              )}
              
              {subtask.status === 'completed' && (
                <p className="text-xs text-green-600 mt-2 font-medium">✓ Completed - Click to view details</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Progress Summary</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="text-sm font-medium text-gray-900">
              {subtasks.filter(t => t.status === 'completed').length} / {subtasks.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-700 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(subtasks.filter(t => t.status === 'completed').length / subtasks.length) * 100}%`
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>In Progress: {subtasks.filter(t => t.status === 'in-progress').length}</span>
            <span>Pending: {subtasks.filter(t => t.status === 'pending').length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
