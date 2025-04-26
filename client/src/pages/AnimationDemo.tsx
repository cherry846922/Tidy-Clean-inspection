import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShakeError, 
  SuccessCheckmark, 
  FeedbackIndicator, 
  FlashUpdate 
} from '@/components/animation/feedback-animations';
import { AnimatedButton } from '@/components/animation/animated-button';
import { AnimatedCard } from '@/components/animation/animated-card';
import { AnimatedList } from '@/components/animation/animated-list';
import { PageWrapper as PageTransition } from '@/components/animation/PageWrapper';
import { Input } from '@/components/ui/input';
import { useState as useAnimationState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAnimation } from '@/contexts/animation-context';

export default function AnimationDemo() {
  const [isShaking, setIsShaking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [isFlashing, setIsFlashing] = useState(false);
  const { isAnimationEnabled } = useAnimation();

  // Demo items for the list
  const items = [
    { id: 1, title: 'Item 1', description: 'This is the first item' },
    { id: 2, title: 'Item 2', description: 'This is the second item' },
    { id: 3, title: 'Item 3', description: 'This is the third item' },
  ];

  return (
    <PageTransition>
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Animation Demo</h1>
          <p className="text-gray-500 mb-6">
            This page showcases all available animations in the application
            {!isAnimationEnabled && (
              <span className="text-red-500 ml-2">
                (Animations are currently disabled in your preferences)
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Button Animations */}
          <Card>
            <CardHeader>
              <CardTitle>Button Animations</CardTitle>
              <CardDescription>
                Animated buttons with hover and click effects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <AnimatedButton variant="default">Default Button</AnimatedButton>
                <AnimatedButton variant="destructive">Destructive</AnimatedButton>
                <AnimatedButton variant="outline">Outline</AnimatedButton>
                <AnimatedButton variant="ghost">Ghost</AnimatedButton>
                <AnimatedButton variant="link">Link</AnimatedButton>
              </div>
              <div>
                <AnimatedButton className="bg-gradient-to-r from-pink-500 to-purple-500 text-white w-full">
                  Gradient Button
                </AnimatedButton>
              </div>
            </CardContent>
          </Card>

          {/* Card Animations */}
          <Card>
            <CardHeader>
              <CardTitle>Card Animations</CardTitle>
              <CardDescription>
                Cards with entrance and hover animations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatedCard
                variant="hover"
                header={<CardTitle className="text-lg">Hover Card</CardTitle>}
                className="border border-gray-200"
              >
                <p>This card has hover animations.</p>
                <p className="text-sm text-gray-500 mt-2">Try hovering over it!</p>
              </AnimatedCard>

              <AnimatedCard
                variant="interactive"
                header={<CardTitle className="text-lg">Interactive Card</CardTitle>}
                className="border border-gray-200"
              >
                <p>This card has hover and click animations.</p>
                <p className="text-sm text-gray-500 mt-2">Try clicking it!</p>
              </AnimatedCard>
            </CardContent>
          </Card>

          {/* Feedback Animations */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback Animations</CardTitle>
              <CardDescription>
                Animations for providing feedback to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => setIsShaking(true)} 
                    variant="outline"
                    className="bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    Show Error Shake
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 2000);
                    }} 
                    variant="outline"
                    className="bg-green-50 text-green-600 hover:bg-green-100"
                  >
                    Show Success Checkmark
                  </Button>
                  <Button 
                    onClick={() => {
                      setFeedbackType('success');
                      setShowFeedback(true);
                    }} 
                    variant="outline"
                    className="bg-green-50 text-green-600 hover:bg-green-100"
                  >
                    Toggle Feedback
                  </Button>
                </div>

                <ShakeError 
                  shake={isShaking} 
                  onAnimationComplete={() => setIsShaking(false)}
                >
                  <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
                    Invalid input! Please check your data.
                  </div>
                </ShakeError>

                <div className="flex items-center space-x-2">
                  <SuccessCheckmark 
                    show={showSuccess} 
                    size="md"
                  />
                  {showSuccess && <span className="text-green-600">Operation successful!</span>}
                </div>

                <FeedbackIndicator
                  visible={showFeedback}
                  type={feedbackType}
                  message="This is a feedback message that will automatically dismiss after a few seconds."
                  duration={3000}
                  onClose={() => setShowFeedback(false)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Loading Animations */}
          <Card>
            <CardHeader>
              <CardTitle>Loading Animations</CardTitle>
              <CardDescription>
                Different ways to show loading states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span>Small</span>
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Medium</span>
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Large</span>
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
                <div className="pt-4">
                  <Button disabled className="w-full">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Animated List */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Animated List</CardTitle>
              <CardDescription>
                Items that animate in with a staggered effect
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatedList
                items={items}
                renderItem={(item) => (
                  <div key={item.id} className="p-4 border rounded-md mb-2 bg-white">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-gray-500">{item.description}</p>
                  </div>
                )}
                emptyState={<div>No items to display</div>}
              />
              <div className="mt-4">
                <Button
                  onClick={() => {
                    setIsFlashing(true);
                    setTimeout(() => setIsFlashing(false), 1000);
                  }}
                >
                  Show Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}