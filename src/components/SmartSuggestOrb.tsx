import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiSparklingFill, RiCloseLine, RiSearchLine, RiMicLine, RiSendPlaneLine, RiEyeLine, RiHeartLine, RiStarLine, RiBrainLine, RiLoader4Fill, RiCheckLine, RiUser3Line, RiLoader2Line } from '@remixicon/react'

// Custom bouncing keyframes for smooth animation
const bounceInAnimation = `
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  
  20% {
    transform: scale3d(1.1, 1.1, 1.1);
  }
  
  40% {
    transform: scale3d(0.9, 0.9, 0.9);
  }
  
  60% {
    opacity: 1;
    transform: scale3d(1.03, 1.03, 1.03);
  }
  
  80% {
    transform: scale3d(0.97, 0.97, 0.97);
  }
  
  100% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}

@keyframes bounceOut {
  0% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
  
  20% {
    transform: scale3d(0.97, 0.97, 0.97);
  }
  
  40% {
    opacity: 1;
    transform: scale3d(1.03, 1.03, 1.03);
  }
  
  60% {
    transform: scale3d(0.9, 0.9, 0.9);
  }
  
  80% {
    transform: scale3d(1.1, 1.1, 1.1);
  }
  
  100% {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
}

.bounce-in {
  animation: bounceIn 0.75s;
}

.bounce-in-reverse {
  animation: bounceOut 0.75s;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateX(10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

@keyframes pulse-orb {
  0% {
    transform: translate(-50%, -50%) scale(0.95);
    opacity: 0.5;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.95);
    opacity: 0.5;
  }
}

.glass-orb-container {
  position: relative;
  width: 40px;
  height: 40px;
  filter: drop-shadow(0 2px 4px rgba(16,24,32,0.08));
}

.glass-orb-container::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(144,238,144,0.5);
  animation: pulse-orb 2.5s infinite;
  z-index: 0;
}

.glass-orb-svg {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}
`

// Add the styles to the document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.type = 'text/css'
  styleSheet.innerText = bounceInAnimation
  document.head.appendChild(styleSheet)
}

interface SmartSuggestOrbProps {
  isVisible: boolean
  onClose: () => void
  productCategory?: string
  isOnProduct?: boolean
  onExpanded?: (expanded: boolean) => void
  mode?: 'discovery' | 'help' | 'agent'
  showTooltipImmediately?: boolean
  customMessage?: string
}

interface SuggestionProduct {
  id: string
  name: string
  image: string
  price: string
  description: string
}

interface ConversationMessage {
  id: string
  type: 'thinking' | 'analyzing' | 'result'
  content: string
  timestamp: number
  isTyping: boolean
  icon?: React.ComponentType<{ size?: string | number }>
  statusIndicator?: string
}

const KERALA_TEA_SUGGESTIONS: SuggestionProduct[] = [
  {
    id: 'kerala-mural-tea-set',
    name: 'Kerala Mural Art Tea Set',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop&crop=center',
    price: '$19.99',
    description: 'Traditional Kerala mural designs'
  },
  {
    id: 'theyyam-inspired-mug',
    name: 'Theyyam Inspired Tea Mug',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop&crop=center',
    price: '$16.99',
    description: 'Hand-painted Theyyam art'
  },
  {
    id: 'backwater-serenity-set',
    name: 'Backwater Serenity Tea Collection',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop&crop=center',
    price: '$22.99',
    description: 'Kerala backwater landscapes'
  }
]

// Voice responses for discovery mode (regional designs)
const DISCOVERY_VOICE_RESPONSES = [
  "Show me the cheapest regional tea designs you found.",
  "Which Kerala-style tea set has the best traditional patterns?",
  "Can you find some regional mugs under $20?",
  "What's the most authentic Kerala design you discovered?",
  "Show me those Theyyam-inspired tea designs you mentioned.",
  "Are there any regional tea sets with modern twists on traditional patterns?",
  "Which regional design would make the best gift?",
  "Can you find any limited edition Kerala tea collections?",
  "Show me the most colorful regional tea designs available.",
  "What's the difference between these Kerala designs and regular tea sets?"
]

// Voice responses for help mode (tea ingredients and brewing) - matched pairs with more variety
const HELP_VOICE_QUESTIONS = [
  "What are the main ingredients in this Earl Grey tea?",
  "How should I brew this tea for the best flavor?", 
  "Can I add milk and sugar to this Earl Grey?",
  "What's the caffeine content in this tea?",
  "What are those blue petals I see in the tea blend?",
  "Is this tea good for people with diabetes?",
  "Are there any health benefits to drinking Earl Grey?",
  "How many cups of this tea can I drink per day?",
  "What makes the bergamot flavor so special in this tea?",
  "Will this tea help me sleep or keep me awake?",
  "Does this tea expire? How long does it stay fresh?",
  "Can I drink this tea on an empty stomach?",
  "What's the difference between this and regular black tea?",
  "Should I remove the tea bag or let it steep longer?",
  "Can pregnant women drink this Earl Grey tea?"
]

const HELP_AI_ANSWERS = [
  "This Earl Grey contains Ceylon black tea, natural bergamot oil from Italy, and cornflower petals. The bergamot gives it that distinctive citrus aroma and flavor.",
  "For best results, use water heated to 95°C (just below boiling). Steep for 3-5 minutes depending on your taste preference. Longer steeping can make it bitter.",
  "Absolutely! Adding milk creates a smoother, creamier taste. The bergamot pairs well with milk, and a touch of sugar or honey complements the citrus notes beautifully.",
  "Earl Grey contains 40-70mg of caffeine per cup, which is about half the amount in coffee. Perfect for those who want energy without the coffee jitters.",
  "Those are cornflower petals! They're added for visual appeal and give a subtle floral note that complements the bergamot. They're completely safe and edible.",
  "Earl Grey can be enjoyed by diabetics since it's naturally sugar-free. The black tea may even help with blood sugar regulation, but always consult your doctor about dietary changes.",
  "Earl Grey is rich in antioxidants from the black tea, and bergamot oil may help with digestion and stress relief. It's also lower in caffeine than coffee.",
  "You can safely enjoy 3-4 cups per day. With 40-70mg caffeine per cup, that's well within healthy limits and provides steady energy throughout the day.",
  "Bergamot oil comes from the rind of bergamot oranges grown in Calabria, Italy. It gives Earl Grey that distinctive floral-citrus aroma that sets it apart from other teas.",
  "Earl Grey contains moderate caffeine (40-70mg), so it will provide gentle energy rather than make you sleepy. Avoid drinking it 4-6 hours before bedtime.",
  "Properly stored Earl Grey stays fresh for 2-3 years. Keep it in an airtight container away from light and moisture. The bergamot oil may fade over time but it's still safe to drink.",
  "Earl Grey is generally gentle enough for an empty stomach. The bergamot may actually help with digestion, though some people prefer having a light snack first.",
  "Earl Grey is regular black tea enhanced with bergamot oil. This citrus addition gives it a distinctive floral aroma and slightly sweet flavor that regular black tea lacks.",
  "Remove the tea bag after 3-5 minutes. Leaving it longer will make the tea bitter as it extracts more tannins. For loose leaf tea, strain after the same time.",
  "Pregnant women should limit Earl Grey to 1-2 cups daily due to caffeine content. The bergamot is safe, but always consult your doctor about caffeine intake during pregnancy."
]

