import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PropertySelect from "@/components/PropertySelect";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ChevronDown, Download, BarChart2, PieChart, LineChart, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, PieChart as RePieChart, Pie, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Sample data for demonstration
const inspectionData = [
  { month: 'Jan', completed: 12, scheduled: 15 },
  { month: 'Feb', completed: 15, scheduled: 18 },
  { month: 'Mar', completed: 18, scheduled: 20 },
  { month: 'Apr', completed: 22, scheduled: 22 },
  { month: 'May', completed: 19, scheduled: 25 },
  { month: 'Jun', completed: 23, scheduled: 28 },
];

const statusData = [
  { name: 'Completed', value: 145, color: '#4CAF50' },
  { name: 'Scheduled', value: 75, color: '#2196F3' },
  { name: 'Cancelled', value: 25, color: '#F44336' },
];

const propertyData = [
  { name: 'Beachside Villa', inspections: 36, score: 87 },
  { name: 'Downtown Loft', inspections: 28, score: 92 },
  { name: 'Mountain Cabin', inspections: 22, score: 78 },
  { name: 'Lakefront Cottage', inspections: 19, score: 84 },
];

// DatePickerWithRange component
function DatePickerWithRange({ 
  date, 
  setDate, 
  className 
}: { 
  date: DateRange | undefined, 
  setDate: (date: DateRange | undefined) => void,
  className?: string 
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function Reports() {
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date(),
  });
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [reportType, setReportType] = useState<string>("inspections");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [checklist, setChecklist] = useState<Array<{id: string, text: string, checked: boolean}>>([
    { id: "1", text: "Inspect bathroom cleanliness", checked: false },
    { id: "2", text: "Check kitchen appliances", checked: false },
    { id: "3", text: "Verify smoke detector functionality", checked: false },
  ]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Convert files to array and process each
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImages(prev => [...prev, e.target!.result as string]);
          toast({
            title: "Image uploaded",
            description: `${file.name} has been added to your report.`,
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Remove image from preview
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Toggle checklist item
  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };
  
  // Add new checklist item
  const addChecklistItem = (text: string) => {
    const newItem = { 
      id: Date.now().toString(), 
      text, 
      checked: false 
    };
    setChecklist(prev => [...prev, newItem]);
  };
  
  // Remove checklist item
  const removeChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };
  
  // Format date for display
  const dateDisplay = date?.from && date?.to
    ? `${format(date.from, "MMM d, yyyy")} - ${format(date.to, "MMM d, yyyy")}`
    : "Select date range";

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#484848]">Reports</h1>
          <p className="text-[#767676] mt-1">View and export performance reports</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Report Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspections">Inspection Activity</SelectItem>
                  <SelectItem value="property">Property Performance</SelectItem>
                  <SelectItem value="financial">Financial Summary</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Property</CardTitle>
            </CardHeader>
            <CardContent>
              <PropertySelect 
                value={propertyFilter}
                onChange={setPropertyFilter}
                includeAll={true}
                placeholder="All Properties"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Date Range</CardTitle>
            </CardHeader>
            <CardContent>
              <DatePickerWithRange date={date} setDate={setDate} />
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {reportType === "inspections" ? "Inspection Activity" : 
             reportType === "property" ? "Property Performance" : 
             "Financial Summary"}
          </h2>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="bg-[#FF5A5F] hover:bg-[#FF5A5F]/90 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Custom Report
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-[#FF5A5F]">Create Custom Report</DialogTitle>
                  <DialogDescription>
                    Define parameters for your custom report
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input id="report-name" placeholder="Q2 Financial Analysis" className="mt-1" />
                  </div>
                  
                  <div>
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select defaultValue="inspections">
                      <SelectTrigger id="report-type" className="mt-1">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inspections">Inspection Activity</SelectItem>
                        <SelectItem value="property">Property Performance</SelectItem>
                        <SelectItem value="financial">Financial Summary</SelectItem>
                        <SelectItem value="custom">Custom Metrics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="report-property">Property</Label>
                    <PropertySelect 
                      value="all"
                      onChange={() => {}}
                      includeAll={true}
                      placeholder="All Properties"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date-range">Date Range</Label>
                    <DatePickerWithRange 
                      date={date} 
                      setDate={setDate} 
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="report-format">Output Format</Label>
                    <Select defaultValue="pdf">
                      <SelectTrigger id="report-format" className="mt-1">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                        <SelectItem value="json">JSON Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Add Images</Label>
                    <div className="mt-1 border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition">
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                        id="image-upload" 
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="image-upload" className="cursor-pointer w-full h-full block">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="text-gray-400 rounded-full p-2 bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-500">
                            Drag & drop images here, or click to browse
                          </p>
                          <p className="text-xs text-gray-400">
                            Upload property photos, inspection evidence, or report illustrations
                          </p>
                        </div>
                      </label>
                    </div>
                    
                    {/* Image preview area */}
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {uploadedImages.length > 0 ? (
                        uploadedImages.map((image, index) => (
                          <div key={index} className="w-16 h-16 relative rounded-md overflow-hidden border">
                            <img 
                              src={image} 
                              alt={`Uploaded image ${index + 1}`} 
                              className="w-full h-full object-cover" 
                            />
                            <button 
                              type="button"
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              onClick={() => removeImage(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="w-full py-2 text-center text-sm text-gray-500">
                          No images added yet
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Inspection Checklist</Label>
                    <div className="mt-2 border rounded-md p-4">
                      <div className="space-y-2">
                        {checklist.map(item => (
                          <div key={item.id} className="flex items-center gap-2">
                            <input 
                              type="checkbox"
                              id={`checklist-${item.id}`}
                              checked={item.checked}
                              onChange={() => toggleChecklistItem(item.id)}
                              className="h-4 w-4 rounded border-gray-300 text-[#FF5A5F] focus:ring-[#FF5A5F]"
                            />
                            <label 
                              htmlFor={`checklist-${item.id}`}
                              className="flex-grow text-sm text-gray-700"
                            >
                              {item.text}
                            </label>
                            <button
                              type="button"
                              onClick={() => removeChecklistItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        <Input 
                          id="new-checklist-item"
                          placeholder="Add new checklist item..."
                          className="text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              addChecklistItem(e.currentTarget.value.trim());
                              e.currentTarget.value = '';
                              e.preventDefault();
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById('new-checklist-item') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              addChecklistItem(input.value.trim());
                              input.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Click items to mark them as completed</span>
                          <span>{checklist.filter(item => item.checked).length}/{checklist.length} completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="report-notes">Notes</Label>
                    <Textarea 
                      id="report-notes"
                      placeholder="Add detailed notes about this report..."
                      className="mt-1 min-h-[100px]"
                      value={notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add important observations, conclusions, or action items here
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="report-schedule">Schedule (Optional)</Label>
                    <Select defaultValue="none">
                      <SelectTrigger id="report-schedule" className="mt-1">
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Run Once</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-[#FF5A5F] hover:bg-[#FF5A5F]/90 text-white"
                    onClick={() => {
                      toast({
                        title: "Report created",
                        description: "Your custom report has been created successfully.",
                      });
                    }}
                  >
                    Create Report
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="chart" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Chart View
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Table View
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Summary
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle>
                  {reportType === "inspections" ? "Monthly Inspection Activity" : 
                   reportType === "property" ? "Property Performance" : 
                   "Monthly Revenue"}
                </CardTitle>
                <CardDescription>
                  {dateDisplay} • {propertyFilter === "all" ? "All Properties" : `Property: ${propertyFilter}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {reportType === "inspections" ? (
                      <BarChart data={inspectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" fill="#4CAF50" name="Completed" />
                        <Bar dataKey="scheduled" fill="#2196F3" name="Scheduled" />
                      </BarChart>
                    ) : reportType === "property" ? (
                      <BarChart data={propertyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="inspections" fill="#2196F3" name="Inspections" />
                        <Bar dataKey="score" fill="#FF5A5F" name="Health Score" />
                      </BarChart>
                    ) : (
                      <BarChart data={inspectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" fill="#4CAF50" name="Revenue ($)" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>
                  {reportType === "inspections" ? "Inspection Details" : 
                   reportType === "property" ? "Property Details" : 
                   "Financial Details"}
                </CardTitle>
                <CardDescription>
                  {dateDisplay} • {propertyFilter === "all" ? "All Properties" : `Property: ${propertyFilter}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {reportType === "inspections" ? (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                          </>
                        ) : reportType === "property" ? (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspections</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </>
                        ) : (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Add-on Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportType === "inspections" ? (
                        inspectionData.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.month}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.scheduled}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.completed}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {Math.round((item.completed / item.scheduled) * 100)}%
                            </td>
                          </tr>
                        ))
                      ) : reportType === "property" ? (
                        propertyData.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.inspections}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.score}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.score >= 85 ? 'bg-green-100 text-green-800' : 
                                item.score >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {item.score >= 85 ? 'Excellent' : 
                                 item.score >= 70 ? 'Good' : 
                                 'Needs Attention'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        inspectionData.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.month}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.completed * 75}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.completed * 25}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              ${item.completed * 100}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>
                  {reportType === "inspections" ? "Inspection Summary" : 
                   reportType === "property" ? "Property Summary" : 
                   "Financial Summary"}
                </CardTitle>
                <CardDescription>
                  {dateDisplay} • {propertyFilter === "all" ? "All Properties" : `Property: ${propertyFilter}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {reportType === "inspections" ? (
                        <>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Total Inspections</p>
                            <p className="text-2xl font-bold">245</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Completion Rate</p>
                            <p className="text-2xl font-bold">87%</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Avg Duration</p>
                            <p className="text-2xl font-bold">45 min</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Issues Found</p>
                            <p className="text-2xl font-bold">68</p>
                          </div>
                        </>
                      ) : reportType === "property" ? (
                        <>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Total Properties</p>
                            <p className="text-2xl font-bold">12</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Avg Health Score</p>
                            <p className="text-2xl font-bold">85</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Top Property</p>
                            <p className="text-2xl font-bold">Downtown Loft</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Needs Attention</p>
                            <p className="text-2xl font-bold">2</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold">$24,500</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Base Revenue</p>
                            <p className="text-2xl font-bold">$18,375</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Add-on Revenue</p>
                            <p className="text-2xl font-bold">$6,125</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Avg Per Inspection</p>
                            <p className="text-2xl font-bold">$100</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}