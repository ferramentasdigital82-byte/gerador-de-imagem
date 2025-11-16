
import React, { useState, useCallback } from 'react';

const CheckIcon: React.FC = () => (
    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
);

const XIcon: React.FC = () => (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
);

interface PlanFeature {
    text: string;
    included: boolean;
}

interface Plan {
    name: string;
    price: string;
    color: 'gray' | 'green' | 'blue' | 'purple';
    cta: string;
    description: string;
    highlight?: boolean;
    features: PlanFeature[];
}

const plans: Plan[] = [
    {
        name: 'Free',
        price: 'R$0',
        color: 'gray',
        cta: 'Choose Plan',
        description: 'For trying out DreamCanvas.',
        features: [
            { text: '15 images/month', included: true },
            { text: 'Standard resolution', included: true },
            { text: 'Limited styles', included: true },
            { text: 'Includes light watermark', included: true },
            { text: 'Background removal', included: false },
            { text: '4K upscale', included: false },
            { text: 'API Access', included: false },
        ],
    },
    {
        name: 'Starter',
        price: 'R$29',
        color: 'green',
        cta: 'Choose Plan',
        description: 'For hobbyists and personal projects.',
        features: [
            { text: '200 images/month', included: true },
            { text: 'HD resolution', included: true },
            { text: 'All styles unlocked', included: true },
            { text: 'No watermark', included: true },
            { text: 'Background removal (30/month)', included: true },
            { text: '2K upscale', included: true },
            { text: 'Basic support', included: true },
            { text: 'API Access', included: false },
        ],
    },
    {
        name: 'Pro',
        price: 'R$59',
        color: 'blue',
        cta: 'Choose Plan',
        highlight: true,
        description: 'For professionals and frequent creators.',
        features: [
            { text: '1000 images/month', included: true },
            { text: '4K resolution', included: true },
            { text: 'Unlimited 4K upscale', included: true },
            { text: 'Unlimited background removal', included: true },
            { text: 'Priority generation queue', included: true },
            { text: 'Exclusive advanced styles', included: true },
            { text: 'AI for variations & improvements', included: true },
            { text: 'API Access', included: false },
        ],
    },
    {
        name: 'Ultimate',
        price: 'R$99',
        color: 'purple',
        cta: 'Choose Plan',
        description: 'For power users and businesses.',
        features: [
            { text: 'Unlimited images', included: true },
            { text: 'Unlimited 4K resolution', included: true },
            { text: 'AI logo creation', included: true },
            { text: 'Advanced editor', included: true },
            { text: 'Early access to new features', included: true },
            { text: 'API Access', included: true },
            { text: 'Instant generation (no queue)', included: true },
        ],
    },
];