// Voice responses for agent mode (purchase assistance)
const AGENT_VOICE_QUESTIONS = [
  "I'm ready to purchase this deployment package, what's the next step?",
  "Can you help me complete this purchase quickly?",
  "What pricing options do you have for deployment services?",
  "I want to buy this now, how much will it cost?",
  "Can I schedule a consultation call to discuss my needs?",
  "What packages do you offer for deployment services?",
  "I need help choosing the right deployment plan for my store",
  "Can you process my order for the deployment service?",
  "What's included in your premium deployment package?",
  "I want to upgrade my store, what are my options?"
]

const AGENT_AI_ANSWERS = [
  "Perfect! I can help you get started right away. Our deployment package is $24.99 and includes AI optimization, backup, and monitoring. Would you like me to add it to your cart?",
  "Absolutely! I can fast-track your purchase. The $24.99 deployment package includes everything you saw in the demo. I can add it to cart right now if you're ready.",
  "We have 3 deployment packages: Starter ($24.99), Pro ($49.99), and Enterprise ($99.99). Each includes different levels of optimization and support. Which features are most important to you?",
  "Great choice! The deployment package is $24.99 and includes everything you saw in the demo. I can add it to your cart right now if you're ready.",
  "I'd love to schedule that! Our deployment experts can discuss advanced optimization strategies. What time zone are you in and when works best for you?",
  "We offer Basic (AI optimization), Pro (+ performance monitoring), and Enterprise (+ custom integrations). All include full backup and deployment. Which sounds right for your needs?",
  "I can definitely help! Tell me about your store size and main goals, and I'll recommend the perfect deployment plan with pricing options.",
  "Excellent! I can start processing your deployment order immediately. Do you want to proceed with the package you saw, or would you like to customize any features?",
  "Our premium package includes AI optimization, real-time monitoring, custom integrations, priority support, and monthly performance reports. It's perfect for growing businesses.",
  "Fantastic! We have upgrade paths from basic optimization to full-scale performance enhancement. What's your biggest concern with your current store performance?"
]

