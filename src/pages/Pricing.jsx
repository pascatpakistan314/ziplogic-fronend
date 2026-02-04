import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { paymentsAPI } from '../services/api'
import { Check, Zap, Rocket, Building } from 'lucide-react'
import { ButtonLoading } from '../components/Loading'
import toast from 'react-hot-toast'

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with basic features',
    features: [
      '3 projects per month',
      'Basic code generation',
      'Download as ZIP',
      'Community support'
    ],
    icon: Zap,
    popular: false,
    plan: 'free'
  },
  {
    name: 'Builder',
    price: 149,
    period: '/month',
    description: 'For individuals building side projects',
    features: [
      '10 projects per month',
      'Priority code generation',
      'All frameworks supported',
      'Project memory',
      'Email support'
    ],
    icon: Rocket,
    popular: true,
    plan: 'builder'
  },
  {
    name: 'Pro',
    price: 299,
    period: '/month',
    description: 'For professionals and small teams',
    features: [
      '50 projects per month',
      'Fastest generation',
      'Advanced customization',
      'Full project history',
      'Priority support',
      'API access'
    ],
    icon: Building,
    popular: false,
    plan: 'pro'
  },
  {
    name: 'Agency',
    price: 599,
    period: '/month',
    description: 'For agencies and growing teams',
    features: [
      '200 projects per month',
      'Team collaboration',
      'White-label exports',
      'Custom templates',
      'Dedicated support',
      'Advanced analytics'
    ],
    icon: Building,
    popular: false,
    plan: 'agency'
  }
]

export default function Pricing() {
  const { isAuthenticated, user } = useAuthStore()
  const [loading, setLoading] = useState(null)
  const navigate = useNavigate()
  
  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) {
      navigate('/register')
      return
    }
    
    if (plan === 'free') {
      toast.success('You are already on the Free plan!')
      return
    }
    
    if (user?.subscription_plan === plan) {
      toast.success(`You are already on the ${plan} plan!`)
      return
    }
    
    setLoading(plan)
    
    try {
      const response = await paymentsAPI.createCheckout({ plan })
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url
      } else {
        toast.error('Failed to create checkout')
      }
    } catch (error) {
      toast.error('Failed to start checkout')
    } finally {
      setLoading(null)
    }
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Simple, Transparent <span className="gradient-text">Pricing</span>
        </h1>
        <p className="text-dark-400 text-lg max-w-2xl mx-auto">
          Start free, upgrade when you need more. No hidden fees.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const isCurrent = user?.subscription_plan === plan.plan
          
          return (
            <div 
              key={plan.name}
              className={`card p-8 relative ${
                plan.popular ? 'border-primary-500 ring-2 ring-primary-500/20' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${plan.popular ? 'bg-primary-500/20' : 'bg-dark-700'}`}>
                  <Icon className={`w-6 h-6 ${plan.popular ? 'text-primary-400' : 'text-dark-300'}`} />
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>
              
              <div className="mb-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-dark-400">{plan.period}</span>
              </div>
              
              <p className="text-dark-400 mb-6">{plan.description}</p>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleSelectPlan(plan.plan)}
                disabled={loading === plan.plan || isCurrent}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  isCurrent
                    ? 'bg-green-500/20 text-green-400 cursor-default'
                    : plan.popular
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {loading === plan.plan ? (
                  <ButtonLoading />
                ) : isCurrent ? (
                  'Current Plan'
                ) : plan.price === 0 ? (
                  'Get Started'
                ) : (
                  'Upgrade Now'
                )}
              </button>
            </div>
          )
        })}
      </div>
      
      <div className="text-center mt-12 text-dark-400">
        <p>All plans include unlimited downloads and project exports.</p>
        <p className="mt-2">Questions? <a href="mailto:support@ziplogic.ai" className="text-primary-500 hover:text-primary-400">Contact us</a></p>
      </div>
    </div>
  )
}
