import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  LineChart, 
  ResponsiveContainer, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Home, 
  Calendar,
  ClipboardList,
  CheckCircle,
  AlertCircle, 
  XCircle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  BarChartIcon,
  User,
  Info,
  PieChart as PieChartIcon
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Inspection } from "@shared/schema";
import { AnimatedWelcome } from "@/components/AnimatedWelcome";
import { HostJourneyTracker } from "@/components/HostJourneyTracker";
import { PageTransition } from "@/components/animation";

// Types for dashboard data
interface DashboardData {
  summary: {
    properties: number;
    totalInspections: number;
    completedInspections: number;
    scheduledInspections: number;
    cancelledInspections: number;
    completionRate: number;
    avgHealthScore: number | null;
  };
  upcomingInspections: Inspection[];
  monthlyData: {
    month: string;
    label: string;
    completed: number;
    scheduled: number;
  }[];
  propertyPerformance: {
    id: number;
    name: string;
    healthScore: number;
    completionRate: number;
    inspectionCount: number;
  }[];
}

interface HostJourneyData {
  name: string;
  profileCompletion: number;
  propertiesCount: number;
  inspectionsCompleted: number;
  daysActive: number;
  rank?: string;
  hasNotificationPreferences: boolean;
}

// Extended dashboard data type
interface DashboardDataWithJourney extends DashboardData {
  hostJourney?: HostJourneyData;
}