export default function SmartSuggestOrb({ 
  isVisible, 
  onClose, 
  productCategory = 'tea',
  isOnProduct = false,
  onExpanded,
  mode = 'discovery',
  showTooltipImmediately = false,
  customMessage
}: SmartSuggestOrbProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSeeMore, setShowSeeMore] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputText, setInputText] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)
  const [isInConversation, setIsInConversation] = useState(false)
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([])
  const [showConversationSkeleton, setShowConversationSkeleton] = useState(false)
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const [showVoiceAnimation, setShowVoiceAnimation] = useState(false)
  const [isAiResponding, setIsAiResponding] = useState(false)
  const [selectedHelpIndex, setSelectedHelpIndex] = useState<number | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const orbRef = useRef<HTMLDivElement>(null)
  const voiceTimeoutRef = useRef<number | null>(null)
  const chatContentRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight
    }
  }

  // Voice input handlers
  const handleVoiceClick = () => {
    setIsVoiceRecording(true)
    setShowVoiceAnimation(true)
    
    voiceTimeoutRef.current = setTimeout(() => {
      stopRegularVoiceRecording()
    }, 2000) // 2 seconds of recording
  }

  const stopRegularVoiceRecording = () => {
    setIsVoiceRecording(false)
    setShowVoiceAnimation(false)
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current)
      voiceTimeoutRef.current = null
    }

    // Simulate voice transcription - select random response based on mode
    const voiceResponses = mode === 'discovery' ? DISCOVERY_VOICE_RESPONSES 
                          : mode === 'agent' ? AGENT_VOICE_QUESTIONS 
                          : HELP_VOICE_QUESTIONS
    const randomIndex = Math.floor(Math.random() * voiceResponses.length)
    const randomResponse = voiceResponses[randomIndex]
    
    // Determine AI response IMMEDIATELY using the randomIndex before any state changes
    let aiResponse: string
    if (mode === 'discovery') {
      const discoveryResponses = [
        "Here are the most affordable regional designs I found! The Theyyam Inspired Tea Mug at $16.99 offers authentic Kerala art at the best price point.",
        "The Kerala Mural Art Tea Set has the most traditional patterns - featuring authentic temple mural designs passed down through generations. The intricate details are stunning!",
        "Perfect! I found several beautiful options under $20, including the Theyyam Inspired Mug ($16.99) with hand-painted traditional dance motifs.",
        "The most authentic design is definitely the Kerala Mural Art Set - it features genuine temple art patterns and uses traditional color palettes from ancient Kerala murals.",
        "The Theyyam-inspired collection is incredible! These pieces capture the vibrant colors and spiritual energy of Kerala's traditional Theyyam performances.",
        "Yes! The Backwater Serenity Collection blends traditional Kerala landscapes with contemporary minimalist design - perfect for modern homes with cultural appreciation.",
        "For gifting, I'd recommend the Kerala Mural Art Tea Set - it's culturally significant, beautifully crafted, and comes with a story about Kerala's artistic heritage.",
        "I found some exclusive pieces! The Backwater Serenity Collection includes limited edition designs inspired by Kerala's famous backwater scenes.",
        "The most vibrant designs are in the Theyyam collection - featuring bold reds, deep blues, and golden accents that represent the energy of Kerala's traditional performances.",
        "Kerala designs are unique because they tell stories - each pattern represents local culture, from temple art to backwater scenes, unlike generic tea sets."
      ]
      aiResponse = discoveryResponses[Math.floor(Math.random() * discoveryResponses.length)]
    } else if (mode === 'agent') {
      // Use exact matching response for agent mode
      aiResponse = AGENT_AI_ANSWERS[randomIndex] || AGENT_AI_ANSWERS[0]
    } else {
      // Use exact matching response for help mode
      aiResponse = HELP_AI_ANSWERS[randomIndex] || HELP_AI_ANSWERS[0]
    }
    
    // Create user message immediately
    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      type: 'result',
      content: randomResponse.trim(),
      timestamp: Date.now(),
      isTyping: false,
      icon: RiUser3Line
    }
    
    // Add to conversation immediately
    setIsInConversation(true)
    setShowSuggestions(false)
    setConversationMessages(prev => [...prev, userMessage])
    setInputText('') // Clear input
    
    // Auto-scroll after adding user message
    setTimeout(() => scrollToBottom(), 100)
    
    // Start AI response immediately
    setTimeout(() => {
      setIsAiResponding(true)
      
      addTypingMessage({
        type: 'result',
        content: aiResponse,
        icon: RiBrainLine
      })
      
      // Clear AI responding state after typing finishes
      setTimeout(() => {
        setIsAiResponding(false)
        if (mode === 'discovery') {
          setTimeout(() => {
            setShowSuggestions(true)
          }, 500)
        }
      }, 2000)
    }, 800) // Shorter delay for immediate feel
  }


  // Summarization sequence function
  const startSummarizationSequence = () => {
    setIsInConversation(true)
    setShowConversationSkeleton(true)
    
    // Hide skeleton after short delay
    setTimeout(() => {
      setShowConversationSkeleton(false)
    }, 800)

    let messageDelay = 0

    // Message 1: Thinking Phase
    setTimeout(() => {
      addTypingMessage({
        type: 'thinking',
        content: "Analyzing product details and formulating comprehensive summary...",
        icon: RiBrainLine,
        statusIndicator: 'ORBIN_THINKING'
      })
    }, messageDelay)
    messageDelay += 3000

    // Message 2: Processing Phase
    setTimeout(() => {
      addTypingMessage({
        type: 'analyzing',
        content: "Fine-tuning product highlights and pricing analysis...",
        icon: RiLoader4Fill,
        statusIndicator: 'ORBIN_PROCESSING'
      })
    }, messageDelay)
    messageDelay += 2500

    // Message 3: Final Summary
    setTimeout(() => {
      addTypingMessage({
        type: 'result',
        content: "**Premium Earl Grey Tea - Complete Summary**\n\n**Product Overview:**\n• Organic Ceylon black tea with natural bergamot oil\n• Hand-picked from high altitude gardens\n• Available in loose leaf & tea bags\n\n**Pricing & Value:**\n• Current Price: $24.99 (25% OFF)\n• Original Price: $32.99\n• Savings: $8.00\n\n**Key Features:**\n• Premium Ceylon black tea leaves\n• Natural bergamot oil from Italy\n• Cornflower petals for visual appeal\n• Organic certified & ethically sourced\n\n**Trust & Policies:**\n• Free shipping on orders over $50\n• 30-day return policy\n• Hand-picked quality assurance",
        icon: RiCheckLine,
        statusIndicator: 'ORBIN_COMPLETE'
      })
      
      // Show summary after typing completes
      setTimeout(() => {
        setShowSummary(true)
      }, 4000)
    }, messageDelay)
  }

  // Add typing message function
  const addTypingMessage = ({ type, content, icon, statusIndicator }: {
    type: 'thinking' | 'analyzing' | 'result'
    content: string
    icon?: React.ComponentType<{ size?: string | number }>
    statusIndicator?: string
  }) => {
    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      type,
      content: '',
      timestamp: Date.now(),
      isTyping: true,
      icon,
      statusIndicator
    }

    setConversationMessages(prev => [...prev, newMessage])
    
    // Auto-scroll when AI message starts
    setTimeout(() => scrollToBottom(), 100)

    // Update status indicator first if provided
    if (statusIndicator) {
      setConversationMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, content: statusIndicator, icon: RiLoader4Fill }
          : msg
      ))
      
      // Wait before starting typing animation
      setTimeout(() => {
        let currentIndex = 0
        const fullContent = content
        
        const typeChar = () => {
          if (currentIndex < fullContent.length) {
            setConversationMessages(prev => prev.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, content: fullContent.substring(0, currentIndex + 1), icon: icon || RiBrainLine }
                : msg
            ))
            currentIndex++
            setTimeout(typeChar, 7) // 7ms per character for 4x faster typing
          } else {
            // Finished typing
            setConversationMessages(prev => prev.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, isTyping: false }
                : msg
            ))
          }
        }
        typeChar()
      }, 1000)
    } else {
      // Direct typing without status indicator
      let currentIndex = 0
      const fullContent = content
      
      const typeChar = () => {
        if (currentIndex < fullContent.length) {
          setConversationMessages(prev => prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, content: fullContent.substring(0, currentIndex + 1) }
              : msg
          ))
          currentIndex++
          setTimeout(typeChar, 7) // 4x faster typing
        } else {
          setConversationMessages(prev => prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, isTyping: false }
              : msg
          ))
        }
      }
      setTimeout(typeChar, 300)
    }
  }

  // Ingredients analysis sequence
  const startIngredientsAnalysis = () => {
    setIsInConversation(true)
    setShowSuggestions(false)
    setShowConversationSkeleton(true)
    // Don't clear existing messages, append to conversation

    // Hide skeleton after short delay
    setTimeout(() => {
      setShowConversationSkeleton(false)
    }, 800)

    // Analysis sequence with progressive messages
    setTimeout(() => {
      addTypingMessage({
        type: 'thinking',
        content: "Analyzing Earl Grey tea composition and identifying key botanical ingredients...",
        icon: RiBrainLine,
        statusIndicator: 'ORBIN_ANALYZING'
      })
    }, 1200)

    setTimeout(() => {
      addTypingMessage({
        type: 'analyzing',
        content: "Scanning flavor profiles, bergamot oil concentrations, and brewing parameters...",
        icon: RiSearchLine,
        statusIndicator: 'ORBIN_PROCESSING'
      })
    }, 2000)

      setTimeout(() => {
        addTypingMessage({
          type: 'result',
          content: `**Earl Grey Premium Tea Analysis Complete**

**Primary Ingredients:**
• **Black Tea Base**: Ceylon & Indian Assam blend (85%)
• **Bergamot Oil**: Natural bergamot extract from Calabria (12%)
• **Cornflower Petals**: Dried blue cornflowers for visual appeal (3%)

**Brewing Specifications:**
• **Water Temperature**: 95°C (203°F)
• **Steeping Time**: 3-5 minutes
• **Tea-to-Water Ratio**: 1 tsp per 200ml

**Nutritional Profile:**
• **Caffeine Content**: 40-70mg per cup
• **Antioxidants**: Rich in theaflavins and catechins
• **Calories**: 2-4 per cup (without additives)

**Flavor Notes**: Citrusy bergamot aroma with robust black tea base, floral finish from cornflower petals.

**Best Served**: With honey or lemon, avoid milk to preserve bergamot essence.`,
          icon: RiCheckLine,
          statusIndicator: 'ORBIN_COMPLETE'
        })
        
        // Don't show regional designs after ingredient analysis - help mode should stay focused on tea info
      }, 6500)
  }

  const handleOrbClick = () => {
    if ((mode === 'help' || isOnProduct) && showTooltip) {
      // Help mode OR inline orbs: clicking orb/tooltip expands directly to chat
      setShowTooltip(false)
      setIsExpanded(true)
      onExpanded?.(true)
      setTimeout(() => {
        setShowSuggestions(true)
      }, 300)
    } else {
      // Product image mode: show card first
      setShowSeeMore(true)
    }
  }

  // Auto-expand and tooltip logic
  useEffect(() => {
    if (isVisible && !showSeeMore && !isExpanded) {
      if (mode === 'help' || isOnProduct) {
        // Help mode OR inline orbs: show tooltip immediately, but don't auto-expand
        if (showTooltipImmediately) {
          setShowTooltip(true)
          // Just show tooltip, wait for user click to expand
        }
        // Don't auto-expand - wait for user interaction (tooltip-only mode)
      } else {
        // Discovery mode on product images: show prompt first
        const autoExpandTimeout = setTimeout(() => {
          setShowSeeMore(true)
        }, 1000) // Auto-expand after 1 second
        
        return () => clearTimeout(autoExpandTimeout)
      }
    }
  }, [isVisible, showSeeMore, isExpanded, mode, onExpanded, showTooltipImmediately, isOnProduct])

  const handleSeeMoreClick = () => {
    setIsExpanded(true)
    onExpanded?.(true) // Notify parent that orb is now expanded
    // Delay showing suggestions to allow morphing animation to complete
    // Only show suggestions if not in conversation, otherwise keep conversation visible
    if (!isInConversation) {
    setTimeout(() => {
      setShowSuggestions(true)
    }, 300)
    }
  }

  const handleClose = () => {
    setShowSuggestions(false)
    setIsExpanded(false)
    setShowSeeMore(false)
    setInputText('')
    setIsInConversation(false)
    setConversationMessages([]) // Only clear when user explicitly closes orb
    setShowConversationSkeleton(false)
    setIsVoiceRecording(false)
    setShowVoiceAnimation(false)
    setIsAiResponding(false)
    setSelectedHelpIndex(null)
    setShowSummary(false)
    
    // Clear voice timeout
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current)
      voiceTimeoutRef.current = null
    }
    
    onExpanded?.(false) // Notify parent that orb is no longer expanded
    setTimeout(() => {
      onClose()
    }, 300)
  }




  const handleSendInput = () => {
    if (inputText.trim()) {
      // Create user message
      const userMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        type: 'result',
        content: inputText.trim(),
        timestamp: Date.now(),
        isTyping: false,
        icon: RiUser3Line
      }
      
      // Add user message to conversation
      setIsInConversation(true)
      setShowSuggestions(false)  // Temporarily hide suggestions while AI responds
      setConversationMessages(prev => [...prev, userMessage])
      
      // Clear input
      setInputText('')
      
      // Generate AI response after delay
      setTimeout(() => {
        setIsAiResponding(true)
        
        // Different responses based on mode
        const discoveryResponses = [
          "Here are the most affordable regional designs I found! The Theyyam Inspired Tea Mug at $16.99 offers authentic Kerala art at the best price point.",
          "The Kerala Mural Art Tea Set has the most traditional patterns - featuring authentic temple mural designs passed down through generations. The intricate details are stunning!",
          "Perfect! I found several beautiful options under $20, including the Theyyam Inspired Mug ($16.99) with hand-painted traditional dance motifs.",
          "The most authentic design is definitely the Kerala Mural Art Set - it features genuine temple art patterns and uses traditional color palettes from ancient Kerala murals.",
          "The Theyyam-inspired collection is incredible! These pieces capture the vibrant colors and spiritual energy of Kerala's traditional Theyyam performances.",
          "Yes! The Backwater Serenity Collection blends traditional Kerala landscapes with contemporary minimalist design - perfect for modern homes with cultural appreciation.",
          "For gifting, I'd recommend the Kerala Mural Art Tea Set - it's culturally significant, beautifully crafted, and comes with a story about Kerala's artistic heritage.",
          "I found some exclusive pieces! The Backwater Serenity Collection includes limited edition designs inspired by Kerala's famous backwater scenes.",
          "The most vibrant designs are in the Theyyam collection - featuring bold reds, deep blues, and golden accents that represent the energy of Kerala's traditional performances.",
          "Kerala designs are unique because they tell stories - each pattern represents local culture, from temple art to backwater scenes, unlike generic tea sets."
        ]

        let teaResponse: string
        
        if (mode === 'discovery') {
          teaResponse = discoveryResponses[Math.floor(Math.random() * discoveryResponses.length)]
        } else {
          // For help mode, use the matching answer if available (from voice input)
          if (selectedHelpIndex !== null) {
            teaResponse = HELP_AI_ANSWERS[selectedHelpIndex]
            setSelectedHelpIndex(null) // Reset after use
          } else {
            // For manual typing, use random response
            teaResponse = HELP_AI_ANSWERS[Math.floor(Math.random() * HELP_AI_ANSWERS.length)]
          }
        }
        
        addTypingMessage({
          type: 'result',
          content: teaResponse,
          icon: RiBrainLine
        })
        
        // Clear AI responding state after typing finishes and show images ONLY in discovery mode
        setTimeout(() => {
          setIsAiResponding(false)
          // Show Kerala tea images after AI response - ONLY for discovery mode
          if (mode === 'discovery') {
            setTimeout(() => {
      setShowSuggestions(true)
            }, 500)
          }
        }, 2000 + teaResponse.length * 30) // Account for typing animation duration
      }, 1500)
    }
  }

  // Reset states when visibility changes
  useEffect(() => {
    if (!isVisible) {
      setIsExpanded(false)
      setShowSuggestions(false)
      setShowSeeMore(false)
      setInputText('')
      setIsInConversation(false)
      setConversationMessages([]) // Clear when orb becomes invisible
      setShowConversationSkeleton(false)
      setIsVoiceRecording(false)
      setShowVoiceAnimation(false)
      setIsAiResponding(false)
      setSelectedHelpIndex(null)
      
      // Clear voice timeout
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current)
        voiceTimeoutRef.current = null
      }
      
      onExpanded?.(false) // Notify parent that orb is no longer expanded
    }
  }, [isVisible, onExpanded])

  if (!isVisible) return null

  // Different structure for inline vs floating orbs
  if (isOnProduct) {
    // Inline section orbs: Simple relative positioning, no complex overlay structure
    return (
      <div 
        ref={orbRef}
        className={`absolute pointer-events-auto z-50 ${
          isExpanded 
            ? 'transform origin-top-left' // Expand to the right from top-left
            : 'top-0 left-0' // Overlay positioning
        }`}
      >
        {/* Morphing Orb Container with Framer Motion */}
        <motion.div
          className={`transform ${
            isExpanded 
              ? 'w-96 h-96 rounded-3xl'
              : showSeeMore
                ? 'rounded-full h-12' // More compact height
                : 'w-12 h-12 rounded-full'
          }`}
          style={{
            background: isExpanded 
              ? 'rgba(255, 255, 255, 0.98)'
              : showSeeMore 
                ? 'rgba(255, 255, 255, 0.95)'
                : '#ffffff', // Solid white background for orb
            backdropFilter: (isExpanded || showSeeMore) ? 'blur(12px)' : 'none',
            border: (isExpanded || showSeeMore) ? '1px solid rgba(229, 231, 235, 0.8)' : '1px solid rgba(229, 231, 235, 0.3)',
            boxShadow: (isExpanded || showSeeMore)
              ? '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)'
              : '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)', // Subtle shadow for orb overlay
            // Only adjust width for showSeeMore state (product images)
            width: showSeeMore && !isOnProduct ? 'max-content' : undefined,
            minWidth: showSeeMore && !isOnProduct ? '320px' : undefined,
            maxWidth: showSeeMore && !isOnProduct ? '400px' : undefined
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isVisible ? 1 : 0,
            opacity: isVisible ? 1 : 0,
            width: isExpanded ? 384 : 48,
            height: isExpanded ? 384 : 48
          }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 30,
            mass: 0.8,
            duration: 0.4
          }}
          layout
          layoutId={`smart-orb-${isOnProduct ? 'inline' : 'floating'}`}
        >
          {!showSeeMore && !isExpanded ? (
            /* Apple-Style Initial Orb State */
            <div 
              className="w-full h-full flex items-center justify-center cursor-pointer group relative"
              onClick={handleOrbClick}
            >
              {/* Apple-style Glass Morphism Orb */}
              <div className="glass-orb-container">
                <svg className="glass-orb-svg" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="orb-base-2" cx="40%" cy="35%" r="70%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                      <stop offset="40%" stopColor="rgba(22,163,74,0.55)" />
                      <stop offset="100%" stopColor="rgba(15,118,110,0.45)" />
                    </radialGradient>

                    <radialGradient id="orb-rim-2" cx="50%" cy="40%" r="52%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                      <stop offset="80%" stopColor="rgba(4,120,87,0.25)" />
                      <stop offset="100%" stopColor="rgba(6,78,59,0.35)" />
                    </radialGradient>

                    <linearGradient id="specular-2" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.95)"/>
                      <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                    </linearGradient>

                    <filter id="inner-shadow-2" x="-20%" y="-20%" width="140%" height="140%">
                      <feOffset dx="0" dy="6" result="off"/>
                      <feGaussianBlur in="off" stdDeviation="10" result="blur"/>
                      <feComposite in="blur" in2="SourceAlpha" operator="out" result="comp"/>
                      <feColorMatrix in="comp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0"/>
                      <feComposite in2="SourceGraphic" operator="over"/>
                    </filter>
                  </defs>

                  <g transform="translate(500,500)">
                    <circle cx="0" cy="0" r="420" fill="url(#orb-base-2)" stroke="url(#orb-rim-2)" strokeWidth="2" />
                    <g style={{opacity: 0.95, filter: 'blur(0.6px)'}}>
                      <ellipse cx="-160" cy="-180" rx="160" ry="80" fill="url(#specular-2)" transform="rotate(-20)" />
                      <ellipse cx="-120" cy="-140" rx="32" ry="18" fill="rgba(255,255,255,0.95)" />
                    </g>
                    <circle cx="0" cy="0" r="360" fill="none" filter="url(#inner-shadow-2)" stroke="rgba(0,0,0,0)" />
                  </g>
                </svg>
                
                <RiSparklingFill 
                  size={20} 
                  className="text-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{ zIndex: 2 }}
                />
              </div>
              
              {/* Help Mode OR Inline Mode: Smooth Tooltip with Framer Motion */}
              <AnimatePresence>
                {(mode === 'help' || isOnProduct) && showTooltip && (
                  /* Tooltip - Positioned based on mode */
                  <motion.div 
                    className={`absolute top-1/2 transform -translate-y-1/2 pointer-events-auto z-50 cursor-pointer ${
                      isOnProduct ? '-left-40' : 'right-14'
                    }`}
                  initial={{ opacity: 0, scale: 0.8, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: -8 }}
                  exit={{ opacity: 0, scale: 0.8, y: -8 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    duration: 0.3
                  }}
                  onClick={handleOrbClick}
                >
                  <div 
                    className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 whitespace-nowrap hover:shadow-xl transition-shadow"
                    style={{
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    <p className="text-xs font-medium text-gray-900">
                      {customMessage || "Tea questions? Click me!"}
                    </p>
                    
                      {/* Tooltip Arrow - Points toward orb */}
                      <div 
                        className="absolute top-1/2 transform -translate-y-1/2 w-0 h-0 left-full"
                        style={{
                          borderTop: '4px solid transparent',
                          borderBottom: '4px solid transparent',
                          borderLeft: '4px solid white'
                        }}
                      />
                  </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Only show discovery text for product images (non-inline orbs) */}
              {mode === 'discovery' ? (
                /* Discovery Mode: Side Text on Hover - Only for product images */
                <div className="absolute left-10 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <div className="text-black text-sm font-medium whitespace-nowrap">
                    {customMessage || "Hey Ajay! Need help with tea selection?"}
                  </div>
                </div>
              ) : null}
              {/* Removed agent mode black text to avoid duplication with tooltip */}
            </div>
          ) : showSeeMore && !isExpanded ? (
            /* Compact Orb with Side Text State */
            <motion.div 
              className="w-full h-full flex items-center p-2" 
              style={{ 
                width: 'max-content',
                minWidth: '300px' // Maintain proper width for product image interaction
              }}
              initial={{ width: '48px' }}
              animate={{ width: 'max-content' }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              {/* AI Orb */}
              <motion.div 
                className="w-8 h-8 cursor-pointer flex-shrink-0"
                onClick={handleSeeMoreClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="glass-orb-container" style={{ width: '32px', height: '32px' }}>
                  <svg className="glass-orb-svg" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <radialGradient id="orb-base-small" cx="40%" cy="35%" r="70%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                        <stop offset="40%" stopColor="rgba(22,163,74,0.55)" />
                        <stop offset="100%" stopColor="rgba(15,118,110,0.45)" />
                      </radialGradient>
                      <radialGradient id="orb-rim-small" cx="50%" cy="40%" r="52%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                        <stop offset="80%" stopColor="rgba(4,120,87,0.25)" />
                        <stop offset="100%" stopColor="rgba(6,78,59,0.35)" />
                      </radialGradient>
                    </defs>
                    <g transform="translate(500,500)">
                      <circle cx="0" cy="0" r="420" fill="url(#orb-base-small)" stroke="url(#orb-rim-small)" strokeWidth="2" />
                    </g>
                  </svg>
                  <RiSparklingFill size={16} className="text-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 2 }} />
                </div>
              </motion.div>
              
              {/* Compact Text beside orb */}
              <motion.div 
                className="flex items-center ml-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#374151' }}>
                  {customMessage || "Hey Ajay! Found regional tea designs"} —
                  <button
                    onClick={handleSeeMoreClick}
                    className="ml-1 underline underline-offset-2 hover:no-underline transition-all"
                    style={{ color: '#059669' }} 
                  >
                    see more
                  </button>
                </span>
              </motion.div>
            </motion.div>
          ) : (
            /* Expanded Chat Interface */
            <div className="w-full h-full flex flex-col overflow-hidden rounded-3xl">
              {/* Header */}
              <div className="flex items-center justify-between p-3 rounded-t-3xl" style={{ borderBottom: '1px solid rgba(229, 231, 235, 0.2)', background: '#ffffff' }}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                    }}
                  >
                    <RiSparklingFill size={16} className="text-white" />
                  </div>
                  {isAiResponding && (
                    <RiLoader4Fill size={16} className="animate-spin" style={{ color: '#374151' }} />
                  )}
                </div>
                <button 
                  onClick={handleClose}
                  className="p-1.5 rounded-lg transition-all hover:bg-gray-50"
                  style={{
                    background: 'rgba(249, 250, 251, 0.5)',
                    border: '1px solid rgba(229, 231, 235, 0.3)',
                  }}
                >
                  <RiCloseLine size={16} style={{ color: '#6B7280' }} />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 p-3 overflow-y-auto" style={{ background: '#ffffff' }}>
                {isInConversation ? (
                  /* Conversation Mode: Show AI analysis messages */
                  <div className="space-y-3">
                    {showConversationSkeleton ? (
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
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {conversationMessages.map((message) => {
                          const IconComponent = message.icon || RiSparklingFill
                          const isUserMessage = message.id.startsWith('user-')

                          return (
                            <div key={message.id} className={`flex items-start gap-3 animate-fadeIn ${isUserMessage ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 rounded-full ${isUserMessage ? 'bg-green-100' : ''}`}>
                                <IconComponent 
                                  size={14} 
                                  style={isUserMessage ? { color: '#059669' } : { color: '#374151' }} 
                                  className={IconComponent === RiLoader4Fill ? 'animate-spin' : ''}
                                />
                              </div>
                              <div className={`flex-1 text-sm ${isUserMessage ? 'text-right' : ''}`} style={{ color: '#374151', lineHeight: '1.6' }}>
                                {message.content.includes('**') ? (
                                  /* Render markdown-style bold text */
                                  <div 
                                    dangerouslySetInnerHTML={{
                                      __html: message.content
                                        .split('\n').map(line => line.trim()).join('<br/>')
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/•/g, '•')
                                    }}
                                  />
                                ) : (
                                  <>
                                    {message.content.split('').map((char, index) => (
                                      <span key={index}>{char}</span>
                                    ))}
                                    {message.isTyping && (
                                      <span className="inline-block w-0.5 h-4 ml-1 animate-pulse" style={{ backgroundColor: '#374151' }}></span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        })}
                        
                        {/* Show Kerala tea suggestions after conversation if enabled - ONLY in discovery mode */}
                        {showSuggestions && mode === 'discovery' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Regional Tea Designs</h4>
                            <div className="space-y-2">
                              {KERALA_TEA_SUGGESTIONS.map((product, index) => (
                                <div 
                                  key={product.id}
                                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer group animate-fadeIn"
                                    style={{
                                      background: 'rgba(249, 250, 251, 0.7)', // Lighter background
                                      border: '1px solid rgba(229, 231, 235, 0.4)',
                                      animationDelay: `${index * 0.15}s`
                                    }}
                                >
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-xs truncate mb-1" style={{ color: '#111827' }}>
                                      {product.name}
                                    </h4>
                                    <p className="text-xs mb-1.5" style={{ color: '#6B7280' }}>
                                      {product.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-xs" style={{ color: '#059669' }}>
                                        {product.price}
                                      </span>
                                      <button 
                                        className="text-xs text-white px-2.5 py-1 rounded-lg transition-all duration-200 font-medium"
                                        style={{
                                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.opacity = '0.9'
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.opacity = '1'
                                        }}
                                      >
                                        View
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Simple option below regional designs */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <button
                                className="w-full p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 text-left"
                                style={{
                                  background: '#f9fafb',
                                  border: '1px solid #e5e7eb',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f3f4f6'
                                  e.currentTarget.style.borderColor = '#d1d5db'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#f9fafb'
                                  e.currentTarget.style.borderColor = '#e5e7eb'
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium" style={{ color: '#111827' }}>
                                    View all regional tea collections
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded" style={{ background: '#e5e7eb', color: '#6b7280' }}>
                                    12 items
                                  </span>
                                </div>
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : mode === 'discovery' ? (
                  /* Discovery Mode: Show Kerala recommendations */
                  <div className="space-y-2">
                    {KERALA_TEA_SUGGESTIONS.map((product, index) => (
                      <div 
                        key={product.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer group animate-fadeIn"
                          style={{
                            background: 'rgba(249, 250, 251, 0.7)', // Lighter background
                            border: '1px solid rgba(229, 231, 235, 0.4)',
                            animationDelay: `${index * 0.15}s`
                          }}
                      >
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs truncate mb-1" style={{ color: '#111827' }}>
                            {product.name}
                          </h4>
                          <p className="text-xs mb-1.5" style={{ color: '#6B7280' }}>
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs" style={{ color: '#059669' }}>
                              {product.price}
                            </span>
                            <button 
                              className="text-xs text-white px-2.5 py-1 rounded-lg transition-all duration-200 font-medium"
                              style={{
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.9'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1'
                              }}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Help Mode: Show welcome message and default options */
                  <div className="flex-1 flex flex-col py-4">
                    {/* Welcome Message */}
                    <div className="text-center mb-6">
                      <div 
                        className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        }}
                      >
                        <RiSparklingFill size={16} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1" style={{ color: '#111827' }}>
                        {mode === 'agent' 
                          ? 'Ready to help with your purchase'
                          : productCategory === 'deployment' 
                            ? 'How can I help with deployment?'
                            : 'How can I help with this tea?'
                        }
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                        {mode === 'agent' 
                          ? 'I can help you complete your purchase or answer any questions'
                          : 'Choose an option below or ask me anything'
                        }
                      </p>
                    </div>

                    {/* Mode-based Options */}
                    <div className="space-y-3 px-1 flex-1">
                      {(mode === 'agent' ? [
                        { 
                          text: "Add to cart now", 
                          icon: RiHeartLine, 
                          action: () => {
                            setInputText("I want to add this deployment package to cart for $24.99")
                            handleSendInput()
                          }
                        },
                        { 
                          text: "Compare packages", 
                          icon: RiEyeLine, 
                          action: () => {
                            setInputText("Show me different deployment packages and pricing options")
                            handleSendInput()
                          }
                        },
                        { 
                          text: "Get expert help", 
                          icon: RiStarLine, 
                          action: () => {
                            setInputText("I need expert help choosing the right deployment package for my store")
                            handleSendInput()
                          }
                        }
                      ] : [
                        { 
                          text: "Buy this product", 
                          icon: RiHeartLine, 
                          action: () => {
                            setInputText("Help me buy this Premium Earl Grey Tea")
                            handleSendInput()
                          }
                        },
                        { 
                          text: "Compare with other teas", 
                          icon: RiEyeLine, 
                          action: () => {
                            setInputText("Can you compare this Earl Grey with other similar teas?")
                            handleSendInput()
                          }
                        },
                        { 
                          text: "Learn about ingredients", 
                          icon: RiStarLine, 
                          action: () => {
                            startIngredientsAnalysis()
                          }
                        }
                      ]).map((option, index) => (
                        <button
                          key={index}
                          onClick={option.action}
                          className="w-full p-3 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer group text-left"
                          style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f3f4f6'
                            e.currentTarget.style.borderColor = '#d1d5db'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f9fafb'
                            e.currentTarget.style.borderColor = '#e5e7eb'
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <option.icon size={16} style={{ color: '#059669' }} />
                            <span className="text-sm font-medium" style={{ color: '#111827' }}>
                              {option.text}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Search Bar and Voice Input (Always Visible at Bottom) */}
              <div className="border-t p-3 rounded-b-3xl" style={{ borderColor: 'rgba(229, 231, 235, 0.3)', background: '#ffffff' }}>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={isVoiceRecording ? "Listening..." : (mode === 'discovery' ? "Ask me anything, Ajay..." : "Ask about this Earl Grey tea...")}
                      className="w-full px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 text-sm"
                      style={{
                        background: 'rgba(249, 250, 251, 0.8)',
                        border: '1px solid rgba(209, 213, 219, 0.5)',
                        color: '#111827',
                        paddingLeft: showVoiceAnimation ? '60px' : '12px' // Make room for voice bars
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendInput()}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#047857'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(209, 213, 219, 0.5)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                      disabled={isVoiceRecording}
                    />
                    
                    {/* Voice Animation - 8 Purple Bars */}
                    {showVoiceAnimation && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-0.5">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="w-0.5 bg-green-600 rounded-full animate-pulse"
                            style={{
                              height: '16px',
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: '1s',
                              animationIterationCount: 'infinite'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSendInput}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                    style={{
                      background: 'rgba(249, 250, 251, 0.8)',
                      border: '1px solid rgba(209, 213, 219, 0.5)',
                      color: '#059669'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#047857'
                      e.currentTarget.style.background = 'rgba(249, 250, 251, 1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(209, 213, 219, 0.5)'
                      e.currentTarget.style.background = 'rgba(249, 250, 251, 0.8)'
                    }}
                  >
                    <RiSendPlaneLine size={16} />
                  </button>
                  <button
                    onClick={handleVoiceClick}
                    disabled={isAiResponding || isVoiceRecording}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative group ${
                      isAiResponding ? 'cursor-not-allowed' : ''
                    }`}
                    style={{
                      background: isAiResponding 
                        ? 'rgba(249, 250, 251, 0.5)' 
                        : isVoiceRecording 
                          ? '#059669' 
                          : 'rgba(249, 250, 251, 0.8)',
                      border: `1px solid ${
                        isAiResponding 
                          ? 'rgba(209, 213, 219, 0.3)' 
                          : isVoiceRecording 
                            ? '#059669' 
                            : 'rgba(209, 213, 219, 0.5)'
                      }`,
                      color: isAiResponding 
                        ? '#9CA3AF' 
                        : isVoiceRecording 
                          ? '#ffffff' 
                          : '#059669'
                    }}
                    onMouseEnter={(e) => {
                      if (!isVoiceRecording && !isAiResponding) {
                        e.currentTarget.style.borderColor = '#047857'
                        e.currentTarget.style.background = 'rgba(249, 250, 251, 1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isVoiceRecording && !isAiResponding) {
                        e.currentTarget.style.borderColor = 'rgba(209, 213, 219, 0.5)'
                        e.currentTarget.style.background = 'rgba(249, 250, 251, 0.8)'
                      }
                    }}
                    title={isAiResponding ? "AI is responding..." : isVoiceRecording ? "Stop recording" : "Voice input"}
                  >
                    <RiMicLine size={16} />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      {isAiResponding ? "AI is responding..." : isVoiceRecording ? "Stop recording" : "Voice input"}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // Floating orbs: Original complex structure for help orb and product image orbs
  return (
    <>
      {/* Backdrop overlay when chat is expanded and centered */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}
      
      {/* Container positioning for floating orbs */}
      <div 
        className="fixed z-50 pointer-events-none inset-0"
        style={{ background: 'transparent' }}
      >
        <div 
          ref={orbRef}
          className={`absolute pointer-events-auto ${
            isExpanded
              ? 'fixed top-1/2 transform -translate-y-1/2 z-50' // Center vertically, custom horizontal positioning
              : '' // Help mode orb: no special positioning (handled by parent)
          }`}
          style={isExpanded ? {
            left: 'calc(50% - 400px)' // 120px left from center
          } : {
            bottom: '0px',
            right: '132px' // 132px left from right edge where it currently is
          }}
        >
          {/* Morphing Orb Container with Framer Motion */}
          <motion.div
            className={`transform ${
              isExpanded 
                ? 'w-96 h-96 rounded-3xl'
                : showSeeMore
                  ? 'rounded-full h-12' // More compact height
                  : 'w-12 h-12 rounded-full'
            }`}
            style={{
              background: isExpanded 
                ? 'rgba(255, 255, 255, 0.98)'
                : showSeeMore 
                  ? 'rgba(255, 255, 255, 0.95)'
                  : '#ffffff', // Solid white background for orb
              backdropFilter: (isExpanded || showSeeMore) ? 'blur(12px)' : 'none',
              border: (isExpanded || showSeeMore) ? '1px solid rgba(229, 231, 235, 0.8)' : '1px solid rgba(229, 231, 235, 0.3)',
              boxShadow: (isExpanded || showSeeMore)
                ? '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)'
                : '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)', // Subtle shadow for orb overlay
              // Only adjust width for showSeeMore state (product images)
              width: showSeeMore && !isOnProduct ? 'max-content' : undefined,
              minWidth: showSeeMore && !isOnProduct ? '320px' : undefined,
              maxWidth: showSeeMore && !isOnProduct ? '400px' : undefined
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isVisible ? 1 : 0,
              opacity: isVisible ? 1 : 0,
              width: isExpanded ? 'min(384px, calc(100vw - 40px))' : 48, // Responsive width for small screens
              height: isExpanded ? 'min(384px, calc(100vh - 80px))' : 48 // Responsive height for small screens
            }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 30,
              mass: 0.8,
              duration: 0.4
            }}
            layout
            layoutId={`smart-orb-floating`}
          >
            {/* Same content as inline orbs but for floating context */}
            {!showSeeMore && !isExpanded ? (
              /* Apple-Style Initial Orb State */
              <div 
                className="w-full h-full flex items-center justify-center cursor-pointer group relative"
                onClick={handleOrbClick}
              >
                {/* Glass morphism orb */}
            <div className="glass-orb-container">
              <svg className="glass-orb-svg" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="orb-base" cx="40%" cy="35%" r="70%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                    <stop offset="40%" stopColor="rgba(22,163,74,0.55)" />
                    <stop offset="100%" stopColor="rgba(15,118,110,0.45)" />
                  </radialGradient>

                  <radialGradient id="orb-rim" cx="50%" cy="40%" r="52%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                    <stop offset="80%" stopColor="rgba(4,120,87,0.25)" />
                    <stop offset="100%" stopColor="rgba(6,78,59,0.35)" />
                  </radialGradient>

                  <linearGradient id="specular" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.95)"/>
                    <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                  </linearGradient>

                  <filter id="inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feOffset dx="0" dy="6" result="off"/>
                    <feGaussianBlur in="off" stdDeviation="10" result="blur"/>
                    <feComposite in="blur" in2="SourceAlpha" operator="out" result="comp"/>
                    <feColorMatrix in="comp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0"/>
                    <feComposite in2="SourceGraphic" operator="over"/>
                  </filter>
                </defs>

                <g transform="translate(500,500)">
                  <circle cx="0" cy="0" r="420" fill="url(#orb-base)" stroke="url(#orb-rim)" strokeWidth="2" />
                  <g style={{opacity: 0.95, filter: 'blur(0.6px)'}}>
                    <ellipse cx="-160" cy="-180" rx="160" ry="80" fill="url(#specular)" transform="rotate(-20)" />
                    <ellipse cx="-120" cy="-140" rx="32" ry="18" fill="rgba(255,255,255,0.95)" />
                  </g>
                  <circle cx="0" cy="0" r="360" fill="none" filter="url(#inner-shadow)" stroke="rgba(0,0,0,0)" />
                </g>
              </svg>
              
              <RiSparklingFill 
                size={20} 
                className="text-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{ zIndex: 2 }}
              />
            </div>
                
                {/* Help Mode: Three Tooltip Options */}
                <AnimatePresence>
                  {mode === 'help' && showTooltip && (
                    /* Three Tooltip Options - Positioned on left side of help orb */
                    <motion.div 
                      className="absolute top-1/2 right-14 transform -translate-y-1/2 pointer-events-auto z-50"
                      initial={{ opacity: 0, scale: 0.8, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: -8 }}
                      exit={{ opacity: 0, scale: 0.8, y: -8 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        duration: 0.3
                      }}
                    >
                      <div className="flex flex-col gap-1">
                        {/* Summarise Option */}
                        <div 
                          className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover:bg-gray-50 transition-all cursor-pointer group"
                          style={{
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            backdropFilter: 'blur(8px)'
                          }}
                          onClick={() => {
                            setShowSuggestions(false)
                            handleOrbClick()
                            
                            // Start AI summarization sequence
                            setTimeout(() => {
                              startSummarizationSequence()
                            }, 500)
                          }}
                        >
                          <p className="text-xs font-medium text-gray-900 whitespace-nowrap">
                            Summarise
                          </p>
                        </div>

                        {/* Ask Question Option */}
                        <div 
                          className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover:bg-gray-50 transition-all cursor-pointer group"
                          style={{
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            backdropFilter: 'blur(8px)'
                          }}
                          onClick={() => {
                            handleOrbClick()
                            // Start voice input after chat expands
                            setTimeout(() => {
                              handleVoiceClick()
                            }, 500)
                          }}
                        >
                          <p className="text-xs font-medium text-gray-900 whitespace-nowrap">
                            Ask question
                          </p>
                        </div>

                        {/* Purchase Option */}
                        <div 
                          className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover:bg-gray-50 transition-all cursor-pointer group"
                          style={{
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            backdropFilter: 'blur(8px)'
                          }}
                          onClick={() => {
                            setInputText("Help me purchase this Earl Grey tea")
                            handleOrbClick()
                            // Send the input after chat expands
                            setTimeout(() => {
                              handleSendInput()
                            }, 400)
                          }}
                        >
                          <p className="text-xs font-medium text-gray-900 whitespace-nowrap">
                            Purchase
                          </p>
                        </div>
                        
                        {/* Tooltip Arrow - Points right toward orb */}
                        <div 
                          className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0"
                          style={{
                            borderTop: '4px solid transparent',
                            borderBottom: '4px solid transparent', 
                            borderLeft: '4px solid white'
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {mode === 'discovery' ? (
                  /* Discovery Mode: Side Text on Hover */
                  <div className="absolute left-10 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                    <div className="text-black text-sm font-medium whitespace-nowrap">
                      {customMessage || "Hey Ajay! Need help with tea selection?"}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : showSeeMore && !isExpanded ? (
              /* Compact Orb with Side Text State */
              <motion.div 
                className="w-full h-full flex items-center p-2" 
                style={{ 
                  width: 'max-content',
                  minWidth: '300px' // Maintain proper width for product image interaction
                }}
                initial={{ width: '48px' }}
                animate={{ width: 'max-content' }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              >
                {/* AI Orb */}
                <motion.div 
                  className="w-8 h-8 cursor-pointer flex-shrink-0"
                  onClick={handleSeeMoreClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="glass-orb-container" style={{ width: '32px', height: '32px' }}>
                    <svg className="glass-orb-svg" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <radialGradient id="orb-base-small-2" cx="40%" cy="35%" r="70%">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                          <stop offset="40%" stopColor="rgba(22,163,74,0.55)" />
                          <stop offset="100%" stopColor="rgba(15,118,110,0.45)" />
                        </radialGradient>
                        <radialGradient id="orb-rim-small-2" cx="50%" cy="40%" r="52%">
                          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                          <stop offset="80%" stopColor="rgba(4,120,87,0.25)" />
                          <stop offset="100%" stopColor="rgba(6,78,59,0.35)" />
                        </radialGradient>
                      </defs>
                      <g transform="translate(500,500)">
                        <circle cx="0" cy="0" r="420" fill="url(#orb-base-small-2)" stroke="url(#orb-rim-small-2)" strokeWidth="2" />
                      </g>
                    </svg>
                    <RiSparklingFill size={16} className="text-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 2 }} />
                  </div>
                </motion.div>
                
                {/* Compact Text beside orb */}
                <motion.div 
                  className="flex items-center ml-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#374151' }}>
                    {customMessage || "Hey Ajay! Found regional tea designs"} —
                    <button
                      onClick={handleSeeMoreClick}
                      className="ml-1 underline underline-offset-2 hover:no-underline transition-all"
                      style={{ color: '#059669' }} 
                    >
                      see more
                    </button>
                  </span>
                </motion.div>
              </motion.div>
            ) : (
              /* Full expanded chat interface for floating orbs */
              <div className="w-full h-full flex flex-col overflow-hidden rounded-3xl">
                {/* Header */}
                <div className="flex items-center justify-between p-3 rounded-t-3xl" style={{ borderBottom: '1px solid rgba(229, 231, 235, 0.2)', background: '#ffffff' }}>
                  <div className="flex items-center gap-2">
                    <div className="glass-orb-container" style={{ width: '24px', height: '24px' }}>
                      <svg className="glass-orb-svg" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <radialGradient id="orb-base-header-smart" cx="40%" cy="35%" r="70%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                            <stop offset="40%" stopColor="rgba(22,163,74,0.55)" />
                            <stop offset="100%" stopColor="rgba(15,118,110,0.45)" />
                          </radialGradient>
                          <radialGradient id="orb-rim-header-smart" cx="50%" cy="40%" r="52%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                            <stop offset="80%" stopColor="rgba(4,120,87,0.25)" />
                            <stop offset="100%" stopColor="rgba(6,78,59,0.35)" />
                          </radialGradient>
                        </defs>
                        <g transform="translate(500,500)">
                          <circle cx="0" cy="0" r="420" fill="url(#orb-base-header-smart)" stroke="url(#orb-rim-header-smart)" strokeWidth="2" />
                        </g>
                      </svg>
                      <RiSparklingFill size={12} className="text-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 2 }} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">AI Shopping Assistant</span>
                    {isAiResponding && (
                      <RiLoader2Line size={16} className="animate-spin ml-2" style={{ color: '#374151' }} />
                    )}
                  </div>
                  <button 
                    onClick={handleClose}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <RiCloseLine size={16} className="text-gray-600" />
                  </button>
                </div>

                {/* Chat content area */}
                <div ref={chatContentRef} className="flex-1 overflow-auto p-4 space-y-3">
                  {isInConversation ? (
                    /* Conversation Mode: Show AI analysis messages */
                    <div className="space-y-3">
                      {showConversationSkeleton ? (
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
                              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                        {conversationMessages.map((message) => {
                          const IconComponent = message.icon || RiSparklingFill
                          const isUserMessage = message.id.startsWith('user-')

                          return (
                            <div key={message.id} className={`flex items-start gap-3 animate-fadeIn ${isUserMessage ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 rounded-full ${isUserMessage ? 'bg-green-100' : ''}`}>
                                <IconComponent 
                                  size={14} 
                                  style={isUserMessage ? { color: '#059669' } : { color: '#374151' }} 
                                  className={IconComponent === RiLoader4Fill ? 'animate-spin' : ''}
                                />
                              </div>
                                <div className={`flex-1 text-sm ${isUserMessage ? 'text-right' : ''}`} style={{ color: '#374151', lineHeight: '1.6' }}>
                                  {message.content.includes('**') ? (
                                    /* Render markdown-style bold text */
                                    <div 
                                      dangerouslySetInnerHTML={{
                                        __html: message.content
                                          .split('\n').map(line => line.trim()).join('<br/>')
                                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                          .replace(/•/g, '•')
                                      }}
                                    />
                                  ) : (
                                    <>
                                      {message.content.split('').map((char, index) => (
                                        <span key={index}>{char}</span>
                                      ))}
                                      {message.isTyping && (
                                        <span className="inline-block w-0.5 h-4 ml-1 animate-pulse" style={{ backgroundColor: '#374151' }}></span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </>
                      )}
                    </div>
                  ) : showSummary ? (
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">AI Shopping Assistant</h3>
                        <p className="text-xs text-gray-600 mb-1">Powered by: Orbin AI</p>
                        <p className="text-xs text-gray-600">Personalization: For Kerala, India</p>
                      </div>
                      
                      <div className="bg-white border rounded-lg p-3 space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900">Premium Earl Grey Tea</h4>
                        <p className="text-xs text-gray-600">Organic Ceylon black tea with natural bergamot</p>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Current Price:</span>
                            <span className="font-semibold text-green-600">$24.99</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Original Price:</span>
                            <span className="line-through text-gray-400">$32.99</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-semibold text-red-600">25% OFF</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white border rounded-lg p-3 space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900">Product Highlights</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Premium Ceylon black tea leaves</li>
                          <li>• Natural bergamot oil from Italy</li>
                          <li>• Available in loose leaf & tea bags</li>
                          <li>• Hand-picked from high altitude gardens</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white border rounded-lg p-3 space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900">Trust & Policies</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Free shipping on orders over $50</li>
                          <li>• 30-day return policy</li>
                          <li>• Organic certified & ethically sourced</li>
                        </ul>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
                          Add to Cart - $24.99
                        </button>
                        <button className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-lg transition-colors">
                          Buy it now
                        </button>
                      </div>
                    </div>
                  ) : showSuggestions && (
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          I can help you with tea recommendations, brewing tips, or answer questions about this Earl Grey blend.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input area */}
                <div className="p-3 border-t border-gray-200" style={{ background: '#ffffff' }}>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={isVoiceRecording ? "Listening..." : "Ask about this tea..."}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        style={{
                          paddingLeft: showVoiceAnimation ? '60px' : '12px',
                          paddingRight: '12px'
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendInput()}
                        disabled={isVoiceRecording}
                      />
                      
                      {/* Voice Animation - Green Bars */}
                      {showVoiceAnimation && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-0.5">
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              className="w-0.5 bg-green-600 rounded-full animate-pulse"
                              style={{
                                height: '16px',
                                animationDelay: `${i * 0.1}s`,
                                animationDuration: '1s',
                                animationIterationCount: 'infinite'
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Voice Input Button */}
                    <button
                      onClick={handleVoiceClick}
                      disabled={isAiResponding || isVoiceRecording}
                      className={`p-2 border rounded-lg transition-colors group relative ${
                        isAiResponding || isVoiceRecording
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      title={isAiResponding ? "AI is responding..." : isVoiceRecording ? "Recording..." : "Voice input"}
                    >
                      <RiMicLine 
                        size={16} 
                        className={`${
                          isAiResponding || isVoiceRecording ? 'text-gray-400' : 'text-gray-600'
                        }`} 
                      />
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        {isAiResponding ? "AI is responding..." : isVoiceRecording ? "Recording..." : "Voice input"}
                      </div>
                    </button>
                    
                    {/* Send Button */}
                    <button
                      onClick={handleSendInput}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      title="Send message"
                    >
                      <RiSendPlaneLine size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}

