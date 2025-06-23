
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TestTube, 
  FileText, 
  Clock,
  TrendingUp,
  Activity,
  Calendar,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Patients",
      value: "1,247",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "from-blue-500 via-cyan-500 to-teal-500",
      bgColor: "from-blue-50 to-cyan-50"
    },
    {
      title: "Pending Tests",
      value: "89",
      change: "-5%",
      trend: "down",
      icon: TestTube,
      color: "from-orange-500 via-red-500 to-pink-500",
      bgColor: "from-orange-50 to-red-50"
    },
    {
      title: "Reports Today",
      value: "156",
      change: "+8%",
      trend: "up",
      icon: FileText,
      color: "from-green-500 via-emerald-500 to-teal-500",
      bgColor: "from-green-50 to-emerald-50"
    },
    {
      title: "Avg. Turnaround",
      value: "4.2hrs",
      change: "-15%",
      trend: "down",
      icon: Clock,
      color: "from-purple-500 via-violet-500 to-indigo-500",
      bgColor: "from-purple-50 to-violet-50"
    }
  ];

  const recentActivity = [
    { action: "Report Generated", patient: "John Doe", time: "2 mins ago", type: "success" },
    { action: "Sample Collected", patient: "Jane Smith", time: "15 mins ago", type: "info" },
    { action: "Test Ordered", patient: "Mike Johnson", time: "32 mins ago", type: "warning" },
    { action: "Report Verified", patient: "Sarah Wilson", time: "1 hour ago", type: "success" },
  ];

  return (
    <div className="p-8 space-y-8 min-h-full relative">
      {/* Welcome Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/25 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center mb-3">
              <Sparkles className="w-8 h-8 mr-3 text-yellow-300 animate-pulse" />
              <h1 className="text-4xl font-bold">
                Welcome back, {user?.firstName}!
              </h1>
            </div>
            <p className="text-blue-100 text-xl font-medium">
              Here's what's happening in your laboratory today
            </p>
          </div>
          <div className="text-right bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-3xl font-bold">{new Date().getDate()}</div>
            <div className="text-blue-200 text-sm font-semibold">
              {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUp : ArrowDown;
          return (
            <Card key={index} className="relative overflow-hidden border-0 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-200/30 transition-all duration-500 group cursor-pointer hover:scale-[1.02] bg-white/80 backdrop-blur-sm">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-50 group-hover:opacity-70 transition-opacity`}></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full blur-2xl group-hover:blur-xl transition-all"></div>
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-600 mb-3 tracking-wide uppercase">{stat.title}</p>
                    <p className="text-4xl font-bold text-slate-900 mb-3">{stat.value}</p>
                    <div className="flex items-center">
                      <div className={`flex items-center px-3 py-1 rounded-full ${
                        stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <TrendIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm font-bold">{stat.change}</span>
                      </div>
                      <span className="text-slate-500 text-sm ml-2 font-medium">vs last month</span>
                    </div>
                  </div>
                  <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-xl shadow-slate-300/30 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 shadow-xl shadow-slate-200/20 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-blue-50/50 to-transparent"></div>
          
          <CardHeader className="pb-6 relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-2xl font-bold text-slate-900">
                <Activity className="w-7 h-7 mr-4 text-blue-600" />
                Recent Activity
              </CardTitle>
              <Button variant="outline" size="sm" className="text-slate-600 hover:bg-blue-50 border-slate-300 hover:border-blue-300 rounded-xl font-semibold">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center p-5 rounded-2xl bg-gradient-to-r from-slate-50/80 to-blue-50/30 hover:from-slate-100/80 hover:to-blue-100/50 transition-all duration-300 border border-slate-200/50 hover:border-blue-200/60 hover:shadow-lg hover:shadow-slate-200/20">
                <div className={`w-4 h-4 rounded-full mr-5 shadow-lg ${
                  activity.type === 'success' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                  activity.type === 'info' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' : 
                  'bg-gradient-to-r from-orange-400 to-red-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-lg">{activity.action}</p>
                  <p className="text-sm text-slate-600 font-medium">Patient: {activity.patient}</p>
                </div>
                <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-xl shadow-slate-200/20 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50/50 to-transparent"></div>
          
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center text-2xl font-bold text-slate-900">
              <Calendar className="w-7 h-7 mr-4 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <Button className="w-full h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/25 transition-all duration-300 rounded-2xl font-bold text-lg hover:scale-[1.02]">
              Register New Patient
            </Button>
            <Button variant="outline" className="w-full h-12 border-2 hover:bg-blue-50 border-slate-300 hover:border-blue-300 rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
              Create Test Order
            </Button>
            <Button variant="outline" className="w-full h-12 border-2 hover:bg-green-50 border-slate-300 hover:border-green-300 rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
              Generate Report
            </Button>
            <Button variant="outline" className="w-full h-12 border-2 hover:bg-purple-50 border-slate-300 hover:border-purple-300 rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
