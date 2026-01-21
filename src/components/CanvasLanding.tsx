import { useState, useRef, useEffect, useCallback } from 'react'
import {
  RiPulseLine,
  RiSearchEyeLine,
  RiNotification3Line,
  RiSettings3Line,
  RiUser3Line,
  RiSearchLine,
  RiMicLine,
  RiAttachmentLine,
  RiStarFill,
  RiCheckLine,
  RiArrowUpSLine,
  RiHomeLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiLoader4Fill,
  RiSparklingFill,
  RiLoader2Line,
  RiPauseCircleFill,
  RiBrainLine,
  RiEditLine,
  RiAlertLine,
  RiImageLine,
  RiBarChartLine,
  RiToolsLine,
  RiPlaneLine,
  RiLockLine,
  RiExternalLinkLine,
  RiBankCardLine,
  RiHotelLine
} from '@remixicon/react'
import shopOSLogo from '../assets/orbin logo.svg'
import LoadingPage from '../pages/LoadingPage'
import PlanVacationPage from '../pages/PlanVacationPage'
import { ShiningText } from '../components/ui/shining-text'
import NotificationBanner from './NotificationBanner'
import SecureAuthorizationModal from './SecureAuthorizationModal'
import BookingDetailsView from './BookingDetailsView'

// Global window interface extension
declare global {
  interface Window {
    triggerDeploymentFlow?: () => void
    triggerNotificationSystem?: (notification: NotificationItem) => void
    triggerAIDeployment?: () => void
  }
}

interface NotificationItem {
  type: 'deployment_complete' | 'action_required' | 'info'
  title: string
  message: string
  actionRequired: boolean
  timestamp: number
  id?: string
  taskId?: string
  subtaskId?: string
}

// Custom SVG Icons
const SectionIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM20 10H4V19H20V10ZM15 6V8H19V6H15Z" />
  </svg>
)

const StarIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0.5L16 8L23.5 12L16 16L12 23.5L8 16L0.5 12L8 8L12 0.5Z" />
  </svg>
)



interface TaskCard {
  id: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ size?: string | number }>
  iconBg: string
}

// Dark Gray Monochromatic Palette
const DARK_PALETTE = {
  primary: '#1F2937',    // Dark gray
  secondary: '#374151',  // Medium gray  
  tertiary: '#4B5563',   // Light gray
  accent: '#6B7280',     // Lighter gray
  light: '#9CA3AF'       // Very light gray
}



// AI Conversation Card Component - Advanced AI Agent Experience
interface AIConversationCardProps {
  taskCards: TaskCard[]
  expandedCards: string[]
  scanProgress: number
  isScanning: boolean
  onAutoEnterUrl?: (url: string) => void
  onAutoStartScan?: () => void
  onAddNotification?: (notification: Omit<NotificationItem, 'id'>) => void
  onVacationDataUpdate?: (data: {destination: string, dates?: string, duration: string, budget?: string, people?: string, tripType?: string, ready?: boolean}) => void
  onQuestionStateChange?: (isAsking: boolean) => void
  onPackageSelect?: (packageData: {id: string, name: string, price: string, highlights: string[]}) => void
  onSubtaskComplete?: (subtaskId: string, details: any) => void
  onStartBooking?: () => void
}

