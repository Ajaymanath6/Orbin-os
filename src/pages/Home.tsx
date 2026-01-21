import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import DiagnosticCard from '../components/DiagnosticCard'
import Badge from '../components/Badge'

// Mock data for Sarah's store issues
const mockIssues = [
  {
    id: '1',
    title: 'Slow Page Load Speed',
    description: 'Your product pages are loading 3.2s slower than optimal, affecting conversion rates.',
    severity: 'critical' as const,
    impact: 'Potential 15% revenue loss (~$2,400/month)',
    fixable: true,
    estimatedTime: '2 minutes'
  },
  {
    id: '2', 
    title: 'Missing Alt Text on Images',
    description: '47 product images lack accessibility alt text, hurting SEO and compliance.',
    severity: 'warning' as const,
    impact: 'SEO ranking decrease, accessibility issues',
    fixable: true,
    estimatedTime: '30 seconds'
  }
]

export default function Home() {
  const [isScanning, setIsScanning] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleScan = () => {
    setIsScanning(true)
    // Simulate AI scan
    setTimeout(() => {
      setIsScanning(false)
      setShowResults(true)
    }, 3000)
  }

  const handleFix = (issueId: string) => {
    console.log('Fixing issue:', issueId)
    // TODO: Implement AI fix logic
  }

  const handlePreview = (issueId: string) => {
    console.log('Previewing fix for:', issueId)
    // TODO: Implement preview logic
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-polaris-text mb-4">
            Your 24/7 AI Performance Consultant
          </h1>
          <p className="text-lg text-polaris-text-subdued mb-6">
            Aggo finds performance issues in your Shopify store and deploys AI agents to fix them instantly. 
            No developers needed, no long reports—just fast, actionable results.
          </p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge variant="success">✓ Instant Fixes</Badge>
            <Badge variant="info">✓ Visual Previews</Badge>
            <Badge variant="success">✓ Zero Code Required</Badge>
          </div>
        </div>
      </section>

      {/* Scan Section */}
      {!showResults && (
        <Card title="Store Health Check" subtitle="Connect your Shopify store for an instant AI diagnostic">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border border-polaris-border rounded-polaris bg-polaris-surface-subdued">
              <div className="flex-1">
                <input 
                  type="url" 
                  placeholder="Enter your Shopify store URL (e.g., yourstore.myshopify.com)"
                  className="w-full px-3 py-2 border border-polaris-border rounded-polaris focus:outline-none focus:ring-2 focus:ring-polaris-interactive"
                />
              </div>
              <Button 
                onClick={handleScan} 
                disabled={isScanning}
                variant="primary"
              >
                {isScanning ? '🔍 Scanning...' : '🚀 Start AI Scan'}
              </Button>
            </div>
            
            {isScanning && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-polaris-interactive mb-4"></div>
                <p className="text-polaris-text-subdued">AI is analyzing your store performance...</p>
                <div className="mt-4 space-y-2 text-sm text-polaris-text-subdued">
                  <p>✓ Checking page load speeds</p>
                  <p>✓ Analyzing SEO optimization</p>
                  <p>✓ Reviewing conversion funnels</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Results Section */}
      {showResults && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-polaris-text">Diagnostic Results</h2>
              <p className="text-polaris-text-subdued">Found {mockIssues.length} issues that can be fixed instantly</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="critical">{mockIssues.filter(i => i.severity === 'critical').length} Critical</Badge>
              <Badge variant="warning">{mockIssues.filter(i => i.severity === 'warning').length} Warning</Badge>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {mockIssues.map(issue => (
              <DiagnosticCard
                key={issue.id}
                issue={issue}
                onFix={handleFix}
                onPreview={handlePreview}
              />
            ))}
          </div>

          <Card className="bg-green-50 border-green-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-polaris-text mb-2">
                💰 Potential Monthly Revenue Recovery: $10,900
              </h3>
              <p className="text-polaris-text-subdued mb-4">
                Fix all critical issues to unlock this revenue potential
              </p>
              <Button variant="success" className="px-8">
                🤖 Fix All Issues (Est. 7 minutes)
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Features for Sarah */}
      <section className="grid md:grid-cols-3 gap-6 mt-12">
        <Card title="⚡ Instant Results" subtitle="No waiting for reports">
          <p className="text-sm text-polaris-text-subdued">
            Get actionable insights in seconds, not hours. Our AI scans your entire store and prioritizes fixes by revenue impact.
          </p>
        </Card>
        
        <Card title="🎯 One-Click Fixes" subtitle="No developers needed">
          <p className="text-sm text-polaris-text-subdued">
            Deploy AI agents to fix issues automatically. Preview changes before they go live on your store.
          </p>
        </Card>
        
        <Card title="📊 Revenue Impact" subtitle="See the money behind every fix">
          <p className="text-sm text-polaris-text-subdued">
            Every recommendation shows potential revenue impact, so you can prioritize fixes that matter most to your bottom line.
          </p>
        </Card>
      </section>
    </div>
  )
}


