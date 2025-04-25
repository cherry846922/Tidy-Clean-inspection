import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import {
  loadStripe,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import type { Inspection } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

// Make sure to call loadStripe outside of a component's render to avoid recreating the Stripe object on every render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm({ inspection, clientSecret }: { inspection: Inspection, clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'Payment Failed',
          description: error.message || 'An error occurred during payment processing',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully',
        });
        
        // Refresh inspections data
        await queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/inspections/upcoming'] });
        
        // Navigate back to the inspections page
        navigate('/inspections');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred during payment processing',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inspectionDate = new Date(inspection.date);
  const formattedTime = inspectionDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Complete Payment</CardTitle>
          <CardDescription>
            Payment for inspection at {inspection.property.name}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Property:</span>
              <span className="text-sm font-medium">{inspection.property.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Address:</span>
              <span className="text-sm font-medium">{inspection.property.address}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Date:</span>
              <span className="text-sm font-medium">{formatDate(inspectionDate)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Time:</span>
              <span className="text-sm font-medium">{formattedTime}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Cleaner:</span>
              <span className="text-sm font-medium">{inspection.cleaner.name}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-sm font-medium text-gray-900">Total Amount:</span>
              <span className="text-sm font-bold text-[#FF5A5F]">${inspection.price.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Payment Details</h3>
            <PaymentElement />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-[#FF5A5F] hover:bg-[#FF5A5F]/90 text-white"
            disabled={isLoading || !stripe || !elements}
          >
            {isLoading ? 'Processing...' : `Pay $${inspection.price.toFixed(2)}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default function Checkout() {
  const [, params] = useRoute<{ id: string }>('/checkout/:id');
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!params?.id) {
      toast({
        title: 'Invalid Inspection',
        description: 'Could not find the requested inspection',
        variant: 'destructive',
      });
      navigate('/inspections');
      return;
    }
    
    const inspectionId = parseInt(params.id);
    
    const fetchInspection = async () => {
      try {
        // Get inspection details
        const inspectionRes = await apiRequest('GET', `/api/inspections/${inspectionId}`);
        const inspectionData = await inspectionRes.json();
        
        if (!inspectionData) {
          toast({
            title: 'Inspection Not Found',
            description: 'The requested inspection could not be found',
            variant: 'destructive',
          });
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
        
        // Create payment intent
        const paymentRes = await apiRequest('POST', '/api/create-payment-intent', {
          inspectionId: inspectionData.id,
          amount: inspectionData.price,
        });
        const paymentData = await paymentRes.json();
        
        if (paymentData?.clientSecret) {
          setClientSecret(paymentData.clientSecret);
        } else {
          throw new Error('Failed to create payment intent');
        }
      } catch (error) {
        console.error('Error setting up payment:', error);
        toast({
          title: 'Payment Setup Error',
          description: 'There was a problem setting up the payment',
          variant: 'destructive',
        });
        navigate('/inspections');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInspection();
  }, [params?.id, toast, navigate]);
  
  if (loading || !inspection) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-[#FF5A5F] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!clientSecret) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Setup Error</h2>
        <p className="text-gray-600 mb-4">
          Unable to set up the payment process. This may be because the inspection has already been paid for or there is a system error.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }
  
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#FF5A5F',
      },
    },
  };
  
  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#484848] mb-6">Checkout</h1>
      
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm inspection={inspection} clientSecret={clientSecret} />
      </Elements>
    </div>
  );
}