import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Addon } from "@shared/schema";

interface AddOnCardProps {
  addon: Addon;
  quantity: number;
  onQuantityChange: (addonId: number, quantity: number) => void;
  onSelectionChange: (addonId: number, selected: boolean) => void;
  isSelected: boolean;
}

export default function AddOnCard({ 
  addon, 
  quantity, 
  onQuantityChange, 
  onSelectionChange,
  isSelected 
}: AddOnCardProps) {
  const [localQuantity, setLocalQuantity] = useState(quantity || 1);
  
  const handleIncrement = () => {
    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    onQuantityChange(addon.id, newQuantity);
  };
  
  const handleDecrement = () => {
    if (localQuantity > 1) {
      const newQuantity = localQuantity - 1;
      setLocalQuantity(newQuantity);
      onQuantityChange(addon.id, newQuantity);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setLocalQuantity(value);
    onQuantityChange(addon.id, value);
  };
  
  return (
    <Card className="border">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Checkbox 
            id={`addon-${addon.id}`}
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange(addon.id, !!checked)}
          />
          <div className="space-y-1">
            <Label htmlFor={`addon-${addon.id}`} className="font-medium">
              {addon.name}
            </Label>
            <p className="text-sm text-gray-500">{addon.description}</p>
            <p className="text-sm font-medium">${parseFloat(addon.price).toFixed(2)} each</p>
          </div>
        </div>
        
        {isSelected && (
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="outline"
              disabled={localQuantity <= 1}
              onClick={handleDecrement}
            >
              -
            </Button>
            <Input 
              type="number" 
              min="1"
              value={localQuantity} 
              onChange={handleInputChange}
              className="w-16 text-center"
            />
            <Button 
              size="icon" 
              variant="outline"
              onClick={handleIncrement}
            >
              +
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}