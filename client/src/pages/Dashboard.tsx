import { useState } from "react";
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
  
  // Query dashboard data
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard/host'],
    enabled: !!user,
  });
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
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
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#484848]">Host Dashboard</h1>
          <p className="text-[#767676] mt-1">Track your property performance and inspection metrics</p>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-3 md:grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
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
          
          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-2/3" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : data && data.propertyPerformance.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.propertyPerformance.map((property) => (
                    <PropertyPerformanceCard key={property.id} property={property} />
                  ))}
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Properties Health Score Comparison</CardTitle>
                    <CardDescription>Compare performance across your properties</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={data.propertyPerformance}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="healthScore" name="Health Score" fill="#8884d8" />
                        <Bar dataKey="completionRate" name="Completion Rate" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No properties found</p>
                <Button variant="outline" className="mt-4">
                  Add Property
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Inspections Tab */}
          <TabsContent value="inspections" className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : data ? (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{data.summary.completedInspections}</div>
                      <div className="text-xs text-muted-foreground">
                        {data.summary.totalInspections > 0 
                          ? `${Math.round((data.summary.completedInspections / data.summary.totalInspections) * 100)}% of total` 
                          : 'No inspections yet'}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{data.summary.scheduledInspections}</div>
                      <div className="text-xs text-muted-foreground">
                        {data.summary.totalInspections > 0 
                          ? `${Math.round((data.summary.scheduledInspections / data.summary.totalInspections) * 100)}% of total` 
                          : 'No inspections yet'}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">{data.summary.cancelledInspections}</div>
                      <div className="text-xs text-muted-foreground">
                        {data.summary.totalInspections > 0 
                          ? `${Math.round((data.summary.cancelledInspections / data.summary.totalInspections) * 100)}% of total` 
                          : 'No inspections yet'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Inspection Trends</CardTitle>
                    <CardDescription>Track your inspection patterns over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={data.monthlyData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="completed" name="Completed" stroke="#00C49F" />
                        <Line type="monotone" dataKey="scheduled" name="Scheduled" stroke="#0088FE" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}