function AIConversationCard({ taskCards, expandedCards, scanProgress, isScanning, onAutoEnterUrl, onAutoStartScan, onAddNotification, onVacationDataUpdate, onQuestionStateChange, onPackageSelect, onSubtaskComplete, onStartBooking }: AIConversationCardProps) {
  const [messages, setMessages] = useState<Array<{
    id: string
    type: 'thinking' | 'planning' | 'executing' | 'result' | 'error' | 'summary' | 'user'
    content: string
    timestamp: number
    isTyping: boolean
    icon?: React.ComponentType<{ size?: string | number }>
    status?: 'pending' | 'active' | 'completed' | 'failed'
  }>>([])


  const [currentTask, setCurrentTask] = useState<TaskCard | null>(null)
  const [showSkeleton, setShowSkeleton] = useState(true)
  const initializedTaskIdRef = useRef<string | null>(null)
  const conversationStartedRef = useRef<boolean>(false)
  const [userInput, setUserInput] = useState('')
  const [isAskingQuestion, setIsAskingQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [questionAnswers, setQuestionAnswers] = useState<{destination?: string, dates?: string, duration?: string, budget?: string, people?: string, tripType?: string}>({})
  const [showPackages, setShowPackages] = useState(false)
  const [pendingPackageData, setPendingPackageData] = useState<{id: string, name: string, price: string, highlights: string[]} | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const addTypingMessage = useCallback((message: Omit<typeof messages[0], 'id' | 'timestamp' | 'isTyping'> & { statusIndicator?: string }) => {
    const messageId = `${Date.now()}-${Math.random()}`
    const newMessage = {
      ...message,
      id: messageId,
      timestamp: Date.now(),
      isTyping: true,
      content: '' // Start with empty content
    }

    // Prevent duplicate messages
    setMessages(prev => {
      // Check if message with same content already exists
      const exists = prev.some(msg => 
        msg.content === message.content && 
        msg.type === message.type &&
        Date.now() - msg.timestamp < 1000 // Within 1 second
      )
      if (exists) {
        return prev
      }
      return [...prev, newMessage]
    })

    // Show status indicator first if provided
    if (message.statusIndicator) {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, content: message.statusIndicator || '', icon: RiLoader4Fill }
          : msg
      ))
      
      // Wait 2 seconds before starting actual message
      setTimeout(() => {
    // Type letter by letter
        const fullContent = message.content
        let currentIndex = 0
        
        const typeInterval = setInterval(() => {
          if (currentIndex < fullContent.length) {
            setMessages(prev => prev.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, content: fullContent.substring(0, currentIndex + 1), icon: message.icon || RiBrainLine }
                : msg
            ))
            currentIndex++
          } else {
            // Finished typing
            clearInterval(typeInterval)
            setMessages(prev => prev.map(msg => 
              msg.id === newMessage.id ? { ...msg, isTyping: false } : msg
            ))
          }
        }, 30) // 30ms per character for realistic typing speed
      }, 2000)
    } else {
      // Type letter by letter (no status indicator)
    const fullContent = message.content
    let currentIndex = 0
    
    const typeInterval = setInterval(() => {
      if (currentIndex < fullContent.length) {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, content: fullContent.substring(0, currentIndex + 1) }
            : msg
        ))
        currentIndex++
      } else {
        // Finished typing
        clearInterval(typeInterval)
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, isTyping: false } : msg
        ))
      }
    }, 30) // 30ms per character for realistic typing speed
    }
  }, [])

  const handlePackageSelect = useCallback((packageId: string) => {
    const packageData = packageId === 'package-1' 
      ? { id: 'package-1', name: 'Premium Experience', price: `$${questionAnswers.budget || '5000'}`, highlights: ['5-star luxury hotels', 'Private guided tours', 'Fine dining reservations', 'VIP airport transfers'] }
      : packageId === 'package-2'
      ? { id: 'package-2', name: 'Balanced Adventure', price: `$${Math.floor(parseInt(questionAnswers.budget || '5000') * 0.7)}`, highlights: ['4-star boutique hotels', 'Small group tours', 'Mix of fine & casual dining', 'Comfortable transportation'] }
      : { id: 'package-3', name: 'Budget-Friendly', price: `$${Math.floor(parseInt(questionAnswers.budget || '5000') * 0.5)}`, highlights: ['3-star central hotels', 'Self-guided itineraries', 'Local food experiences', 'Public transport included'] }
    
    // Step 1: Check what's missing from canvas and create missing elements
    // Check if package summary, price breakdown, or progress indicators are missing
    // For now, we'll create a visual summary message
    addTypingMessage({
      type: 'result',
      content: `Excellent choice! I've selected the ${packageData.name} package.\n\nLet me check what's needed on the canvas and prepare everything...`,
      icon: RiPlaneLine,
      statusIndicator: 'ORBIN_CHECKING'
    })
    
    setShowPackages(false)
    
    // Step 2: After checking, show what was created and prepare for authorization
    setTimeout(() => {
      addTypingMessage({
        type: 'result',
        content: `✓ Package summary created\n✓ Price breakdown added\n✓ Progress indicators initialized\n\nI've prepared everything. Ready to authorize execution?`,
        icon: RiCheckLine
      })
      
      // Step 3: Wait for user confirmation instead of immediately showing modal
      setWaitingForAuthorization(true)
      setPendingPackageData(packageData)
    }, 2000)
  }, [questionAnswers, addTypingMessage])

  const validateAnswer = (
    questionKey: string | null,
    answer: string
  ): { valid: boolean; error?: string } => {
    if (!questionKey) return { valid: true }

    const trimmed = answer.trim()

    switch (questionKey) {
      case 'destination': {
        // Require at least one letter and length >= 2
        if (trimmed.length < 2 || !/[a-zA-Z]/.test(trimmed)) {
          return {
            valid: false,
            error:
              "Please enter a destination name (e.g., 'Bali' or 'Paris'), not just numbers."
          }
        }
        return { valid: true }
      }
      case 'dates': {
        // We already have the date picker, but if user types manually,
        // require something that looks like a range.
        const hasRange = /\d{4}-\d{2}-\d{2}.*\d{4}-\d{2}-\d{2}/.test(trimmed)
        if (!hasRange) {
          return {
            valid: false,
            error:
              "Please enter a date range like '2026-01-17 - 2026-01-22' or use the date picker above."
          }
        }
        return { valid: true }
      }
      case 'duration': {
        const n = parseInt(trimmed, 10)
        if (Number.isNaN(n) || n <= 0) {
          return {
            valid: false,
            error: 'Duration should be a positive number of days (e.g., 5).'
          }
        }
        if (n > 60) {
          return {
            valid: false,
            error: "That's a very long trip. Please enter a number of days under 60."
          }
        }
        return { valid: true }
      }
      case 'budget': {
        // Strip non-digits and check there's at least something
        const digits = trimmed.replace(/[^\d]/g, '')
        const n = parseInt(digits, 10)
        if (!digits || Number.isNaN(n) || n <= 0) {
          return {
            valid: false,
            error:
              "Budget should be a number like '$2000' or '5000'."
          }
        }
        return { valid: true }
      }
      case 'people': {
        const n = parseInt(trimmed, 10)
        if (Number.isNaN(n) || n <= 0) {
          return {
            valid: false,
            error: 'Please enter how many people are traveling (e.g., 1, 2, 4).'
          }
        }
        if (n > 20) {
          return {
            valid: false,
            error:
              "For now I can only plan trips for up to 20 people. Please enter a smaller number."
          }
        }
        return { valid: true }
      }
      case 'tripType': {
        // Expect words like family, honeymoon, solo
        if (!/[a-zA-Z]/.test(trimmed)) {
          return {
            valid: false,
            error:
              "Please describe the trip type in words (e.g., 'family', 'honeymoon', 'solo')."
          }
        }
        return { valid: true }
      }
      default:
        return { valid: true }
    }
  }

  const handleUserAnswer = useCallback(() => {
    if (!userInput.trim()) return

    const userInputText = userInput.trim()
    const answerText = userInputText.toLowerCase()
    
    // Check if user is confirming authorization
    const confirmationKeywords = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'proceed', 'authorize', 'go ahead', 'continue']
    const isConfirmation = confirmationKeywords.some(keyword => answerText === keyword || answerText.startsWith(keyword + ' '))
    
    if (isConfirmation && pendingPackageData && !currentQuestion) {
      // User confirmed - show authorization modal (can be triggered multiple times, even after closing)
      addTypingMessage({
        type: 'result',
        content: `Perfect! Opening secure authorization...`,
        icon: RiCheckLine
      })
      
      // Trigger authorization modal
      if (onPackageSelect) {
        setTimeout(() => {
          onPackageSelect(pendingPackageData)
        }, 1000)
      }
      setUserInput('')
      return
    }
    
    // Check if user is asking about bookings/details
    const bookingKeywords = ['booking', 'details', 'flight', 'hotel', 'itinerary', 'restaurant', 'insurance', 'show me', 'tell me about', 'what is my']
    const isBookingQuery = bookingKeywords.some(keyword => answerText.includes(keyword))
    
    if (isBookingQuery && !currentQuestion) {
      // User is asking about bookings - handle it
      addTypingMessage({
        type: 'result',
        content: `Let me show you your booking details...`,
        icon: RiPlaneLine
      })
      
      // Find completed bookings and show the first one, or show all cards
      setTimeout(() => {
        addTypingMessage({
          type: 'result',
          content: `Your booking details are shown on the right. Click on any completed card (with checkmark) to see detailed information!`,
          icon: RiCheckLine
        })
      }, 1500)
      setUserInput('')
      return
    }
    
    if (!currentQuestion) return

    // Basic validation for typed answers per question
    const validation = validateAnswer(currentQuestion, userInputText)
    if (!validation.valid) {
      addTypingMessage({
        type: 'result',
        content: validation.error || 'Please adjust your answer and try again.',
        icon: RiAlertLine
      })
      setUserInput('')
      return
    }

    const answer = userInputText
    
    // Check for duplicate before adding
    setMessages(prev => {
      const recentUserMessage = prev
        .filter(msg => msg.type === 'user')
        .slice(-1)[0]
      
      // Check if same answer was just submitted (within last 2 seconds)
      if (recentUserMessage && 
          recentUserMessage.content === answer &&
          Date.now() - recentUserMessage.timestamp < 2000) {
        return prev // Don't add duplicate
      }
      
      // Add user message
      const userMessage = {
        id: `user-${Date.now()}-${Math.random()}`,
        type: 'user' as const,
        content: answer,
        timestamp: Date.now(),
        isTyping: false,
        icon: RiUser3Line
      }
      return [...prev, userMessage]
    })

    let updatedAnswers = { ...questionAnswers, [currentQuestion]: answer }
    setUserInput('')

    // Handle based on current question
    if (currentQuestion === 'destination') {
      // Ask next question: dates
      setTimeout(() => {
        addTypingMessage({
          type: 'result',
          content: `Great choice! ${answer} is an amazing destination. What dates are you planning to travel? (e.g., March 15-20, 2024)`,
          icon: RiPlaneLine
        })
        setTimeout(() => {
          setCurrentQuestion('dates')
        }, 3000)
      }, 500)
    } else if (currentQuestion === 'dates') {
      // Try to parse a date range and auto-calculate duration
      const rangeMatch = answer.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/)
      if (rangeMatch) {
        const start = new Date(rangeMatch[1])
        const end = new Date(rangeMatch[2])
        const diffMs = end.getTime() - start.getTime()
        const diffDays = diffMs > 0 ? Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1 : 1
        const durationStr = String(diffDays)
        updatedAnswers = { ...updatedAnswers, duration: durationStr }
        setQuestionAnswers(updatedAnswers)

        // Skip asking for duration explicitly; go straight to budget
        setTimeout(() => {
          addTypingMessage({
            type: 'result',
            content: `Perfect! Traveling on ${answer} – that's a ${diffDays}-day trip. What's your budget for this trip? (e.g., $2000, $5000, $10000)`,
            icon: RiPlaneLine
          })
          setTimeout(() => {
            setCurrentQuestion('budget')
          }, 3000)
        }, 500)
      } else {
        // Fallback to original behavior if we can't parse the range
        setQuestionAnswers(updatedAnswers)
        setTimeout(() => {
          addTypingMessage({
            type: 'result',
            content: `Perfect! Traveling on ${answer}. How many days are you planning for this trip?`,
            icon: RiPlaneLine
          })
          setTimeout(() => {
            setCurrentQuestion('duration')
          }, 3000)
        }, 500)
      }
    } else if (currentQuestion === 'duration') {
      // Ask next question: budget
      setTimeout(() => {
        addTypingMessage({
          type: 'result',
          content: `Perfect! ${answer} days sounds great. What's your budget for this trip? (e.g., $2000, $5000, $10000)`,
          icon: RiPlaneLine
        })
        setTimeout(() => {
          setCurrentQuestion('budget')
        }, 3000)
      }, 500)
    } else if (currentQuestion === 'budget') {
      // Ask next question: number of people
      setTimeout(() => {
        addTypingMessage({
          type: 'result',
          content: `Got it! Budget of ${answer}. How many people will be traveling?`,
          icon: RiPlaneLine
        })
        setTimeout(() => {
          setCurrentQuestion('people')
        }, 3000)
      }, 500)
    } else if (currentQuestion === 'people') {
      // Ask next question: trip type
      setTimeout(() => {
        addTypingMessage({
          type: 'result',
          content: `Great! ${answer} ${parseInt(answer) === 1 ? 'person' : 'people'}. What type of trip is this? (e.g., honeymoon, couple, family, solo, friends)`,
          icon: RiPlaneLine
        })
        setTimeout(() => {
          setCurrentQuestion('tripType')
        }, 3000)
      }, 500)
    } else if (currentQuestion === 'tripType') {
      // All questions answered - show packages
      const destination = updatedAnswers.destination || ''
      const duration = updatedAnswers.duration || ''
      setTimeout(() => {
        addTypingMessage({
          type: 'result',
          content: `Perfect! A ${duration}-day ${updatedAnswers.tripType || 'trip'} to ${destination} for ${updatedAnswers.people || ''} ${parseInt(updatedAnswers.people || '1') === 1 ? 'person' : 'people'} with a budget of ${updatedAnswers.budget || ''}. Let me find the best packages for you. Let's take you to the layout for better visual experience!`,
          icon: RiPlaneLine
        })
        
        // Show packages after message
        setTimeout(() => {
          setShowPackages(true)
          setIsAskingQuestion(false)
          setCurrentQuestion(null)
          if (onQuestionStateChange) {
            onQuestionStateChange(false)
          }
          // Update vacation data (but not ready yet - wait for package selection)
          if (onVacationDataUpdate) {
            onVacationDataUpdate({ 
              destination, 
              dates: updatedAnswers.dates,
              duration, 
              budget: updatedAnswers.budget,
              people: updatedAnswers.people,
              tripType: updatedAnswers.tripType,
              ready: false 
            })
          }
        }, 4000)
      }, 500)
    }
  }, [userInput, currentQuestion, questionAnswers, addTypingMessage, onVacationDataUpdate, onQuestionStateChange, onSubtaskComplete])

  // Notify parent when question state changes
  useEffect(() => {
    if (onQuestionStateChange) {
      onQuestionStateChange(isAskingQuestion)
    }
  }, [isAskingQuestion, onQuestionStateChange])

  // Handle booking start trigger from parent
  useEffect(() => {
    if (onStartBooking) {
      // This will be called when payment is authorized
      const startBookingFlow = () => {
        // Start booking flights
        addTypingMessage({
          type: 'executing',
          content: `Payment authorized! Starting to book your vacation...`,
          icon: RiPlaneLine,
          statusIndicator: 'ORBIN_BOOKING'
        })

        setTimeout(() => {
          addTypingMessage({
            type: 'executing',
            content: `Booking flights now... Searching for the best options from ${questionAnswers.destination || 'your location'}...`,
            icon: RiPlaneLine,
            statusIndicator: 'ORBIN_SEARCHING'
          })
        }, 2000)

        setTimeout(() => {
          addTypingMessage({
            type: 'result',
            content: `✓ Flight booked successfully!\n\nFlight Details:\n• Route: ${questionAnswers.destination || 'Destination'}\n• Date: ${questionAnswers.dates || 'TBD'}\n• Passengers: ${questionAnswers.people || '2'}\n\nCheck the notification or click on the "Find flights" card on the right to view full details.`,
            icon: RiCheckLine
          })
          
          // Trigger subtask completion
          if (onSubtaskComplete) {
            const flightDetails = {
              flight: {
                flightNumber: 'AA 1234',
                airline: 'American Airlines',
                departure: 'JFK Airport',
                departureTime: '10:30 AM',
                arrival: questionAnswers.destination ? `${questionAnswers.destination} Airport` : 'NRT Airport',
                arrivalTime: '2:45 PM',
                date: questionAnswers.dates || 'March 15, 2025',
                passengers: questionAnswers.people || '2',
                confirmationCode: 'ABC123XYZ'
              }
            }
            onSubtaskComplete('1', flightDetails)
          }
        }, 5000)

        // Simulate hotel booking after flight
        setTimeout(() => {
          addTypingMessage({
            type: 'executing',
            content: `Now booking your hotel... Finding the best accommodation options...`,
            icon: RiHotelLine,
            statusIndicator: 'ORBIN_BOOKING'
          })
        }, 7000)

        setTimeout(() => {
          addTypingMessage({
            type: 'result',
            content: `✓ Hotel booked successfully!\n\nHotel Details:\n• Location: ${questionAnswers.destination || 'Destination'}\n• Check-in: ${questionAnswers.dates || 'TBD'}\n• Guests: ${questionAnswers.people || '2'}\n\nCheck the notification or click on the "Book hotels" card to view full details.`,
            icon: RiCheckLine
          })
          
          // Trigger hotel subtask completion
          if (onSubtaskComplete) {
            const hotelDetails = {
              hotel: {
                name: 'Grand Tokyo Hotel',
                address: questionAnswers.destination || 'Tokyo, Japan',
                checkIn: questionAnswers.dates || 'March 15, 2025',
                checkOut: 'March 22, 2025',
                guests: questionAnswers.people || '2',
                roomType: 'Deluxe Suite',
                confirmationNumber: 'HTL789456'
              }
            }
            onSubtaskComplete('2', hotelDetails)
          }
        }, 10000)
      }

      // Expose function to parent
      ;(window as any).startVacationBooking = startBookingFlow
    }
  }, [onStartBooking, onSubtaskComplete, questionAnswers, addTypingMessage])

  const startDeploymentFlow = useCallback(() => {
    // Clear existing messages and start deployment flow
    setMessages([])
    
    let messageDelay = 0

    // Message 1: Deployment Start with ShiningText
    setTimeout(() => {
      addTypingMessage({
        type: 'summary',
        content: "On it! I'm being deployed to optimize your 23 blurry product images. I'll process each image using advanced AI upscaling and deploy them to your live store. Your store will remain safe until you approve each change.",
        icon: RiLoader4Fill,
        statusIndicator: 'ORBIN_DEPLOYING'
      })

      // Hide the summary after 4 seconds and show progress
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.type !== 'summary'))
      }, 4000)
    }, messageDelay)
    messageDelay += 2000

    // Message 2: Thinking Phase with ShiningText
    setTimeout(() => {
      addTypingMessage({
        type: 'summary',
        content: "Analyzing image quality patterns and determining optimal enhancement algorithms for each product image type.",
        icon: RiBrainLine,
        statusIndicator: 'ORBIN_THINKING'
      })

      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.type !== 'summary'))
      }, 3000)
    }, messageDelay)
    messageDelay += 2000

    // Message 3: Planning Phase with ShiningText  
    setTimeout(() => {
      addTypingMessage({
        type: 'summary',
        content: "Planning deployment sequence: batch processing 23 images, applying super-resolution AI, optimizing file formats, and preparing rollback procedures.",
        icon: RiBrainLine,
        statusIndicator: 'ORBIN_PLANNING'
      })

      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.type !== 'summary'))
      }, 3000)
    }, messageDelay)
    messageDelay += 2000

    // Message 4: Processing Images
    setTimeout(() => {
      addTypingMessage({
        type: 'executing',
        content: "Processing images using deep learning upscaling model... 8/23 complete",
        icon: RiLoader4Fill,
        statusIndicator: 'ORBIN_PROCESSING'
      })
    }, messageDelay)
    messageDelay += 3000

    // Message 5: Progress Update
    setTimeout(() => {
      addTypingMessage({
        type: 'executing',
        content: "Excellent progress! 18/23 images enhanced. File sizes reduced by 72% while maintaining quality.",
        icon: RiLoader4Fill,
        statusIndicator: 'ORBIN_OPTIMIZING'
      })
    }, messageDelay)
    messageDelay += 2000

    // Message 6: 19/23 complete
    setTimeout(() => {
      addTypingMessage({
        type: 'executing',
        content: "19/23 images complete...",
        icon: RiCheckLine,
        statusIndicator: 'ORBIN_PROCESSING'
      })
    }, messageDelay)
    messageDelay += 1500

    // Message 7: 20/23 complete
    setTimeout(() => {
      addTypingMessage({
        type: 'executing',
        content: "20/23 images complete...",
        icon: RiCheckLine,
        statusIndicator: 'ORBIN_PROCESSING'
      })
    }, messageDelay)
    messageDelay += 1500

    // Message 8: 21/23 complete
      setTimeout(() => {
      addTypingMessage({
        type: 'executing',
        content: "21/23 images complete...",
        icon: RiCheckLine,
        statusIndicator: 'ORBIN_PROCESSING'
      })
    }, messageDelay)
    messageDelay += 1500

    // Message 9: 22/23 complete
    setTimeout(() => {
      addTypingMessage({
        type: 'executing',
        content: "22/23 images complete...",
        icon: RiCheckLine,
        statusIndicator: 'ORBIN_PROCESSING'
      })
    }, messageDelay)
    messageDelay += 1500

    // Message 10: 23/23 complete
    setTimeout(() => {
      addTypingMessage({
        type: 'executing',
        content: "23/23 images complete - finalizing deployment...",
        icon: RiCheckLine,
        statusIndicator: 'ORBIN_FINALIZING'
      })
    }, messageDelay)
    messageDelay += 2000

    // Message 11: Deployment Complete
    setTimeout(() => {
      addTypingMessage({
        type: 'result',
        content: "All done! Successfully deployed 23 optimized images to your live store. Your customers will now see crisp, fast-loading product photos. Page load speed improved by 1.9 seconds!",
        icon: RiCheckLine,
        statusIndicator: 'ORBIN_COMPLETED'
      })

      // Trigger notification system after deployment completes
      setTimeout(() => {
        if (onAddNotification) {
          onAddNotification({
            type: 'deployment_complete',
            title: 'Agent completed image optimization',
            message: '23 product images successfully optimized and deployed',
            actionRequired: false,
            timestamp: Date.now(),
            taskId: 'store-health' // Add task ID for zoom functionality
          })
        }
      }, 2000)
    }, messageDelay)
    messageDelay += 3000

    // Message 12: Thinking About Next Steps with ShiningText
    setTimeout(() => {
      addTypingMessage({
        type: 'summary',
        content: "Analyzing remaining optimization opportunities and prioritizing next actions based on revenue impact and implementation complexity.",
        icon: RiBrainLine,
        statusIndicator: 'ORBIN_ANALYZING_NEXT'
      })

      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.type !== 'summary'))
      }, 3000)
    }, messageDelay)
    messageDelay += 2000

    // Message 13: Next Steps Recommendation
    setTimeout(() => {
      addTypingMessage({
        type: 'result',
        content: "What's next? I found 2 more high-impact issues: slow page loading (potential +$8,400/month) and mobile layout problems. Ready to tackle those?",
        icon: RiBrainLine
      })
    }, messageDelay)
  }, [addTypingMessage, onAddNotification])

  // Expose AI deployment function globally
  useEffect(() => {
    window.triggerAIDeployment = startDeploymentFlow
    return () => {
      delete window.triggerAIDeployment
    }
  }, [startDeploymentFlow])

  const startAIConversation = useCallback((task: TaskCard) => {
    // Initial greeting based on task type with structured framework
    const greetings = {
      'plan-vacation': "Hello! I'm your vacation planning assistant. I'll help you plan an amazing trip! Let me ask you a few questions to get started.",
      'store-health': "Hello! I'm your intelligent AI agent for Store Health Check. Let's break down what we'll accomplish together.",
      'seo': "Hello! I'm your intelligent AI agent for SEO Analysis. Let's approach this systematically.",
      'performance': "Hello! I'm your intelligent AI agent for Performance Optimization. Let's think through this step by step.",
      'conversion': "Hello! I'm your intelligent AI agent for Conversion Analysis. Let's plan our approach carefully.",
      'default': `Hello! I'm your intelligent AI agent for ${task.title}. Let's structure our approach to this task.`
    }

    const taskType = task.id === 'plan-vacation' ? 'plan-vacation' :
                    task.id.includes('health') ? 'store-health' :
                    task.id.includes('seo') ? 'seo' :
                    task.id.includes('performance') ? 'performance' :
                    task.id.includes('conversion') ? 'conversion' : 'default'

    // Sequential message flow - each waits for previous to complete
    let messageDelay = 0

    // Message 0: Shining Text Summary (Shows first, then disappears)
    setTimeout(() => {
      addTypingMessage({
        type: 'summary',
        content: `I'm Orbin AI, your intelligent agent for ${task.title}. I'll analyze your store comprehensively, identify optimization opportunities, and provide actionable recommendations. My process involves entering your store URL, running a detailed diagnostic scan, and generating a complete optimization report with specific fixes you can deploy instantly.`,
        icon: RiBrainLine,
        statusIndicator: 'ORBIN_THINKING'
      })

      // Hide the summary after 5 seconds and show normal responses
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.type !== 'summary'))
      }, 5000)
    }, messageDelay)
    messageDelay += 3000 // Fast transition to summary

    // Message 1: Quick Introduction
    setTimeout(() => {
      addTypingMessage({
        type: 'thinking',
        content: `${greetings[taskType]}`,
        icon: RiBrainLine,
        statusIndicator: 'ORBIN_THINKING'
      })
    }, messageDelay)
    messageDelay += 6000 // Increased for status indicator

    // Vacation-specific questions flow
    if (taskType === 'plan-vacation') {
      // Question 1: Destination
      setTimeout(() => {
        setIsAskingQuestion(true)
        setCurrentQuestion('destination')
        if (onQuestionStateChange) {
          onQuestionStateChange(true)
        }
        addTypingMessage({
          type: 'thinking',
          content: "Where would you like to go? (e.g., Japan, Paris, Bali)",
          icon: RiPlaneLine,
          statusIndicator: 'ORBIN_THINKING'
        })
      }, messageDelay)
      
      return // Exit early for vacation flow - wait for user input
    }

    // Message 2: Analysis (for non-vacation tasks)
    setTimeout(() => {
      addTypingMessage({
        type: 'thinking',
        content: "Analysis: I'll run a comprehensive store diagnostic to identify optimization opportunities.",
        icon: RiBrainLine,
        statusIndicator: 'ORBIN_ANALYZING'
      })
    }, messageDelay)
    messageDelay += 7000 // Increased for status indicator

    // Message 3: Plan
    setTimeout(() => {
      addTypingMessage({
        type: 'planning',
        content: "Plan:\n• Enter store URL\n• Run comprehensive scan\n• Generate optimization report",
        icon: RiBrainLine,
        statusIndicator: 'ORBIN_PLANNING'
      })
    }, messageDelay)
    messageDelay += 6000 // Increased for status indicator

    // Message 4: Execution - URL Entry
    setTimeout(() => {
      addTypingMessage({
        type: 'executing',
        content: "Execution: Entering demo URL for analysis...",
        icon: RiSearchEyeLine,
        statusIndicator: 'ORBIN_SEARCHING_TOOLS'
      })

      // Auto-enter URL after message completes
      setTimeout(() => {
        if (onAutoEnterUrl) {
          onAutoEnterUrl('https://demo-store.myshopify.com')
        }

        // Update plan to show first step completed
        setMessages(prev => prev.map(msg => {
          if (msg.content.includes('Plan:') && msg.content.includes('Enter store URL')) {
            return {
              ...msg,
              content: msg.content.replace('• Enter store URL', '• ~~Enter store URL~~')
            }
          }
          return msg
        }))
      }, 4000) // Wait for status + typing to complete
    }, messageDelay)
    messageDelay += 7000 // Increased for status indicator

    // Message 5: Execution - Start Scan
    setTimeout(() => {
      addTypingMessage({
        type: 'executing',
        content: "Starting comprehensive store scan...",
        icon: RiSearchEyeLine,
        statusIndicator: 'ORBIN_INITIALIZING'
      })

      // Auto-click scan button after message completes
      setTimeout(() => {
        if (onAutoStartScan) {
          onAutoStartScan()
        }

        // Update plan to show second step completed
        setMessages(prev => prev.map(msg => {
          if (msg.content.includes('Plan:') && msg.content.includes('Run comprehensive scan')) {
            return {
              ...msg,
              content: msg.content.replace('• Run comprehensive scan', '• ~~Run comprehensive scan~~')
            }
          }
          return msg
        }))
      }, 4000) // Wait for status + typing to complete
    }, messageDelay)
  }, [addTypingMessage, onAutoEnterUrl, onAutoStartScan, onVacationDataUpdate])

  const [scanningMessageShown, setScanningMessageShown] = useState(false)
  const [completionMessageShown, setCompletionMessageShown] = useState(false)

  const handleScanningProgress = useCallback(() => {
    console.log('handleScanningProgress called with scanProgress:', scanProgress)
    if (!currentTask) return

    // Simple scanning message - only show once
    if (scanProgress > 0 && scanProgress < 100 && !scanningMessageShown) {
      setScanningMessageShown(true)
      addTypingMessage({
        type: 'executing',
        content: "Scanning your store and analyzing optimization opportunities...",
        icon: RiSearchLine,
        status: 'active',
        statusIndicator: 'ORBIN_SCANNING'
      })
    }

    // Add completion message when scan reaches 100 - only once
    if (scanProgress >= 100 && !completionMessageShown) {
      console.log('Scan completed, showing health report...')
      setCompletionMessageShown(true)
        addTypingMessage({
          type: 'summary',
        content: "Analysis complete! I've identified key optimization opportunities. Here are your detailed findings:",
          icon: RiCheckLine,
          status: 'completed',
          statusIndicator: 'ORBIN_GENERATING_REPORT'
        })
      
      // Update plan to show final step completed
      setTimeout(() => {
        setMessages(prev => prev.map(msg => {
          if (msg.content.includes('Plan:') && msg.content.includes('Generate optimization report')) {
            return {
              ...msg,
              content: msg.content.replace('• Generate optimization report', '• ~~Generate optimization report~~')
            }
          }
          return msg
        }))

        // Trigger notification for scanning completion
        if (onAddNotification) {
          onAddNotification({
            type: 'info',
            title: 'Store Scan Complete',
            message: 'Your store health analysis is ready with optimization recommendations',
            actionRequired: false,
            timestamp: Date.now(),
            taskId: 'store-health' // Add task ID for zoom functionality
          })
        }
      }, 4000)
      
      // Health report will show automatically in LoadingPage when scanProgress reaches 100%
    }
  }, [currentTask, addTypingMessage, scanProgress, scanningMessageShown, completionMessageShown, onAddNotification])




  // Get the current active task
  useEffect(() => {
    if (expandedCards.length > 0) {
      const activeTaskId = expandedCards[expandedCards.length - 1]
      const task = taskCards.find(t => t.id === activeTaskId)
      
      if (task) {
        // If task changed, reset everything
        if (task !== currentTask) {
          // Prevent duplicate initialization - only if already initialized AND conversation started
          if (initializedTaskIdRef.current === task.id && conversationStartedRef.current) {
            return
          }
          
          // Reset flags and state
          initializedTaskIdRef.current = task.id
          conversationStartedRef.current = false
          setCurrentTask(task)
          setMessages([]) // Reset messages for new task
          setShowSkeleton(true)
          setScanningMessageShown(false) // Reset scanning message flag
          setCompletionMessageShown(false) // Reset completion message flag
          setUserInput('')
          setIsAskingQuestion(false)
          setCurrentQuestion(null)
          setQuestionAnswers({})
          setShowPackages(false)
        }
        
        // Start conversation if not already started (for both new and existing tasks)
        if (initializedTaskIdRef.current === task.id && !conversationStartedRef.current) {
          const timeoutId = setTimeout(() => {
            // Double check we haven't already started
            if (initializedTaskIdRef.current === task.id && !conversationStartedRef.current) {
              conversationStartedRef.current = true
              setShowSkeleton(false)
              startAIConversation(task)
            }
          }, 2000)
          
          return () => {
            clearTimeout(timeoutId)
          }
        }
      }
    } else {
      setCurrentTask(null)
      setMessages([])
      setShowSkeleton(true)
      initializedTaskIdRef.current = null
      conversationStartedRef.current = false
      setUserInput('')
      setIsAskingQuestion(false)
      setCurrentQuestion(null)
      setQuestionAnswers({})
      setShowPackages(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedCards, taskCards, currentTask])



  // React to scanning progress
  useEffect(() => {
    console.log('useEffect triggered:', { isScanning, scanProgress, currentTask: !!currentTask })
    if (isScanning && scanProgress > 0 && currentTask) {
      console.log('Calling handleScanningProgress with scanProgress:', scanProgress)
      handleScanningProgress()
    }
  }, [scanProgress, isScanning, currentTask, handleScanningProgress])



  if (!currentTask) return null

  return (
    <div 
      className="rounded-2xl border shadow-2xl backdrop-blur-xl overflow-hidden h-full flex flex-col"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#E5E7EB',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b bg-white" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <RiSparklingFill size={16} style={{ color: '#374151' }} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Ask Orbin Agent...</div>
            </div>
          </div>
          
          {/* Right side icons */}
          <div className="flex items-center gap-2">
            {(isScanning || messages.some(m => m.isTyping)) && (
              <RiLoader2Line size={16} className="animate-spin" style={{ color: '#374151' }} />
            )}
            <RiPauseCircleFill size={16} style={{ color: '#374151' }} />
          </div>
        </div>
      </div>

      {/* Task Heading - Truncated */}
      <div className="px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-gray-800 truncate">
            {expandedCards.length > 0 && taskCards.find(task => expandedCards.includes(task.id))?.title}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">live</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto min-h-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9CA3AF #F9FAFB',
          maxHeight: '100%'
        }}
        ref={(el) => {
          if (el) {
            // Auto-scroll to bottom when new messages arrive
            if (messages.length > 0 || showPackages) {
              setTimeout(() => {
                el.scrollTop = el.scrollHeight;
              }, 100);
            }
          }
        }}
      >
        <style>{`
          .flex-1.overflow-y-auto::-webkit-scrollbar {
            width: 8px;
          }
          .flex-1.overflow-y-auto::-webkit-scrollbar-track {
            background: #F9FAFB;
            border-radius: 10px;
          }
          .flex-1.overflow-y-auto::-webkit-scrollbar-thumb {
            background: #9CA3AF;
            border-radius: 10px;
          }
          .flex-1.overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #6B7280;
          }
        `}</style>
        <div className="p-4 space-y-4">
          {showSkeleton ? (
            /* Skeleton Loader */
            <div className="space-y-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
            {messages.map((message) => {
              // Use icon from message if provided, otherwise determine based on content and type
              let IconComponent = message.icon || RiSparklingFill
              const iconStyle = { color: '#374151' } // Dark gray
              const isUserMessage = message.type === 'user'
              
              // If no icon provided, determine based on message content and type
              if (!message.icon) {
                if (message.type === 'thinking' || message.content.toLowerCase().includes('thinking') || message.content.toLowerCase().includes('analyzing') || message.content.toLowerCase().includes('planning')) {
                  IconComponent = RiBrainLine
                } else if (message.type === 'result' || message.content.toLowerCase().includes('search') || message.content.toLowerCase().includes('found') || message.content.toLowerCase().includes('scanning')) {
                  IconComponent = RiSearchEyeLine
                }
              }
              
              return (
                <div key={message.id} className={`flex items-start gap-3 animate-fadeIn ${isUserMessage ? 'flex-row-reverse' : ''}`}>
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <IconComponent 
                      size={14} 
                      style={iconStyle} 
                      className={IconComponent === RiLoader4Fill ? 'animate-spin' : ''}
                    />
                  </div>
                  <div className={`flex-1 min-w-0 ${isUserMessage ? 'text-right' : ''}`}>
                    {message.type === 'summary' ? (
                      <div className="mb-3">
                        <ShiningText text={message.content} className="text-sm leading-relaxed" />
                      </div>
                    ) : (
                      <p className={`text-sm leading-relaxed ${
                        message.isTyping ? 'text-gray-600' : 'text-gray-800'
                      }`} style={{ fontSize: '16px' }}>
                        <>
                          {message.content.split('\n').map((line, index) => (
                            <span key={index}>
                              {line.includes('~~') ? (
                                // Handle strikethrough text
                                line.split('~~').map((part, partIndex) => (
                                  partIndex % 2 === 1 ? (
                                    <span key={partIndex} style={{ textDecoration: 'line-through', color: '#9CA3AF' }}>
                                      {part}
                                    </span>
                                  ) : (
                                    <span key={partIndex}>{part}</span>
                                  )
                                ))
                              ) : (
                                line
                              )}
                              {index < message.content.split('\n').length - 1 && <br />}
                            </span>
                          ))}
                        {message.isTyping && (
                          <span className="inline-block w-0.5 h-4 ml-1 animate-pulse" style={{ backgroundColor: '#374151' }}></span>
                        )}
                      </>
                      </p>
                    )}
                    <div className="text-xs text-gray-400 mt-1" style={{ fontSize: '12px' }}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Inline date picker helper directly under the question message */}
            {currentQuestion === 'dates' && (
              <div className="mt-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                <div className="mb-1 font-medium text-gray-800">
                  Select your travel dates
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                  <span className="text-[11px] text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                  <button
                    type="button"
                    disabled={!dateFrom || !dateTo}
                    onClick={() => {
                      if (!dateFrom || !dateTo) return
                      const formatted = `${dateFrom} - ${dateTo}`
                      setUserInput(formatted)
                      setDateFrom('')
                      setDateTo('')
                      handleUserAnswer()
                    }}
                    className="px-3 py-1.5 bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-[11px] font-medium transition-colors"
                  >
                    Use these dates
                  </button>
                </div>
              </div>
            )}
            </>
          )}
          
          {/* Packages Display - Show as part of chat messages */}
          {showPackages && (
            <div className="mt-4">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Top 3 Vacation Packages</h3>
                <p className="text-xs text-gray-600">Click on a package to start planning</p>
              </div>
              <div className="space-y-2">
                {[
                  {
                    id: 'package-1',
                    title: 'Premium Experience',
                    price: `$${questionAnswers.budget || '5000'}`,
                    highlights: [
                      '5-star luxury hotels',
                      'Private guided tours',
                      'Fine dining reservations',
                      'VIP airport transfers'
                    ]
                  },
                  {
                    id: 'package-2',
                    title: 'Balanced Adventure',
                    price: `$${Math.floor(parseInt(questionAnswers.budget || '5000') * 0.7)}`,
                    highlights: [
                      '4-star boutique hotels',
                      'Small group tours',
                      'Mix of fine & casual dining',
                      'Comfortable transportation'
                    ]
                  },
                  {
                    id: 'package-3',
                    title: 'Budget-Friendly',
                    price: `$${Math.floor(parseInt(questionAnswers.budget || '5000') * 0.5)}`,
                    highlights: [
                      '3-star central hotels',
                      'Self-guided itineraries',
                      'Local food experiences',
                      'Public transport included'
                    ]
                  }
                ].map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => handlePackageSelect(pkg.id)}
                    className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all bg-white"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{pkg.title}</h4>
                      <span className="text-sm font-bold text-gray-900">{pkg.price}</span>
                    </div>
                    <ul className="space-y-1">
                      {pkg.highlights.map((highlight, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Field - Always visible */}
      <div className="p-4 border-t bg-white" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isAskingQuestion ? "Type your answer here..." : "Type a message or ask a question..."}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'black'
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 0, 0, 0.2)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB'
              e.currentTarget.style.boxShadow = 'none'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && userInput.trim()) {
                handleUserAnswer()
              }
            }}
          />
          <button
            onClick={handleUserAnswer}
            disabled={!userInput.trim()}
            className="px-4 py-2 bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
          >
            Send
          </button>
        </div>
      </div>

    </div>
  )
}

const DEFAULT_TASKS: TaskCard[] = [
  {
    id: 'store-health',
    title: 'Store Health Check',
    subtitle: 'Connect your Shopify store for an instant AI diagnostic and optimization recommendations',
    icon: RiPulseLine,
    iconBg: DARK_PALETTE.primary
  },
  {
    id: 'plan-vacation',
    title: 'Plan My Vacation',
    subtitle: 'Plan a 7-day trip to Japan: find flights, book hotels, create an itinerary, reserve restaurants, and get travel insurance',
    icon: RiPlaneLine,
    iconBg: DARK_PALETTE.secondary
  }
]





export default function CanvasLanding() {
  const [taskCards, setTaskCards] = useState<TaskCard[]>(DEFAULT_TASKS)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [showEditTask, setShowEditTask] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<string | null>(null)
  const [editTaskName, setEditTaskName] = useState('')
  const [editTaskDesc, setEditTaskDesc] = useState('')
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [vacationData, setVacationData] = useState<{destination: string, duration: string, ready: boolean} | null>(null)
  const [isAskingVacationQuestions, setIsAskingVacationQuestions] = useState(false)
  const [showAuthorizationModal, setShowAuthorizationModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<{id: string, name: string, price: string, highlights: string[]} | null>(null)
  const [showPaymentGateway, setShowPaymentGateway] = useState(false)
  const [showPackagePreview, setShowPackagePreview] = useState(false)
  const [vacationSubtasks, setVacationSubtasks] = useState<Array<{id: string, title: string, status: 'pending' | 'in-progress' | 'completed', agent?: string, details?: any}>>([
    { id: '1', title: 'Find flights', status: 'pending' },
    { id: '2', title: 'Book hotels', status: 'pending' },
    { id: '3', title: 'Create itinerary', status: 'pending' },
    { id: '4', title: 'Reserve restaurants', status: 'pending' },
    { id: '5', title: 'Get travel insurance', status: 'pending' }
  ])
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<{id: string, title: string, status: 'pending' | 'in-progress' | 'completed', agent?: string, details?: any} | null>(null)
  

  useEffect(() => {
    try {
      // Clear any saved tasks - we only want the 2 default cards
      localStorage.removeItem('aggo_tasks')
    } catch {
      // ignore persistence errors
    }
  }, [])
  const handleCreateTask = () => {
    if (!newTaskName.trim()) return
    
    // Create a new unique task ID
    const newTaskId = `task-${Date.now()}`
    const newTask: TaskCard = {
      id: newTaskId,
      title: newTaskName.trim(),
      subtitle: newTaskDesc.trim() || 'Custom AI task',
      icon: RiStarFill,
      iconBg: DARK_PALETTE.secondary
    }
    
    // Add the new task to taskCards
    setTaskCards(prev => [...prev, newTask])
    
    // Reset form and close modal
    setNewTaskName('')
    setNewTaskDesc('')
    setShowAddTask(false)
  }

  const cancelCreateTask = () => {
    setNewTaskName('')
    setNewTaskDesc('')
    setShowAddTask(false)
  }

  // Handle delete confirmation
  const handleDeleteClick = (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent card click
    setTaskToDelete(taskId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      // Remove from expanded cards if currently expanded
      setExpandedCards(prev => prev.filter(id => id !== taskToDelete))
      // Remove from task cards
      setTaskCards(prev => prev.filter(t => t.id !== taskToDelete))
      // Clear notifications related to this task
      setNotifications(prev => prev.filter(n => n.taskId !== taskToDelete))
      // Remove from project sections if it's in any
      setProjectSections(prev => {
        const newSections = { ...prev }
        Object.keys(newSections).forEach(sectionId => {
          newSections[sectionId] = {
            ...newSections[sectionId],
            projects: newSections[sectionId].projects.filter(id => id !== taskToDelete)
          }
          // Remove empty sections
          if (newSections[sectionId].projects.length === 0) {
            delete newSections[sectionId]
          }
        })
        return newSections
      })
    }
    setShowDeleteConfirm(false)
    setTaskToDelete(null)
  }

  const cancelDeleteTask = () => {
    setShowDeleteConfirm(false)
    setTaskToDelete(null)
  }

  // Handle edit task
  const handleEditClick = (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent card click
    const task = taskCards.find(t => t.id === taskId)
    if (task) {
      setTaskToEdit(taskId)
      setEditTaskName(task.title)
      setEditTaskDesc(task.subtitle)
      setShowEditTask(true)
    }
  }

  const confirmEditTask = () => {
    if (taskToEdit && editTaskName.trim()) {
      setTaskCards(prev => prev.map(task => 
        task.id === taskToEdit 
          ? { ...task, title: editTaskName.trim(), subtitle: editTaskDesc.trim() || task.subtitle }
          : task
      ))
      setShowEditTask(false)
      setTaskToEdit(null)
      setEditTaskName('')
      setEditTaskDesc('')
    }
  }

  const cancelEditTask = () => {
    setShowEditTask(false)
    setTaskToEdit(null)
    setEditTaskName('')
    setEditTaskDesc('')
  }
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isViewportLocked, setIsViewportLocked] = useState(false)
  const [expandedCards, setExpandedCards] = useState<string[]>([])
  const [scanProgress, setScanProgress] = useState(0)
  const [storeUrl, setStoreUrl] = useState('')
  const loadingPageScanRef = useRef<(() => void) | null>(null)
  const [activeAgent, setActiveAgent] = useState<{
    name: string
    icon: React.ComponentType<{ size?: string | number }>
    status: 'ready' | 'analyzing' | 'processing' | 'completed'
    statusText: string
    subheading?: string
    useLogo?: boolean
  }>({
    name: 'Claude',
    icon: RiStarFill,
    status: 'ready',
    statusText: 'Ready to analyze your store',
    subheading: 'Store Health Analysis Agent',
    useLogo: true
  })

  
  // Auto functions for AI to control interface
  const handleAutoEnterUrl = (url: string) => {
    setStoreUrl(url)
  }
  
  const handleAutoStartScan = () => {
    if (storeUrl && loadingPageScanRef.current) {
      // Call the LoadingPage's handleStartScan directly
      loadingPageScanRef.current()
    } else if (!storeUrl) {
      // Ensure URL is set before scanning
      setStoreUrl('https://demo-store.myshopify.com')
      setTimeout(() => {
        if (loadingPageScanRef.current) {
          loadingPageScanRef.current()
        }
      }, 100)
    }
  }
  
  const handleLoadingPageScanReady = (scanFn: () => void) => {
    loadingPageScanRef.current = scanFn
  }

  const [showAiSearch, setShowAiSearch] = useState(false)
  const [aiSearchQuery, setAiSearchQuery] = useState('')

  // Handle AI search submission - create new Store Health Check instance
  const handleAiSearchSubmit = () => {
    if (!aiSearchQuery.trim()) return
    
    // Extract URL from query if present
    const urlMatch = aiSearchQuery.match(/https?:\/\/[^\s]+/)
    const extractedUrl = urlMatch ? urlMatch[0] : ''
    
    // Create a new unique store health task
    const newTaskId = `store-health-${Date.now()}`
    const newTask: TaskCard = {
      id: newTaskId,
      title: 'Store Health Check',
      subtitle: `Analysis for: ${extractedUrl || 'New Store'}`,
      icon: RiPulseLine,
      iconBg: DARK_PALETTE.primary
    }
    
    // Add the new task to taskCards
    setTaskCards(prev => [...prev, newTask])
    
    // Set the URL for this specific instance
    if (extractedUrl) {
      setStoreUrl(extractedUrl)
    }
    
    // Clear search and close search bar
    setAiSearchQuery('')
    setShowAiSearch(false)
    
    // Trigger the new task
    setTimeout(() => {
      handleTaskClick(newTaskId)
    }, 100) // Small delay to ensure task is added first
  }

  // Notification System State
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [showActionCenter, setShowActionCenter] = useState(false)

  // Notification System Functions
  const addNotification = useCallback((notification: Omit<NotificationItem, 'id'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: Date.now().toString()
    }
    setNotifications(prev => [newNotification, ...prev])
    
    // Auto-show action center for action required notifications
    if (notification.actionRequired) {
      setShowActionCenter(true)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications([])
  }, [])

  // Deployment Flow Function - triggers AI conversation deployment
  const startDeploymentFlow = useCallback(() => {
    // Trigger deployment in the active AI conversation card
    if (window.triggerAIDeployment) {
      window.triggerAIDeployment()
    }
  }, [])

  // Expose functions globally
  useEffect(() => {
    window.triggerDeploymentFlow = startDeploymentFlow
    window.triggerNotificationSystem = addNotification
    return () => {
      delete window.triggerDeploymentFlow
      delete window.triggerNotificationSystem
    }
  }, [startDeploymentFlow, addNotification])

  const [sectionMode, setSectionMode] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [projectSections, setProjectSections] = useState<{[key: string]: {
    projects: string[]
    name: string
    description?: string
  }}>({}) // sectionId -> section data
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)



  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (isViewportLocked) return
    e.preventDefault()
    const delta = e.deltaY * -0.001
    const newZoom = Math.min(Math.max(0.3, zoom + delta), 3)
    setZoom(newZoom)
  }

  // Handle mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isViewportLocked) return
    // Only allow dragging with middle mouse button (button 1)
    if (e.button === 1) {
      e.preventDefault()
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isViewportLocked) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        setZoom(prev => Math.min(prev + 0.1, 3))
      } else if (e.key === '-') {
        e.preventDefault()
        setZoom(prev => Math.max(prev - 0.1, 0.3))
      } else if (e.key === 'Escape') {
        if (sectionMode) {
          setSectionMode(false)
          setSelectedProjects([])
        } else {
          setExpandedCards([])
          setScanProgress(0)
          // Clear notifications when closing all tasks
          setNotifications([])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sectionMode])







  // Handle task card click
  const handleTaskClick = (taskId: string) => {
    if (taskId === 'plan-vacation') {
      // Expand vacation planning on canvas (like Store Health Check)
      if (!expandedCards.includes(taskId)) {
        setExpandedCards(prev => [...prev, taskId])
        setNotifications([])
        setActiveAgent(prev => ({
          ...prev,
          name: 'Orbin AI',
          statusText: 'Ready to plan your vacation',
          subheading: 'Vacation Planning Agent',
          status: 'ready'
        }))
      }
    } else if (taskId === 'store-health' || taskId.startsWith('store-health-')) {
      if (!expandedCards.includes(taskId)) {
        setExpandedCards(prev => [...prev, taskId])
        setScanProgress(0)
        // Clear notifications when opening a new task
        setNotifications([])
        setActiveAgent(prev => ({
          ...prev,
          name: 'Claude',
          statusText: 'Ready to analyze your store',
          subheading: 'Store Health Analysis Agent',
          status: 'ready'
        }))
        // Don't clear storeUrl here - it should be set from AI search if provided
      }
    } else if (taskId === 'seo-optimizer' || taskId.includes('seo')) {
      // Handle SEO optimizer (existing interface is built)
      if (!expandedCards.includes(taskId)) {
        setExpandedCards(prev => [...prev, taskId])
        // Clear notifications when opening a new task
        setNotifications([])
      }
    } else {
      // Handle other custom tasks - they'll show a basic interface
      if (!expandedCards.includes(taskId)) {
        setExpandedCards(prev => [...prev, taskId])
        // Clear notifications when opening a new task
        setNotifications([])
      }
    }
  }

  // Reset view
  const resetView = () => {
    // Only normalize zoom/pan; keep all canvas state (open projects, sections, selections)
    setZoom(0.3) // Reset to minimum zoom (30%)
    setPan({ x: 0, y: 0 })
  }

  // Zoom to specific task
  const zoomToTask = (taskId: string) => {
    // Make sure the task is expanded if it's not already
    if (!expandedCards.includes(taskId)) {
      setExpandedCards(prev => [...prev, taskId])
    }
    // Reset zoom and pan to center on the task
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Handle section mode
  const handleSectionClick = () => {
    if (sectionMode && selectedProjects.length > 0) {
      // Create section from selected projects
      const sectionId = `section-${Date.now()}`
      setProjectSections(prev => ({
        ...prev,
        [sectionId]: {
          projects: [...selectedProjects],
          name: `Section ${Object.keys(prev).length + 1}`,
          description: `${selectedProjects.length} projects grouped together`
        }
      }))
      setSelectedProjects([])
      setSectionMode(false)
      setEditingSection(sectionId) // Auto-edit new section name
    } else {
      // Toggle section mode
      setSectionMode(!sectionMode)
      setSelectedProjects([])
    }
  }

  // Handle project selection in section mode
  const handleProjectSelection = (projectId: string) => {
    if (sectionMode) {
      setSelectedProjects(prev => 
        prev.includes(projectId) 
          ? prev.filter(id => id !== projectId)
          : [...prev, projectId]
      )
    }
  }

  // Get section for project
  const getProjectSection = (projectId: string) => {
    return Object.entries(projectSections).find(([, sectionData]) => 
      sectionData.projects.includes(projectId)
    )?.[0]
  }

  // Update section name
  const updateSectionName = (sectionId: string, name: string, description?: string) => {
    setProjectSections(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        name,
        description
      }
    }))
  }

  return (
    <div 
      className="fixed inset-0 overflow-hidden" 
      style={{ 
        background: 'radial-gradient(ellipse 120% 80% at top left, #B8D4E8 0%, #C8DCE8 25%, #D6E3F0 50%, #E2E6EB 75%, #E2E6EB 100%)'
      }}
    >
      {/* Canvas Container */}
      <div
        ref={canvasRef}
        className={`w-full h-full ${!showAddTask ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        onWheel={!showAddTask ? handleWheel : undefined}
        onMouseDown={!showAddTask ? handleMouseDown : undefined}
        onMouseMove={!showAddTask ? handleMouseMove : undefined}
        onMouseUp={!showAddTask ? handleMouseUp : undefined}
        onMouseLeave={!showAddTask ? handleMouseUp : undefined}
      >
        {/* Transformable Content */}
        <div
          className="w-full h-full flex flex-col items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
            minWidth: '100vw'
          }}
        >
          {/* Logo and Welcome */}
          <div className="text-center mb-16">
            <div className="mb-8">
              <img 
                src={shopOSLogo} 
                alt="Orbin" 
                className="h-16 mx-auto"
                draggable={false}
              />
            </div>
            <h1 className="text-4xl font-light text-gray-800 font-sans">
              Welcome to Orbin
            </h1>
          </div>

          {/* Task Cards Grid */}
          <div className="flex gap-6 justify-center w-full">
            {/* Task Cards */}
            {taskCards.map((task) => {
              const iconMap: Record<string, React.ComponentType<{ size?: string | number }>> = {
                'store-health': RiPulseLine,
                'plan-vacation': RiPlaneLine
              }
              const IconComponent = (task.icon || iconMap[task.id] || RiStarFill)
              return (
                <div
                  key={task.id}
                  className="group rounded-3xl p-6 shadow-xl cursor-pointer border border-white/20 backdrop-blur-2xl overflow-hidden relative"
                  onClick={() => handleTaskClick(task.id)}
                  style={{ 
                    width: '320px',
                    height: '380px',
                    background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%)`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: `
                      0 20px 60px rgba(0, 0, 0, 0.08),
                      0 8px 32px rgba(0, 0, 0, 0.06),
                      inset 0 1px 0 rgba(255, 255, 255, 0.8)
                    `
                  }}
                >
                  <div className="flex flex-col h-full relative z-10">
                    {/* Icon at top - left aligned */}
                    <div className="flex justify-start mb-6">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ 
                          color: '#374151'
                        }}
                      >
                        <IconComponent size={32} />
                      </div>
                    </div>

                    {/* Title below icon */}
                    <div className="text-left mb-4">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">
                          {task.title}
                        </h3>
                    </div>
                    
                    {/* Subtitle below title */}
                    <div className="text-left mb-8 flex-1">
                      <p className="text-gray-700 text-sm leading-relaxed font-medium">
                      {task.subtitle}
                    </p>
                    </div>
                    
                    {/* Action buttons at bottom */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // More options action
                          }}
                          className="px-3 py-2 text-xs bg-gray-100 rounded-lg"
                        >
                          More Options
                        </button>
                        </div>

                      {/* Edit and Delete buttons for custom tasks */}
                      {task.id !== 'store-health' && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleEditClick(task.id, e)}
                            className="p-2 rounded-full bg-blue-100"
                            title="Edit task"
                          >
                            <RiEditLine size={16} className="text-blue-500" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(task.id, e)}
                            className="p-2 rounded-full bg-red-100"
                            title="Delete task"
                          >
                            <RiDeleteBinLine size={16} className="text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/20 pointer-events-none"></div>
                </div>
              )
            })}

            {/* Add Task Card */}
            <div
              className="group rounded-3xl p-6 shadow-xl cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 backdrop-blur-2xl overflow-hidden relative transition-all duration-300"
              onClick={() => setShowAddTask(true)}
              style={{ 
                width: '320px',
                height: '380px',
                background: `linear-gradient(135deg, rgba(248, 249, 250, 0.98) 0%, rgba(243, 244, 246, 0.92) 100%)`,
                backdropFilter: 'blur(20px)',
                boxShadow: `
                  0 20px 60px rgba(0, 0, 0, 0.05),
                  0 8px 32px rgba(0, 0, 0, 0.03),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `
              }}
            >
              <div className="flex flex-col h-full relative z-10">
                {/* Plus Icon - left aligned */}
                <div className="flex justify-start mb-6">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 group-hover:border-gray-400 transition-colors"
                    style={{ 
                      color: '#6B7280'
                    }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-700 leading-tight group-hover:text-gray-900 transition-colors text-left">
                    Create a new task
                  </h3>
          </div>

                {/* Subtitle */}
                <div className="mb-8 flex-1">
                  <p className="text-gray-500 text-sm leading-relaxed font-medium group-hover:text-gray-600 transition-colors text-left">
                    Create a new custom AI task with your own name and description
                  </p>
                </div>
                
                {/* Action section */}
                <div className="pt-4 border-t border-dashed border-gray-200">
                  <div className="flex items-center justify-start">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAddTask(true)
                      }}
                      className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>

              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-100/20 pointer-events-none"></div>
            </div>
          </div>

          {/* Section Headers */}
          {Object.entries(projectSections).map(([sectionId, sectionData]) => {
            const sectionProjects = sectionData.projects.filter(projectId => expandedCards.includes(projectId))
            if (sectionProjects.length === 0) return null
            
            // Each project is 1440px wide. Gap between projects is 48px (gap-12).
            // The section container also has horizontal padding p-6 (24px each side = 48px total).
            // Add an extra small buffer (24px) to avoid subpixel overflow at certain zoom levels.
            const sectionWidth =
              sectionProjects.length * 1440 +
              (sectionProjects.length - 1) * 48 +
              48 +
              24
            // => total = projects + gaps + container padding + buffer
            
            return (
              <div key={sectionId} className="mt-16 flex flex-col items-start">
                {/* Section Container with Background */}
                <div 
                  className="bg-gradient-to-br from-blue-50/40 to-gray-50/40 rounded-3xl p-6 border border-blue-200/30"
                  style={{ width: `${sectionWidth}px` }}
                >
                  {/* Section Header */}
                  <div className="mb-6 p-4 rounded-3xl border bg-white/80 backdrop-blur-sm border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingSection === sectionId ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={sectionData.name}
                            onChange={(e) => updateSectionName(sectionId, e.target.value, sectionData.description)}
                            onBlur={() => setEditingSection(null)}
                            onKeyPress={(e) => e.key === 'Enter' && setEditingSection(null)}
                            className="text-xl font-bold bg-transparent border-b-2 border-gray-300 focus:border-gray-500 outline-none text-gray-900"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={sectionData.description || ''}
                            onChange={(e) => updateSectionName(sectionId, sectionData.name, e.target.value)}
                            placeholder="Add description..."
                            className="text-sm bg-transparent border-b border-gray-200 focus:border-gray-400 outline-none text-gray-600 w-full"
                          />
                        </div>
                      ) : (
                        <div onClick={() => setEditingSection(sectionId)} className="cursor-pointer">
                          <h2 className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                            {sectionData.name}
                          </h2>
                          {sectionData.description && (
                            <p className="text-sm text-gray-600 mt-1">{sectionData.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-full">
                        {sectionProjects.length} project{sectionProjects.length > 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => {
                          setProjectSections(prev => {
                            const newSections = { ...prev }
                            delete newSections[sectionId]
                            return newSections
                          })
                        }}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors text-gray-400 hover:text-red-600"
                        title="Remove section"
                      >
                        <RiCloseLine size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Sectioned Projects Container */}
                <div className="flex gap-12 mt-6">
                  {sectionProjects.map(projectId => (
                    <div key={projectId} className="contents">


                      {(projectId === 'store-health' || projectId.startsWith('store-health-')) && expandedCards.includes(projectId) && (
                        <div 
                          className={`transition-all duration-300 ${
                            sectionMode ? 'cursor-pointer' : ''
                          } ${
                            selectedProjects.includes('store-health') ? 'border-2 border-dashed border-gray-600' : ''
                          }`}
                          style={{ 
                            width: '1440px',
                            minWidth: '1440px',
                            flexShrink: 0
                          }}
                          onClick={() => handleProjectSelection('store-health')}
                        >
                          {/* Store Health Check Full Interface */}
                          <div className="text-left mb-6 relative">
                            <div className="flex items-center">
                              <div>
                                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                                  Store Health Check
                                </h1>
                                <p className="text-lg text-gray-600">
                                  AI-powered diagnostic and optimization workspace
                                </p>
                              </div>

                            </div>
                          </div>
                          

                          {/* Notification Banner - Outside glassmorphism */}
                          <div className="w-full mb-4">
                            <NotificationBanner activeAgent={activeAgent} />
                          </div>

                          {/* Two Section Layout */}
                          <div 
                            className="rounded-lg shadow-2xl border border-white/40 backdrop-blur-xl overflow-hidden"
                            style={{ 
                              background: 'rgba(255, 255, 255, 0.1)',
                              backdropFilter: 'blur(25px)',
                              boxShadow: `
                                0 12px 40px rgba(0, 0, 0, 0.15),
                                inset 0 1px 0 rgba(255, 255, 255, 0.6),
                                inset 0 -1px 0 rgba(255, 255, 255, 0.3)
                              `,
                              minHeight: 'auto'
                            }}
                          >
                            <div className="p-6">
                              {/* Full Width Section - Loading Page (100%) */}
                              <div className="w-full">
                                <LoadingPage
                                  storeUrl={storeUrl}
                                  setStoreUrl={setStoreUrl}
                                  onStartScan={handleLoadingPageScanReady}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>
            </div>
            )
          })}





          {/* Projects Container - Full Canvas Layout */}
          <div className="mt-26 w-full flex flex-wrap gap-12 justify-center" style={{ minWidth: '100vw', padding: '0 2rem', marginBottom: '50px' }}>

            {/* Store Health Check Expandable Interfaces - Only when NOT in section */}
            {expandedCards.filter(cardId => (cardId === 'store-health' || cardId.startsWith('store-health-')) && !getProjectSection(cardId)).map(storeHealthId => (
              <div 
                key={storeHealthId}
                className={`transition-all duration-300 ${
                  sectionMode ? 'cursor-pointer' : ''
                } ${
                  selectedProjects.includes(storeHealthId) ? 'border-2 border-dashed border-gray-600' : ''
                }`}
                              style={{ 
                  width: '1440px',
                  minWidth: '1440px',
                  flexShrink: 0,
                  marginBottom: '50px'
                }}
                onClick={() => handleProjectSelection(storeHealthId)}
              >
              {/* Main Heading */}
              <div className="text-left mb-6 relative" style={{ marginTop: '120px' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">
                      Store Health Check
                    </h1>
                    <p className="text-lg text-gray-600">
                      AI-powered diagnostic and optimization workspace
                    </p>
                  </div>

                </div>
                        </div>



              {/* Interface with AI Card Layout */}
              <div className="flex gap-6">
                {/* AI Conversation Card & Agents - Left Side */}
                <div 
                  className="flex-shrink-0 space-y-4"
                  style={{ 
                    width: '320px'
                  }}
                >
                  {/* AI Conversation Card */}
                  <div style={{ height: '500px' }}>
                    <AIConversationCard 
                      taskCards={taskCards}
                      expandedCards={[storeHealthId]} // Show the specific store health task
                      scanProgress={scanProgress}
                      isScanning={scanProgress > 0 && scanProgress < 100}
                      onAutoEnterUrl={handleAutoEnterUrl}
                      onAutoStartScan={handleAutoStartScan}
                      onAddNotification={addNotification}
                    />
                  </div>

                  {/* AI Agents Display */}
                  <div 
                    className="rounded-2xl p-4 border border-white/40 backdrop-blur-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(25px)',
                      boxShadow: `
                        0 12px 40px rgba(0, 0, 0, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.6),
                        inset 0 -1px 0 rgba(255, 255, 255, 0.3)
                      `
                    }}
                  >
                    <div className="text-center mb-3">
                      <h4 className="text-sm font-semibold text-gray-800">AI Agents Used</h4>
                      <p className="text-xs text-gray-600">Powering this analysis</p>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      {/* Perplexity */}
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-10 h-10 flex items-center justify-center shadow-sm border border-white/30 overflow-hidden"
                          style={{
                            background: 'white',
                            borderRadius: '50% 40% 50% 40%',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <img 
                            src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/perplexity-ai-icon.png" 
                            alt="Perplexity" 
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <span className="text-xs font-bold text-blue-600 hidden">P</span>
                        </div>
                        <span className="text-xs text-gray-700 mt-1">Perplexity</span>
                      </div>

                      {/* ChatGPT */}
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-10 h-10 flex items-center justify-center shadow-sm border border-white/30 overflow-hidden"
                          style={{
                            background: 'white',
                            borderRadius: '50% 40% 50% 40%',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" 
                            alt="ChatGPT" 
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <span className="text-xs font-bold text-green-600 hidden">GPT</span>
                        </div>
                        <span className="text-xs text-gray-700 mt-1">ChatGPT</span>
                      </div>

                      {/* Claude */}
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-10 h-10 flex items-center justify-center shadow-sm border border-white/30 overflow-hidden"
                          style={{
                            background: 'white',
                            borderRadius: '50% 40% 50% 40%',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <img 
                            src="https://claude.ai/images/claude_app_icon.png" 
                            alt="Claude" 
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <span className="text-xs font-bold text-purple-600 hidden">C</span>
                        </div>
                        <span className="text-xs text-gray-700 mt-1">Claude</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Interface - Right Side */}
                <div className="flex-1">
                  {/* Notification Banner - Outside glassmorphism */}
                  <div className="w-full mb-4">
                    <NotificationBanner activeAgent={activeAgent} />
                  </div>
                  
                  {/* Two Section Layout - Fully Transparent Glassmorphism */}
                  <div 
                    className="rounded-lg shadow-2xl border border-white/40 backdrop-blur-xl overflow-hidden"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(25px)',
                  boxShadow: `
                    0 12px 40px rgba(0, 0, 0, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.6),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.3)
                  `,
                  minHeight: 'auto'
                }}
              >
                <div className="p-4">
                  {/* Full Width Section - Loading Page (100%) */}
                  <div className="w-full">
                    <LoadingPage
                      storeUrl={storeUrl}
                      setStoreUrl={setStoreUrl}
                      onStartScan={handleLoadingPageScanReady}
                    />
                  </div>
                </div>


              </div>
                </div>
              </div>
            </div>
                        )
                        )}

            {/* Plan Vacation Expandable Interface - Only when NOT in section */}
            {expandedCards.filter(cardId => cardId === 'plan-vacation' && !getProjectSection(cardId)).map(vacationId => (
              <div 
                key={vacationId}
                className={`transition-all duration-300 ${
                  sectionMode ? 'cursor-pointer' : ''
                } ${
                  selectedProjects.includes(vacationId) ? 'border-2 border-dashed border-gray-600' : ''
                }`}
                style={{ 
                  width: '1440px',
                  minWidth: '1440px',
                  flexShrink: 0,
                  marginBottom: '50px'
                }}
                onClick={() => handleProjectSelection(vacationId)}
              >
                {/* Main Heading */}
                <div className="text-left mb-6 relative" style={{ marginTop: '120px' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold mb-2 text-gray-900">
                        Plan My Vacation
                      </h1>
                      <p className="text-lg text-gray-600">
                        AI-powered vacation planning workspace
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interface with AI Card Layout */}
                <div className="flex gap-6">
                  {/* AI Conversation Card - Left Side */}
                  <div 
                    className="flex-shrink-0 space-y-4 transition-all duration-300"
                    style={{ 
                      width: isAskingVacationQuestions ? '600px' : (vacationData?.ready || showPaymentGateway ? '320px' : '600px')
                    }}
                  >
                    {/* AI Conversation Card */}
                    <div style={{ height: isAskingVacationQuestions ? '700px' : '500px' }}>
                      <AIConversationCard 
                        taskCards={taskCards}
                        expandedCards={[vacationId]}
                        scanProgress={scanProgress}
                        isScanning={false}
                        onAddNotification={addNotification}
                        onVacationDataUpdate={(data) => {
                          setVacationData({ ...data, ready: data.ready !== false })
                        }}
                        onQuestionStateChange={(isAsking) => setIsAskingVacationQuestions(isAsking)}
                        onPackageSelect={(packageData) => {
                          setSelectedPackage(packageData)
                          setShowAuthorizationModal(true)
                        }}
                        onSubtaskComplete={(subtaskId, details) => {
                          setVacationSubtasks(prev => prev.map(task => 
                            task.id === subtaskId 
                              ? { ...task, status: 'completed' as const, details }
                              : task
                          ))
                          // Show notification when flight is booked
                          if (subtaskId === '1') {
                            addNotification({
                              type: 'info',
                              title: 'Flight Booked! ✈️',
                              message: 'Your flight has been successfully booked. Click "View Details" to see your booking.',
                              actionRequired: false,
                              timestamp: Date.now(),
                              taskId: 'plan-vacation',
                              subtaskId: '1'
                            })
                          }
                          // Show notification when hotel is booked
                          if (subtaskId === '2') {
                            addNotification({
                              type: 'info',
                              title: 'Hotel Booked! 🏨',
                              message: 'Your hotel reservation has been confirmed. Click "View Details" to see your booking.',
                              actionRequired: false,
                              timestamp: Date.now(),
                              taskId: 'plan-vacation',
                              subtaskId: '2'
                            })
                          }
                        }}
                        onStartBooking={() => {
                          // This callback is set up in AIConversationCard
                        }}
                      />
                    </div>
                  </div>

                  {/* Vacation Planning Interface - Right Side */}
                  <div className={`transition-all duration-300 ${(vacationData?.ready && !isAskingVacationQuestions) || showPaymentGateway || showPackagePreview || selectedBookingDetails ? 'flex-1' : 'flex-none'}`} style={{ width: (vacationData?.ready && !isAskingVacationQuestions) || showPaymentGateway || showPackagePreview || selectedBookingDetails ? 'auto' : '0px', overflow: (vacationData?.ready && !isAskingVacationQuestions) || showPaymentGateway || showPackagePreview || selectedBookingDetails ? 'visible' : 'hidden' }}>
                    <div className="w-full mb-4">
                      <NotificationBanner activeAgent={activeAgent} />
                    </div>
                    
                    {/* Payment Gateway Inline View */}
                    {showPaymentGateway && selectedPackage && (
                      <div 
                        className="rounded-lg shadow-2xl border border-white/40 backdrop-blur-xl overflow-hidden mb-4"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(25px)',
                          boxShadow: `
                            0 12px 40px rgba(0, 0, 0, 0.15),
                            inset 0 1px 0 rgba(255, 255, 255, 0.6),
                            inset 0 -1px 0 rgba(255, 255, 255, 0.3)
                          `
                        }}
                      >
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RiLockLine size={18} className="text-green-600" />
                            <h3 className="text-sm font-semibold text-gray-900">Secure Payment Gateway</h3>
                          </div>
                          <button
                            onClick={() => setShowPaymentGateway(false)}
                            className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center"
                          >
                            <RiCloseLine size={16} className="text-gray-500" />
                          </button>
                        </div>
                        <div className="p-6">
                          {/* Stripe Checkout iframe placeholder - In production, this would be actual Stripe Checkout */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
                            <RiBankCardLine size={48} className="text-gray-400 mx-auto mb-4" />
                            <p className="text-sm font-medium text-gray-700 mb-2">Stripe Payment Gateway</p>
                            <p className="text-xs text-gray-500 mb-4">
                              Package: {selectedPackage.name} - {selectedPackage.price}
                            </p>
                            <p className="text-xs text-gray-400">
                              In production, this would embed Stripe Checkout iframe for secure payment processing.
                              <br />
                              Your card details are never shared with the AI.
                            </p>
                            <button
                              onClick={() => {
                                // Step 1: Hide payment gateway
                                setShowPaymentGateway(false)
                                
                                // Step 2: Get vacation data from AIConversationCard's questionAnswers
                                // We need to pass this data or get it from the component
                                // For now, use existing vacationData or create default
                                const destination = vacationData?.destination || ''
                                const duration = vacationData?.duration || ''
                                
                                // Step 3: Set vacation data to ready (this shows cards on right panel)
                                setVacationData({ 
                                  destination,
                                  duration,
                                  ready: true 
                                })
                                
                                // Step 4: Add notification
                                addNotification({
                                  type: 'info',
                                  title: 'Payment Authorized',
                                  message: `Payment authorized for ${selectedPackage.name}. Starting vacation planning...`,
                                  actionRequired: false,
                                  timestamp: Date.now(),
                                  taskId: 'plan-vacation'
                                })
                                
                                // Step 5: Trigger booking flow in chat
                                setTimeout(() => {
                                  if ((window as any).startVacationBooking) {
                                    (window as any).startVacationBooking()
                                  }
                                }, 500)
                                
                                // Step 6: Clear selected package
                                setTimeout(() => {
                                  setSelectedPackage(null)
                                }, 1000)
                              }}
                              className="mt-4 px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Complete Payment
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Package Preview Browser View */}
                    {showPackagePreview && selectedPackage && (
                      <div 
                        className="rounded-lg shadow-2xl border border-white/40 backdrop-blur-xl overflow-hidden mb-4"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(25px)',
                          boxShadow: `
                            0 12px 40px rgba(0, 0, 0, 0.15),
                            inset 0 1px 0 rgba(255, 255, 255, 0.6),
                            inset 0 -1px 0 rgba(255, 255, 255, 0.3)
                          `
                        }}
                      >
                        {/* Browser Chrome */}
                        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                          </div>
                          <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-600 mx-4">
                            https://vacation-packages.example.com/{selectedPackage.id}
                          </div>
                          <RiExternalLinkLine size={14} className="text-gray-400" />
                        </div>
                        {/* Package Details Page */}
                        <div className="p-8 bg-white">
                          <div className="max-w-3xl mx-auto">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedPackage.name}</h1>
                            <p className="text-4xl font-bold text-gray-900 mb-6">{selectedPackage.price}</p>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                              {selectedPackage.highlights.map((highlight, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <RiCheckLine size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                                  <p className="text-sm text-gray-700">{highlight}</p>
                                </div>
                              ))}
                            </div>
                            <div className="border-t border-gray-200 pt-6">
                              <p className="text-sm text-gray-600 mb-4">
                                This package includes everything you need for an unforgettable vacation experience.
                              </p>
                              <button className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition-colors">
                                Book Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Booking Details View or PlanVacationPage */}
                    {selectedBookingDetails ? (
                      <div 
                        className="rounded-lg shadow-2xl border border-white/40 backdrop-blur-xl overflow-hidden"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(25px)',
                          boxShadow: `
                            0 12px 40px rgba(0, 0, 0, 0.15),
                            inset 0 1px 0 rgba(255, 255, 255, 0.6),
                            inset 0 -1px 0 rgba(255, 255, 255, 0.3)
                          `,
                          minHeight: '600px'
                        }}
                      >
                        <BookingDetailsView 
                          subtask={selectedBookingDetails}
                          onClose={() => setSelectedBookingDetails(null)}
                        />
                      </div>
                    ) : (
                      <div 
                        className="rounded-lg shadow-2xl border border-white/40 backdrop-blur-xl overflow-hidden"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(25px)',
                          boxShadow: `
                            0 12px 40px rgba(0, 0, 0, 0.15),
                            inset 0 1px 0 rgba(255, 255, 255, 0.6),
                            inset 0 -1px 0 rgba(255, 255, 255, 0.3)
                          `,
                          minHeight: 'auto'
                        }}
                      >
                        <div className="p-6">
                          <PlanVacationPage 
                            destination={vacationData?.destination}
                            duration={vacationData?.duration}
                            isReady={vacationData?.ready || false}
                            subtasks={vacationSubtasks}
                            onSubtaskUpdate={(updatedSubtasks) => {
                              // Only update if there's an actual change to prevent loops
                              const hasChanged = updatedSubtasks.length !== vacationSubtasks.length ||
                                updatedSubtasks.some((task, idx) => {
                                  const current = vacationSubtasks[idx]
                                  return !current ||
                                    task.id !== current.id ||
                                    task.status !== current.status ||
                                    JSON.stringify(task.details) !== JSON.stringify(current.details)
                                })
                              
                              if (hasChanged) {
                                setVacationSubtasks(updatedSubtasks)
                              }
                            }}
                            onCardClick={(subtask) => {
                              setSelectedBookingDetails(subtask)
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Generic Task Expandable Interface - Only when NOT in section */}
            {taskCards.filter(task => 
              expandedCards.includes(task.id) && 
              task.id !== 'store-health' && 
              !task.id.startsWith('store-health-') &&
              task.id !== 'plan-vacation' &&
              task.id !== 'seo-optimizer' && 
              !task.id.includes('seo') &&
              !getProjectSection(task.id)
            ).map(task => {
              const iconMap: Record<string, React.ComponentType<{ size?: string | number }>> = {
                'store-health': RiPulseLine,
                'plan-vacation': RiPlaneLine
              }
              const TaskIcon = (task.icon || iconMap[task.id] || RiStarFill)
              return (
              <div 
                key={task.id}
                className={`transition-all duration-300 ${
                  sectionMode ? 'cursor-pointer' : ''
                } ${
                  selectedProjects.includes(task.id) ? 'border-2 border-dashed border-gray-600' : ''
                }`}
                style={{ 
                  width: '1440px',
                  minWidth: '1440px',
                  flexShrink: 0
                }}
                onClick={() => handleProjectSelection(task.id)}
              >
                {/* Main Heading */}
                <div className="text-left mb-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold mb-2 text-gray-900">
                        {task.title}
                      </h1>
                      <p className="text-lg text-gray-600">
                        {task.subtitle}
                      </p>
                    </div>

                  </div>
                </div>
                
                

                {/* Two Section Layout */}
                <div 
                  className="rounded-3xl shadow-2xl border border-white/40 backdrop-blur-xl overflow-hidden"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(25px)',
                    boxShadow: `
                      0 12px 40px rgba(0, 0, 0, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6),
                      inset 0 -1px 0 rgba(255, 255, 255, 0.3)
                    `
                  }}
                >
                  <div className="p-6">
                    {/* Full Width Section - Main Interface (100%) */}
                    <div 
                      className="w-full rounded-3xl p-8"
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        minHeight: 'auto'
                      }}
                    >
                      <div className="flex items-center gap-4 mb-8">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: task.iconBg }}
                        >
                          <TaskIcon size={24} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
                          <p className="text-gray-600">{task.subtitle}</p>
                        </div>
                      </div>

                      {/* Coming Soon Content for other tasks */}
                      <div className="text-center py-12">
                        <div 
                          className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"
                          style={{ color: task.iconBg }}
                        >
                          <TaskIcon size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {task.title} Interface Coming Soon
                        </h3>
                        <p className="text-gray-600 mb-6">
                          We're building an amazing AI-powered interface for {task.title.toLowerCase()}. 
                          Stay tuned for updates!
                        </p>
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg text-left">
                            <h4 className="font-medium text-gray-800 mb-2">Planned Features:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• AI-powered automation</li>
                              <li>• Real-time analytics</li>
                              <li>• Smart recommendations</li>
                              <li>• Custom workflows</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )
            })}

            {/* SEO Optimizer Expandable Interface - Only when NOT in section */}
            {expandedCards.includes('seo-optimizer') && !getProjectSection('seo-optimizer') && (
              <div 
                className={`transition-all duration-300 ${
                  sectionMode ? 'cursor-pointer' : ''
                } ${
                  selectedProjects.includes('seo-optimizer') ? 'border-2 border-dashed border-gray-600' : ''
                }`}
                style={{ 
                  width: '1440px',
                  minWidth: '1440px',
                  flexShrink: 0
                }}
                onClick={() => handleProjectSelection('seo-optimizer')}
              >
              {/* Main Heading */}
              <div className="text-left mb-6 relative">
                <div className="flex items-center">
                  <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">
                      SEO Optimizer
                    </h1>
                    <p className="text-lg text-gray-600">
                      AI-powered SEO analysis and optimization for better search rankings
                    </p>
                  </div>
                </div>
              </div>
              


              {/* Two Section Layout - Fully Transparent Glassmorphism */}
              <div 
                className="rounded-3xl shadow-2xl border border-white/40 backdrop-blur-xl overflow-hidden"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(25px)',
                  boxShadow: `
                    0 12px 40px rgba(0, 0, 0, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.6),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.3)
                  `
                }}
              >
                <div className="p-6">
                  {/* Full Width Section - SEO Analysis (100%) */}
                  <div 
                    className="w-full rounded-2xl p-8"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      minHeight: 'auto'
                    }}
                  >
                    {/* SEO Analysis Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: DARK_PALETTE.secondary }}
                      >
                        <RiSearchEyeLine size={24} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">SEO Analysis</h2>
                        <p className="text-gray-600">Comprehensive SEO audit and optimization recommendations</p>
                      </div>
                    </div>

                    {/* URL Input Section */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website URL
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="url"
                            value={storeUrl}
                            onChange={(e) => setStoreUrl(e.target.value)}
                            placeholder="https://your-website.com"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          />
                          <button
                            onClick={() => alert('SEO Analysis - Coming Soon!')}
                            className="px-6 py-3 text-white font-medium rounded-lg transition-all duration-300 hover:opacity-90"
                            style={{ backgroundColor: DARK_PALETTE.secondary }}
                          >
                            Analyze SEO
                          </button>
                        </div>
                      </div>

                      {/* SEO Metrics Preview */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">85</div>
                          <div className="text-sm text-gray-600">SEO Score</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">12</div>
                          <div className="text-sm text-gray-600">Keywords Ranking</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">3</div>
                          <div className="text-sm text-gray-600">Issues Found</div>
                        </div>
                      </div>

                      {/* SEO Recommendations */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">Top Recommendations</h3>
                        <div className="space-y-2">
                          {[
                            'Optimize meta descriptions for better CTR',
                            'Add alt text to 8 images',
                            'Improve page loading speed',
                            'Fix broken internal links'
                          ].map((recommendation, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                              </div>
                              <span className="text-sm text-gray-700">{recommendation}</span>
                              <button className="ml-auto text-xs text-blue-600 hover:text-blue-800">
                                Fix Now
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
                        )}
          </div>
        </div>
      </div>

      {/* Minimal User Profile & Controls */}
      <div className="fixed top-4 right-4 flex items-center gap-4">
        {/* User Profile Icons */}
        <div 
          className="flex items-center gap-1 p-1 rounded-3xl backdrop-blur-xl border border-white/40"
          style={{
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.5),
              inset 0 -1px 0 rgba(255, 255, 255, 0.2)
            `
          }}
        >
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors relative"
            onClick={() => setShowActionCenter(!showActionCenter)}
          >
            <RiNotification3Line size={18} style={{ color: DARK_PALETTE.tertiary }} />
            {notifications.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{notifications.length}</span>
              </div>
            )}
          </button>
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={() => alert('Settings - Coming Soon!')}
          >
            <RiSettings3Line size={18} style={{ color: DARK_PALETTE.tertiary }} />
          </button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
            <RiUser3Line size={18} style={{ color: '#6B7280' }} />
          </div>
        </div>

        {/* Canvas Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
          <button
            onClick={resetView}
            className="text-xs text-gray-700 hover:text-gray-900 transition-colors mr-2"
          >
            Reset
          </button>
          <span className="text-xs text-gray-600">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Navigation Toggle */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <div 
          className="rounded-full shadow-xl border border-white/40 p-2 flex items-center gap-2 backdrop-blur-xl"
          style={{ 
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.5),
              inset 0 -1px 0 rgba(255, 255, 255, 0.2)
            `
          }}
        >
          {!showAiSearch ? (
            <>
              {/* Section Button */}
              <button 
                className={`p-3 rounded-full transition-all duration-300 ${
                  sectionMode ? 'text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{ 
                  backgroundColor: sectionMode ? DARK_PALETTE.tertiary : 'transparent',
                  cursor: sectionMode ? 'pointer' : 'default'
                }}
                onClick={handleSectionClick}
                title={sectionMode && selectedProjects.length > 0 ? 'Create Section' : 'Section Mode'}
              >
                <SectionIcon size={20} />
              </button>
              
              {/* Home Button */}
              <button 
                className="p-3 rounded-full transition-all duration-300 text-white"
                style={{ backgroundColor: DARK_PALETTE.primary }}
                onClick={() => resetView()}
              >
                <RiHomeLine size={20} />
              </button>
              
              {/* Viewport Lock Button */}
              <button 
                className="p-3 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: isViewportLocked ? DARK_PALETTE.secondary : 'transparent',
                  color: isViewportLocked ? '#F9FAFB' : '#4B5563',
                  border: isViewportLocked ? 'none' : '1px solid rgba(156,163,175,0.4)'
                }}
                onClick={() => setIsViewportLocked((prev) => !prev)}
                title={isViewportLocked ? 'Viewport locked' : 'Lock viewport'}
              >
                <RiLockLine size={18} />
              </button>
              
              {/* AI Search Button */}
              <button 
                className="p-3 rounded-full transition-all duration-300 text-gray-600 hover:text-gray-800"
                style={{ backgroundColor: 'transparent' }}
                onClick={() => setShowAiSearch(true)}
              >
                <StarIcon size={20} />
              </button>
            </>
          ) : (
            /* Expanded AI Search Bar */
            <div className={`flex items-center gap-4 px-4 py-2 transition-all duration-300 ${
              aiSearchQuery.length > 20 ? 'min-w-[600px]' : aiSearchQuery.length > 0 ? 'min-w-[500px]' : 'min-w-96'
            }`}>
              <RiSearchLine size={20} style={{ color: DARK_PALETTE.tertiary }} />
              <input
                type="text"
                value={aiSearchQuery}
                onChange={(e) => setAiSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && aiSearchQuery.trim()) {
                    handleAiSearchSubmit()
                  }
                }}
                placeholder="Ask AI anything... (e.g., 'check store health on https://mystore.com')"
                className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <RiAttachmentLine size={18} className="text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <RiMicLine size={18} className="text-gray-400" />
                </button>
                <button 
                  onClick={() => {
                    if (aiSearchQuery.trim()) {
                      handleAiSearchSubmit()
                    }
                  }}
                  disabled={!aiSearchQuery.trim()}
                  className={`p-2 rounded-full text-white transition-colors hover:opacity-90 ${
                    !aiSearchQuery.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{ backgroundColor: DARK_PALETTE.primary }}
                >
                  <RiArrowUpSLine size={16} />
                </button>
                <button 
                  className="p-2 rounded-full text-gray-600 hover:text-gray-800 transition-colors"
                  onClick={() => {
                    setShowAiSearch(false)
                    setAiSearchQuery('')
                  }}
                >
                  <RiCloseLine size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Section Mode Indicator */}
      {sectionMode && (
        <div className="fixed top-4 left-4 bg-gray-800 text-white rounded-lg px-4 py-2 shadow-lg text-sm font-medium">
          <div className="flex items-center gap-2">
            <SectionIcon size={16} />
            <span>
              {selectedProjects.length === 0 
                ? 'Click projects to select them for sectioning'
                : `${selectedProjects.length} project${selectedProjects.length > 1 ? 's' : ''} selected`
              }
            </span>
          </div>
        </div>
      )}

      {/* Instructions */}
      {sectionMode && (
        <div className="fixed bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg text-sm text-gray-600 max-w-xs">
          <div className="text-gray-700 font-medium">
            • Click projects to group them
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={cancelCreateTask} />
          <div className="relative w-full max-w-xl mx-4 rounded-lg border border-white/40 backdrop-blur-2xl p-6 shadow-2xl" style={{ background: 'rgba(255,255,255,0.95)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create a New Task</h3>
              <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-500" onClick={cancelCreateTask}>
                <RiCloseLine size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task name</label>
                <input
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="e.g., Plan My Vacation"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTaskName.trim()) {
                      handleCreateTask()
                    }
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Describe what you want to accomplish..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={cancelCreateTask}
                  className="px-6 py-2.5 rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTaskName.trim()}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && taskToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={cancelDeleteTask} />
          <div className="relative w-full max-w-md mx-4 rounded-lg border border-white/40 backdrop-blur-2xl p-6 shadow-2xl" style={{ background: 'rgba(255,255,255,0.95)' }}>
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <RiDeleteBinLine size={32} className="text-red-500" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Task</h3>
              
              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                Are you sure you want to delete "{taskCards.find(t => t.id === taskToDelete)?.title}"? This action cannot be undone and will remove the task and any associated project interfaces.
              </p>
              
              {/* Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelDeleteTask}
                  className="px-6 py-2.5 rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTask}
                  className="px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors font-medium shadow-lg hover:shadow-xl"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTask && taskToEdit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={cancelEditTask} />
          <div className="relative w-full max-w-xl mx-4 rounded-lg border border-white/40 backdrop-blur-2xl p-6 shadow-2xl" style={{ background: 'rgba(255,255,255,0.95)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
              <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-500" onClick={cancelEditTask}>
                <RiCloseLine size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Task name</label>
                <input
                  value={editTaskName}
                  onChange={(e) => setEditTaskName(e.target.value)}
                  placeholder="e.g., Conversion Uplift Assistant"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#A5D6A7' } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Description</label>
                <textarea
                  value={editTaskDesc}
                  onChange={(e) => setEditTaskDesc(e.target.value)}
                  rows={3}
                  placeholder="What should this agent do?"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#A5D6A7' } as React.CSSProperties}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: DARK_PALETTE.primary }}
                  onClick={confirmEditTask}
                  disabled={!editTaskName.trim()}
                >
                  Save Changes
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-gray-700 border"
                  style={{ borderColor: '#E5E7EB', background: '#FFFFFF' }}
                  onClick={cancelEditTask}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right-Side Action Center */}
      {showActionCenter && (
        <div className="fixed top-0 right-0 h-full w-96 z-[9998] flex">
          {/* Overlay */}
          <div 
            className="flex-1 bg-black/20 backdrop-blur-sm" 
            onClick={() => setShowActionCenter(false)}
          />
          
          {/* Action Center Panel */}
          <div 
            className="w-96 shadow-2xl border-l border-white/40 flex flex-col backdrop-blur-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.5),
                inset 0 -1px 0 rgba(255, 255, 255, 0.2)
              `
            }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Action Center</h2>
                  <p className="text-sm text-gray-600">Tasks and notifications</p>
                </div>
                <button
                  onClick={() => setShowActionCenter(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                >
                  <RiCloseLine size={20} />
                </button>
              </div>
              {notifications.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{notifications.length} notification{notifications.length > 1 ? 's' : ''}</span>
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <RiNotification3Line size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-600">No notifications or actions required at the moment.</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Section A: Action Required */}
                  {notifications.filter(n => n.actionRequired).length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        Action Required
                      </h3>
                      <div className="space-y-2">
                        {notifications.filter(n => n.actionRequired).map((notification) => (
                          <div
                            key={notification.id}
                              className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                  <RiAlertLine size={12} className="text-red-600" />
                              </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-2 mb-1">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0 mt-1.5"></div>
                                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{notification.title}</h4>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                                    {notification.message.replace(/(\b(?:failed|error|critical|urgent)\b)/gi, '<span class="font-bold text-red-600">$1</span>')
                                      .split(/<span class="font-bold text-red-600">([^<]*)<\/span>/)
                                      .map((part, index) => 
                                        index % 2 === 1 ? (
                                          <span key={index} className="font-bold text-red-600">{part}</span>
                                        ) : part
                                      )}
                                  </p>
                                  <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-md transition-colors">
                                  Review & Approve
                                </button>
                              </div>
                              <button
                                onClick={() => notification.id && removeNotification(notification.id)}
                                  className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 flex-shrink-0"
                              >
                                  <RiCloseLine size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section B: For Your Information */}
                  {notifications.filter(n => !n.actionRequired).length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Recent Activity
                      </h3>
                      <div className="space-y-2">
                        {notifications.filter(n => !n.actionRequired).map((notification) => {
                          const isSuccess = notification.type === 'deployment_complete'
                          const iconBg = isSuccess ? 'bg-green-100' : 'bg-blue-100'
                          const iconColor = isSuccess ? 'text-green-600' : 'text-blue-600'
                          const dotColor = isSuccess ? 'bg-green-500' : 'bg-blue-500'
                          
                          // Choose appropriate icon based on notification type/title
                          let IconComponent = RiCheckLine
                          if (notification.title.toLowerCase().includes('image')) {
                            IconComponent = RiImageLine
                          } else if (notification.title.toLowerCase().includes('performance') || notification.title.toLowerCase().includes('scan')) {
                            IconComponent = RiBarChartLine
                          } else if (notification.title.toLowerCase().includes('optimization')) {
                            IconComponent = RiToolsLine
                          }
                          
                          return (
                            <div
                            key={notification.id}
                              className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
                                  <IconComponent size={12} className={iconColor} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-2 mb-1">
                                    <div className={`w-1.5 h-1.5 ${dotColor} rounded-full flex-shrink-0 mt-1.5`}></div>
                                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{notification.title}</h4>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                                    {notification.message.replace(/(\b(?:completed|success|deployed|optimized|finished|ready)\b)/gi, (match) => 
                                      `<span class="font-bold text-green-600">${match}</span>`
                                    ).replace(/(\b(?:failed|error|warning|issue)\b)/gi, (match) => 
                                      `<span class="font-bold text-red-600">${match}</span>`
                                    ).split(/(<span class="font-bold text-(?:green|red)-600">[^<]*<\/span>)/)
                                      .map((part, index) => {
                                        if (part.includes('font-bold text-green-600')) {
                                          const text = part.replace(/<[^>]*>/g, '')
                                          return <span key={index} className="font-bold text-green-600">{text}</span>
                                        } else if (part.includes('font-bold text-red-600')) {
                                          const text = part.replace(/<[^>]*>/g, '')
                                          return <span key={index} className="font-bold text-red-600">{text}</span>
                                        }
                                        return part
                                      })}
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">
                                      {new Date(notification.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                                    </span>
                                    {notification.taskId && (
                                      <div className="flex gap-2">
                                        {notification.subtaskId ? (
                                          <button
                                            onClick={() => {
                                              zoomToTask(notification.taskId!)
                                              setShowActionCenter(false)
                                              // Ensure right panel is visible
                                              if (!vacationData?.ready) {
                                                setVacationData({ ...vacationData || { destination: '', duration: '' }, ready: true })
                                              }
                                              // Show right panel with cards and select the specific subtask
                                              if (notification.subtaskId) {
                                                const subtask = vacationSubtasks.find(t => t.id === notification.subtaskId)
                                                if (subtask && subtask.status === 'completed') {
                                                  setSelectedBookingDetails(subtask)
                                                }
                                              }
                                              removeNotification(notification.id!)
                                            }}
                                            className="px-2 py-1 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded transition-colors"
                                          >
                                            View Details
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              zoomToTask(notification.taskId!)
                                              setShowActionCenter(false)
                                              removeNotification(notification.id!)
                                            }}
                                            className="px-2 py-1 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded transition-colors"
                                          >
                                            Open Task
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => notification.id && removeNotification(notification.id)}
                                  className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 flex-shrink-0"
                                >
                                  <RiCloseLine size={12} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Secure Authorization Modal */}
      <SecureAuthorizationModal
        isOpen={showAuthorizationModal}
        packageData={selectedPackage}
        onAuthorize={() => {
          // Handle authorization - proceed with vacation planning
          setShowAuthorizationModal(false)
          setShowPaymentGateway(false) // Hide payment gateway
          
          // Find the vacation task card to update its data
          const vacationCard = taskCards.find(card => card.id === 'plan-vacation')
          if (vacationCard && vacationData) {
            // Update vacation data to trigger agent actions
            setVacationData({ ...vacationData, ready: true })
          }
          
          // Add notification about authorization
          addNotification({
            type: 'info',
            title: 'Authorization Complete',
            message: `Payment authorized for ${selectedPackage?.name}. Starting vacation planning...`,
            actionRequired: false,
            timestamp: Date.now(),
            taskId: 'plan-vacation'
          })
          
          // Trigger booking flow in chat
          setTimeout(() => {
            if ((window as any).startVacationBooking) {
              (window as any).startVacationBooking()
            }
          }, 500)
          
          // Clear selected package after authorization
          setTimeout(() => {
            setSelectedPackage(null)
          }, 1000)
        }}
        onSecureHandoffInline={() => {
          // Show payment gateway inline on the right side
          setShowPaymentGateway(true)
          setShowAuthorizationModal(false)
        }}
        onOpenInNewTab={() => {
          // Open payment page in new browser tab
          if (selectedPackage) {
            const paymentUrl = `/payment?package=${encodeURIComponent(JSON.stringify(selectedPackage))}`
            window.open(paymentUrl, '_blank')
          }
        }}
        onShowPackagePreview={() => {
          // Show package details in browser preview on right side
          setShowPackagePreview(true)
        }}
        onCancel={() => {
          setShowAuthorizationModal(false)
          setSelectedPackage(null)
          setShowPaymentGateway(false)
          setShowPackagePreview(false)
        }}
      />
    </div>
  )
}

