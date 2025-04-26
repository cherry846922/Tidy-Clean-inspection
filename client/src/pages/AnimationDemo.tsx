import React, { useState } from "react";
import { 
  AnimatedButton, 
  AnimatedCard, 
  AnimatedList,
  AnimatedNotification,
  FeedbackIndicator,
  LoadingAnimation,
  ShakeError,
  SuccessCheckmark,
  useAnimation
} from "@/components/animation";
import { Button } from "@/components/ui/button";

export default function AnimationDemo() {
  const { preference, toggleAnimation } = useAnimation();
  
  const [showNotification, setShowNotification] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Demo data for animated list
  const demoItems = [
    { id: 1, name: "Ocean View Villa", status: "Available" },
    { id: 2, name: "Mountain Retreat", status: "Booked" },
    { id: 3, name: "Downtown Loft", status: "Available" },
    { id: 4, name: "Lakeside Cabin", status: "Maintenance" },
    { id: 5, name: "Garden Cottage", status: "Available" },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Animation Demo</h1>
      
      <section className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Animation Settings</h2>
        <div className="space-y-4">
          <p>
            Current animation preference: <span className="font-medium">{preference}</span>
          </p>
          <Button onClick={toggleAnimation}>
            {preference === 'full' 
              ? 'Switch to Reduced Animations' 
              : preference === 'reduced' 
              ? 'Disable Animations' 
              : 'Enable Full Animations'}
          </Button>
        </div>
      </section>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Animated Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <AnimatedButton>Default Button</AnimatedButton>
            <AnimatedButton variant="secondary">Secondary</AnimatedButton>
            <AnimatedButton variant="destructive">Destructive</AnimatedButton>
            <AnimatedButton variant="outline">Outline</AnimatedButton>
          </div>
        </section>
        
        <section className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Animated Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatedCard
              header={<h3 className="font-medium">Default Card</h3>}
              footer={<p className="text-sm text-gray-500">Card footer</p>}
            >
              <p>Content of the card with no hover effects.</p>
            </AnimatedCard>
            
            <AnimatedCard
              variant="hover"
              header={<h3 className="font-medium">Hover Card</h3>}
              footer={<p className="text-sm text-gray-500">Try hovering</p>}
            >
              <p>This card has hover animation enabled.</p>
            </AnimatedCard>
            
            <AnimatedCard
              variant="interactive"
              header={<h3 className="font-medium">Interactive Card</h3>}
              footer={<p className="text-sm text-gray-500">Try clicking</p>}
            >
              <p>This card has hover and click animations.</p>
            </AnimatedCard>
          </div>
        </section>
        
        <section className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Feedback Animations</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => setShowFeedback(!showFeedback)}>
                Toggle Feedback
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  setShowError(true);
                  setTimeout(() => setShowError(false), 1000);
                }}
              >
                Show Error Shake
              </Button>
              <Button 
                variant="default" 
                onClick={() => {
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 1500);
                }}
              >
                Show Success Checkmark
              </Button>
            </div>
            
            {showFeedback && (
              <div className="space-y-2">
                <FeedbackIndicator 
                  type="success" 
                  message="Operation completed successfully!"
                />
                <FeedbackIndicator 
                  type="error" 
                  message="Something went wrong. Please try again."
                />
                <FeedbackIndicator 
                  type="warning" 
                  message="This action cannot be undone."
                />
                <FeedbackIndicator 
                  type="info" 
                  message="The system will be under maintenance tomorrow."
                />
              </div>
            )}
            
            <ShakeError error={showError}>
              <div className="border border-red-300 rounded p-4 bg-red-50">
                <p>Invalid input! Please check your data.</p>
              </div>
            </ShakeError>
            
            <SuccessCheckmark 
              show={showSuccess} 
              onComplete={() => console.log('Success animation completed')}
            />
          </div>
        </section>
        
        <section className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Loading Animations</h2>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <LoadingAnimation size="sm" text="Small" />
              <LoadingAnimation size="md" text="Medium" />
              <LoadingAnimation size="lg" text="Large" />
            </div>
          </div>
        </section>
        
        <section className="border rounded-lg p-6 bg-white shadow-sm md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Animated List</h2>
          
          <div className="space-y-4">
            <Button 
              onClick={() => setShowNotification(true)}
              className="mb-4"
            >
              Show Notification
            </Button>
            
            <AnimatedList
              items={demoItems}
              className="space-y-3"
              renderItem={(item) => (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">Status: {item.status}</p>
                </div>
              )}
            />
          </div>
        </section>
      </div>
      
      <AnimatedNotification
        show={showNotification}
        onClose={() => setShowNotification(false)}
        title="New Message"
        message="You have received a new message from the property owner."
        type="info"
        action={{
          label: "View Message",
          onClick: () => {
            console.log("View message clicked");
            setShowNotification(false);
          },
        }}
      />
    </div>
  );
}