// Component for displaying a metric card
function MetricCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend = null,
  color = "text-blue-500"
}: { 
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: { value: number; label: string } | null;
  color?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`${color} p-2 rounded-md bg-opacity-10`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <div className="flex items-center mt-1">
            <span className={trend.value >= 0 ? "text-green-500" : "text-red-500"}>
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </span>
            <ArrowUpRight className={`h-4 w-4 ml-1 ${trend.value >= 0 ? "text-green-500" : "text-red-500"}`} />
            <span className="text-xs text-muted-foreground ml-1">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Component for displaying a property card
function PropertyPerformanceCard({ property }: { 
  property: { 
    id: number; 
    name: string; 
    healthScore: number; 
    completionRate: number;
    inspectionCount: number;
  } 
}) {
  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{property.name}</CardTitle>
          <Badge variant={property.inspectionCount > 0 ? "default" : "outline"}>
            {property.inspectionCount} {property.inspectionCount === 1 ? 'inspection' : 'inspections'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">Health Score</span>
              <span className="text-sm font-medium">{property.healthScore}%</span>
            </div>
            <Progress value={property.healthScore} className={`h-2 ${getHealthScoreColor(property.healthScore)}`} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <span className="text-sm font-medium">{property.completionRate}%</span>
            </div>
            <Progress value={property.completionRate} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Query dashboard data
  const { data, isLoading, error } = useQuery<DashboardDataWithJourney>({
    queryKey: ['/api/dashboard/host'],
    enabled: !!user,
  });
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // When component mounts, check if we should show the welcome message
  // In a real app, you might check localStorage or user preferences
  useEffect(() => {
    const lastShown = localStorage.getItem('welcomeLastShown');
    if (lastShown) {
      const daysSinceLastShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
      setShowWelcome(daysSinceLastShown > 1);
    }
  }, []);
  
  const handleDismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('welcomeLastShown', Date.now().toString());
  };
  
  // Format percentage for display
  const formatPercent = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value}%`;
  };
  
  // Skeleton loading for metrics
  const renderSkeletonMetrics = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  // Pie chart data for inspection status
  const getStatusData = () => {
    if (!data) return [];
    return [
      { name: 'Completed', value: data.summary.completedInspections, color: '#00C49F' },
      { name: 'Scheduled', value: data.summary.scheduledInspections, color: '#0088FE' },
      { name: 'Cancelled', value: data.summary.cancelledInspections, color: '#FF8042' }
    ].filter(item => item.value > 0); // Only include non-zero values
  };
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Error Loading Dashboard</h3>
          <p className="text-sm text-muted-foreground mt-2">There was a problem loading your dashboard data.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#484848]">
              {user?.role === 'host' ? 'Host Dashboard' : 'Inspector Dashboard'}
            </h1>
            <p className="text-[#767676] mt-1">
              {user?.role === 'host' 
                ? 'Track your property performance and inspection metrics' 
                : 'Manage inspections and view property statuses'}
            </p>
          </div>
          
          {/* Animated Welcome - only for host users */}
          {user?.role === 'host' && showWelcome && data?.hostJourney && (
            <AnimatedWelcome 
              userName={data.hostJourney.name} 
              onDismiss={handleDismissWelcome} 
              className="mb-6"
            />
          )}
          
          {/* Dashboard Content */}
          {user?.role === 'host' ? (
            // Host Layout with Journey Tracker
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Main Dashboard Content */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-1 lg:w-[200px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                  </TabsList>
                  
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    {isLoading ? (
                      renderSkeletonMetrics()
                    ) : data ? (
                      <>
                        {/* Metrics */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <MetricCard 
                            title="Total Properties"
                            value={data.summary.properties}
                            icon={<Home className="h-4 w-4" />}
                            color="text-purple-500"
                          />
                          <MetricCard 
                            title="Total Inspections"
                            value={data.summary.totalInspections}
                            icon={<ClipboardList className="h-4 w-4" />}
                            color="text-blue-500"
                          />
                          <MetricCard 
                            title="Completion Rate"
                            value={formatPercent(data.summary.completionRate)}
                            icon={<CheckCircle className="h-4 w-4" />}
                            color="text-green-500"
                          />
                          <MetricCard 
                            title="Avg. Health Score"
                            value={formatPercent(data.summary.avgHealthScore)}
                            icon={<TrendingUp className="h-4 w-4" />}
                            color="text-amber-500"
                          />
                        </div>
                        
                        {/* Charts */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Inspection Monthly Trends</CardTitle>
                              <CardDescription>Number of inspections over the last 6 months</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.monthlyData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="month" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="completed" name="Completed" fill="#00C49F" />
                                  <Bar dataKey="scheduled" name="Scheduled" fill="#0088FE" />
                                </BarChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Inspection Status</CardTitle>
                              <CardDescription>Distribution of inspection statuses</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                              <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                  <Pie
                                    data={getStatusData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {getStatusData().map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Upcoming Inspections */}
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <div>
                                <CardTitle className="text-lg">Upcoming Inspections</CardTitle>
                                <CardDescription>Scheduled for the next 7 days</CardDescription>
                              </div>
                              <Badge variant="outline" className="ml-2">
                                {data.upcomingInspections.length} upcoming
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {data.upcomingInspections.length > 0 ? (
                              <div className="space-y-4">
                                {data.upcomingInspections.map((inspection) => (
                                  <div key={inspection.id} className="flex justify-between items-start border-b border-gray-100 pb-3">
                                    <div>
                                      <h4 className="font-medium">{inspection.property.name}</h4>
                                      <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        <span>{formatDate(inspection.date)}</span>
                                      </div>
                                    </div>
                                    <Badge variant="outline">
                                      {inspection.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                <p>No upcoming inspections</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </>
                    ) : null}
                  </TabsContent>
                  


                </Tabs>
              </div>
              
              {/* Host Journey Tracker - only for host users */}
              <div className="lg:col-span-1 order-first lg:order-last">
                {isLoading ? (
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ) : data?.hostJourney ? (
                  <HostJourneyTracker hostData={data.hostJourney} />
                ) : null}
              </div>
            </div>
          ) : (
            // Inspector Layout - full width, no journey tracker
            <div className="mb-8">
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-1 md:grid-cols-1 lg:w-[200px]">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>
                
                {/* Content is the same as in host view but spans full width */}
                <TabsContent value="overview" className="space-y-6">
                  {isLoading ? (
                    renderSkeletonMetrics()
                  ) : data ? (
                    <>
                      {/* Metrics */}
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <MetricCard 
                          title="Total Properties"
                          value={data.summary.properties}
                          icon={<Home className="h-4 w-4" />}
                          color="text-purple-500"
                        />
                        <MetricCard 
                          title="Total Inspections"
                          value={data.summary.totalInspections}
                          icon={<ClipboardList className="h-4 w-4" />}
                          color="text-blue-500"
                        />
                        <MetricCard 
                          title="Completion Rate"
                          value={formatPercent(data.summary.completionRate)}
                          icon={<CheckCircle className="h-4 w-4" />}
                          color="text-green-500"
                        />
                        <MetricCard 
                          title="Avg. Health Score"
                          value={formatPercent(data.summary.avgHealthScore)}
                          icon={<TrendingUp className="h-4 w-4" />}
                          color="text-amber-500"
                        />
                      </div>
                      
                      {/* Charts arranged in 2 column grid */}
                      <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Inspection Monthly Trends</CardTitle>
                            <CardDescription>Number of inspections over the last 6 months</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={data.monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="completed" name="Completed" fill="#00C49F" />
                                <Bar dataKey="scheduled" name="Scheduled" fill="#0088FE" />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Inspection Status</CardTitle>
                            <CardDescription>Distribution of inspection statuses</CardDescription>
                          </CardHeader>
                          <CardContent className="flex justify-center">
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={getStatusData()}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {getStatusData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Upcoming Inspections */}
                      <Card>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="text-lg">Upcoming Inspections</CardTitle>
                              <CardDescription>Scheduled for the next 7 days</CardDescription>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {data.upcomingInspections.length} upcoming
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {data.upcomingInspections.length > 0 ? (
                            <div className="space-y-4">
                              {data.upcomingInspections.map((inspection) => (
                                <div key={inspection.id} className="flex justify-between items-start border-b border-gray-100 pb-3">
                                  <div>
                                    <h4 className="font-medium">{inspection.property.name}</h4>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      <span>{formatDate(inspection.date)}</span>
                                    </div>
                                  </div>
                                  <Badge variant="outline">
                                    {inspection.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                              <p>No upcoming inspections</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  ) : null}
                </TabsContent>
                

              </Tabs>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}