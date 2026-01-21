import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { RiTruckLine, RiArrowGoBackLine, RiPlantLine } from '@remixicon/react'
import Card from '../components/Card'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import Button from '../components/Button'
import Badge from '../components/Badge'
import StatusIndicator from '../components/StatusIndicator'

interface Issue {
  id: string
  title: string
  description: string
  severity: 'critical' | 'warning'
  impact: string
  estimatedTime: string
}

interface FixData {
  beforeImage: string
  afterImage: string
  changes: string[]
  expectedImprovement: string
  technicalDetails: string[]
}

// Mock fix data for different issue types
const mockFixData: Record<string, FixData> = {
  '1': { // Slow Page Load Speed
    beforeImage: 'https://via.placeholder.com/600x400/ff6b6b/ffffff?text=Before%3A+Slow+Loading+(3.2s)',
    afterImage: 'https://via.placeholder.com/600x400/51cf66/ffffff?text=After%3A+Fast+Loading+(0.8s)',
    changes: [
      'Optimized image compression (reduced file sizes by 70%)',
      'Enabled browser caching for static assets',
      'Minified CSS and JavaScript files',
      'Implemented lazy loading for below-fold images'
    ],
    expectedImprovement: 'Page load time: 3.2s → 0.8s (75% improvement)',
    technicalDetails: [
      'Images compressed using WebP format with 85% quality',
      'Cache headers set to 1 year for static assets',
      'JavaScript bundles reduced from 450KB to 180KB',
      'Lazy loading implemented for 23 product images'
    ]
  },
  '2': { // Missing Alt Text
    beforeImage: 'https://via.placeholder.com/600x400/ffd43b/000000?text=Before%3A+No+Alt+Text',
    afterImage: 'https://via.placeholder.com/600x400/51cf66/ffffff?text=After%3A+SEO+Optimized',
    changes: [
      'Added descriptive alt text to 47 product images',
      'Optimized alt text for SEO keywords',
      'Improved accessibility compliance',
      'Enhanced screen reader compatibility'
    ],
    expectedImprovement: 'SEO score improvement + accessibility compliance',
    technicalDetails: [
      'Alt text follows best practices (descriptive, under 125 characters)',
      'Includes relevant product keywords naturally',
      'WCAG 2.1 AA compliance achieved',
      'Screen reader testing completed'
    ]
  },
  '4': { // Mobile Checkout Friction
    beforeImage: 'https://via.placeholder.com/600x400/ff6b6b/ffffff?text=Before%3A+6-Step+Checkout',
    afterImage: 'https://via.placeholder.com/600x400/51cf66/ffffff?text=After%3A+3-Step+Checkout',
    changes: [
      'Reduced checkout steps from 6 to 3',
      'Enabled guest checkout option',
      'Simplified form fields (removed 8 optional fields)',
      'Added mobile payment options (Apple Pay, Google Pay)'
    ],
    expectedImprovement: 'Reduce mobile checkout abandonment by 23%',
    technicalDetails: [
      'Combined shipping and billing address forms',
      'Auto-fill enabled for returning customers',
      'Express payment buttons prominently displayed',
      'Form validation improved with real-time feedback'
    ]
  }
}

export default function FixPage() {
  const { issueId } = useParams<{ issueId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [isDeploying, setIsDeploying] = useState(false)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  
  const storeUrl = location.state?.storeUrl
  const diagnosticData = location.state?.diagnosticData
  const issue: Issue = location.state?.issue

  useEffect(() => {
    // Redirect if no data provided
    if (!issue || !storeUrl || !issueId) {
      navigate('/')
    }
  }, [issue, storeUrl, issueId, navigate])

  if (!issue || !storeUrl || !issueId) {
    return null
  }

  const fixData = mockFixData[issueId] || mockFixData['1']

  const handleDeploy = async () => {
    setIsDeploying(true)
    
    // Simulate API call to deploy fix
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      navigate('/diagnostics/confirmed', {
        state: {
          storeUrl,
          diagnosticData,
          fixedIssue: issue,
          fixData
        }
      })
    } catch (error) {
      console.error('Deploy failed:', error)
      setIsDeploying(false)
    }
  }

  const getSeverityType = (severity: string) => {
    return severity === 'critical' ? 'critical' as const : 'warning' as const
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-polaris-text mb-2">
          Fix Preview: {issue.title}
        </h1>
        <p className="text-polaris-text-subdued">
          Review the changes before deploying to {storeUrl}
        </p>
      </div>

      {/* Issue Summary */}
      <Card className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <StatusIndicator 
              severity={getSeverityType(issue.severity)} 
              size="lg" 
            />
            <div>
              <h3 className="font-semibold text-polaris-text">{issue.title}</h3>
              <p className="text-sm text-polaris-text-subdued mt-1">{issue.description}</p>
            </div>
          </div>
          <Badge variant={issue.severity === 'critical' ? 'critical' : 'warning'}>
            {issue.severity.toUpperCase()}
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-4 p-4 bg-polaris-surface-subdued rounded-polaris">
          <div>
            <p className="text-sm font-medium text-polaris-text">Current Impact</p>
            <p className="text-sm text-polaris-text-subdued">{issue.impact}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-polaris-text">Expected Improvement</p>
            <p className="text-sm text-polaris-green font-medium">{fixData.expectedImprovement}</p>
          </div>
        </div>
      </Card>

      {/* Before/After Comparison */}
      <Card title="Visual Comparison" className="max-w-4xl mx-auto">
        <BeforeAfterSlider
          beforeImage={fixData.beforeImage}
          afterImage={fixData.afterImage}
          beforeLabel="Current State"
          afterLabel="After Fix"
        />
      </Card>

      {/* Changes Summary */}
      <Card title="What Will Change" className="max-w-2xl mx-auto">
        <div className="space-y-3">
          {fixData.changes.map((change, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-polaris-green font-bold">✓</span>
              <p className="text-sm text-polaris-text">{change}</p>
            </div>
          ))}
        </div>

        {/* Technical Details Toggle */}
        <div className="mt-6 pt-4 border-t border-polaris-border">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="flex items-center gap-2 text-sm text-polaris-interactive hover:text-polaris-blue"
          >
            <span>{showTechnicalDetails ? '▼' : '▶'}</span>
            Technical Details
          </button>
          
          {showTechnicalDetails && (
            <div className="mt-3 space-y-2">
              {fixData.technicalDetails.map((detail, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-polaris-text-subdued">•</span>
                  <p className="text-sm text-polaris-text-subdued">{detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-polaris-text mb-2">
                Ready to Deploy?
              </h3>
              <p className="text-sm text-polaris-text-subdued">
                This fix will be applied to your live store. You can always revert changes if needed.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate('/diagnostics/report', { state: { storeUrl, diagnosticData } })}
                className="flex-1"
                disabled={isDeploying}
              >
                ← Back to Report
              </Button>
              <Button
                variant="success"
                onClick={handleDeploy}
                loading={isDeploying}
                className="flex-1"
              >
                {isDeploying ? 'Deploying Fix...' : '🚀 Approve & Deploy'}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-polaris-text-subdued">
                Estimated deployment time: {issue.estimatedTime} • Changes are reversible
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