interface PaymentModalProps {
  plan: Plan;
  onClose: () => void;
  onPaymentSuccess: (planName: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose, onPaymentSuccess }) => {
    const [activeTab, setActiveTab] = useState<'card' | 'pix'>('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(onClose, 300); // allow for closing animation
    }, [onClose]);

    const handlePayment = (e: React.FormEvent) => {
      e.preventDefault();
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        setTimeout(() => {
          onPaymentSuccess(plan.name);
        }, 2000); // Keep success message for 2s
      }, 1500); // Simulate processing for 1.5s
    };
    
    if (isSuccess) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-700 text-center p-8 transform transition-all duration-300 scale-100 opacity-100">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mt-4">Payment Successful!</h3>
                    <p className="text-gray-400 mt-2">Your <span className="font-semibold text-white">{plan.name}</span> plan is now active. Happy creating!</p>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={handleClose}>
            <div
                className={`bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-700 transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Complete your purchase</h2>
                        <p className="text-sm text-gray-400">You are subscribing to the <span className="font-semibold text-white">{plan.name}</span> plan.</p>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>

                <div className="p-2 bg-gray-900 flex space-x-2">
                    <button onClick={() => setActiveTab('card')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'card' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Credit Card</button>
                    <button onClick={() => setActiveTab('pix')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'pix' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>PIX</button>
                </div>

                <form onSubmit={handlePayment} className="p-6">
                    {activeTab === 'card' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-300">Card Number</label>
                                <input type="text" placeholder="**** **** **** 1234" className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label className="text-sm text-gray-300">Expiry Date</label>
                                    <input type="text" placeholder="MM / YY" className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm text-gray-300">CVC</label>
                                    <input type="text" placeholder="123" className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pix' && (
                        <div className="text-center">
                            <div className="bg-white p-2 inline-block rounded-lg border-4 border-gray-600">
                                 <svg className="w-40 h-40" viewBox="0 0 256 256"><path fill="#000" d="M114 51h28v28h-28z M86 23h28v28H86z M58 23h28v28H58z M23 51h28v28H23z M171 23h28v28h-28z M204 23h28v28h-28z M23 86h28v28H23z M86 86h28v28H86z m85 0h28v28h-28z M204 86h28v28h-28z M23 142h28v28H23z M51 171h28v28H51z M86 204h28v28H86z M142 171h28v28h-28z m0-57h28v28h-28z M171 142h28v28h-28z"/></svg>
                            </div>
                            <p className="text-gray-300 mt-4 text-sm">Scan the QR Code with your banking app.</p>
                            <div className="mt-4 p-3 bg-gray-900 rounded-lg flex justify-between items-center border border-gray-700">
                                <span className="text-sm text-gray-400 font-mono truncate">000201265802BR5913...</span>
                                <button type="button" onClick={() => navigator.clipboard.writeText('000201265802BR5913...')} className="text-sm text-blue-400 font-semibold ml-4 hover:text-blue-300 transition-colors">COPY</button>
                            </div>
                        </div>
                    )}
                    
                    <button type="submit" disabled={isProcessing} className="w-full mt-6 px-6 py-3 font-semibold text-white rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex justify-center items-center">
                        {isProcessing ? (
                           <>
                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             Processing...
                           </>
                        ) : `Pay ${plan.price}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

interface PricingCardProps {
    plan: Plan;
    isSelected: boolean;
    onSelect: (plan: Plan) => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, isSelected, onSelect }) => {
    const colors = {
        gray: { ring: 'ring-gray-500', bg: 'bg-gray-600', hoverBg: 'hover:bg-gray-700', text: 'text-gray-400' },
        green: { ring: 'ring-green-500', bg: 'bg-green-600', hoverBg: 'hover:bg-green-700', text: 'text-green-400' },
        blue: { ring: 'ring-blue-500', bg: 'bg-blue-600', hoverBg: 'hover:bg-blue-700', text: 'text-blue-400' },
        purple: { ring: 'ring-purple-500', bg: 'bg-purple-600', hoverBg: 'hover:bg-purple-700', text: 'text-purple-400' },
    }
    const colorScheme = colors[plan.color];

    return (
        <div className={`relative flex flex-col p-6 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg transition-all duration-300 ${isSelected ? 'ring-2 ' + colorScheme.ring : ''}`}>
            {plan.highlight && (
                <div className="absolute top-0 -translate-y-1/2 px-3 py-1 text-sm font-semibold tracking-wide text-white bg-blue-600 rounded-full shadow-md">Most Popular</div>
            )}
            <h3 className={`text-2xl font-bold ${colorScheme.text}`}>{plan.name}</h3>
            <div className="flex items-baseline mt-4">
                <span className="text-4xl font-extrabold tracking-tight text-white">{plan.price}</span>
                <span className="ml-1 text-xl font-semibold text-gray-400">/month</span>
            </div>
            <p className="mt-5 text-base text-gray-400">{plan.description}</p>
            <ul role="list" className="flex-grow mt-6 space-y-4">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex space-x-3">
                        {feature.included ? <CheckIcon /> : <XIcon />}
                        <span className="text-gray-300">{feature.text}</span>
                    </li>
                ))}
            </ul>
            <button
                type="button"
                onClick={() => onSelect(plan)}
                disabled={isSelected}
                className={`w-full mt-8 px-6 py-3 font-semibold text-white rounded-lg transition-colors duration-300 ${isSelected ? 'bg-gray-500 cursor-not-allowed' : `${colorScheme.bg} ${colorScheme.hoverBg}`}`}
            >
                {isSelected ? 'Current Plan' : plan.cta}
            </button>
        </div>
    );
};

const PricingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('Pro');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planToPurchase, setPlanToPurchase] = useState<Plan | null>(null);

  const handleChoosePlan = useCallback((plan: Plan) => {
    if (plan.name !== selectedPlan) {
      setPlanToPurchase(plan);
      setIsModalOpen(true);
    }
  }, [selectedPlan]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setPlanToPurchase(null), 300); // Allow animation to finish
  }, []);

  const handlePaymentSuccess = useCallback((planName: string) => {
    setSelectedPlan(planName);
    handleCloseModal();
  }, [handleCloseModal]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Find the right plan for you
        </h2>
        <p className="mt-4 text-lg text-gray-400">
          Start for free, then upgrade to a plan that fits your creative needs.
        </p>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <PricingCard
            key={plan.name}
            plan={plan}
            isSelected={selectedPlan === plan.name}
            onSelect={handleChoosePlan}
          />
        ))}
      </div>
      {isModalOpen && planToPurchase && (
        <PaymentModal
          plan={planToPurchase}
          onClose={handleCloseModal}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default PricingPage;
