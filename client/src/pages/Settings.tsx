import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Settings as SettingsIcon, Building, Users, Bell, Shield, Database, Mail, Globe, Plus, Edit, Trash2, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

interface TestCategory {
  id: string;
  name: string;
  code: string;
  price: number;
  turnaroundTime: string;
  isActive: boolean;
}

const mockTestCategories: TestCategory[] = [
  { id: '1', name: 'Complete Blood Count', code: 'CBC', price: 45.00, turnaroundTime: '24 hours', isActive: true },
  { id: '2', name: 'Lipid Profile', code: 'LIPID', price: 65.00, turnaroundTime: '24 hours', isActive: true },
  { id: '3', name: 'Thyroid Function', code: 'TSH', price: 85.00, turnaroundTime: '48 hours', isActive: true },
  { id: '4', name: 'Liver Function', code: 'LFT', price: 55.00, turnaroundTime: '24 hours', isActive: false }
];

const Settings: React.FC = () => {
  const [testCategories, setTestCategories] = useState<TestCategory[]>(mockTestCategories);
  const [isNewTestOpen, setIsNewTestOpen] = useState(false);
  const { toast } = useToast();
  const { formTheme, setFormTheme } = useTheme();

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const handleAddTest = () => {
    toast({
      title: "Test Added",
      description: "New test category has been added successfully.",
    });
    setIsNewTestOpen(false);
  };

  const toggleTestStatus = (testId: string) => {
    setTestCategories(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, isActive: !test.isActive }
        : test
    ));
    toast({
      title: "Status Updated",
      description: "Test category status has been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              System Settings
            </h1>
            <p className="text-slate-600 mt-2 font-medium">Configure laboratory management system preferences</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-14 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <TabsTrigger value="general" className="flex items-center space-x-2 rounded-xl">
              <Building className="w-4 h-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2 rounded-xl">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center space-x-2 rounded-xl">
              <Database className="w-4 h-4" />
              <span>Tests</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2 rounded-xl">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2 rounded-xl">
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2 text-blue-600" />
                  Laboratory Information
                </CardTitle>
                <CardDescription>Basic information about your laboratory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="labName">Laboratory Name</Label>
                    <Input id="labName" defaultValue="Advanced Diagnostic Laboratory" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="labCode">Laboratory Code</Label>
                    <Input id="labCode" defaultValue="ADL-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="info@advancedlab.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" defaultValue="123 Medical Center Drive, Healthcare District, City, State 12345" />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">System Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Time Zone</Label>
                      <Select defaultValue="est">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="est">Eastern Standard Time</SelectItem>
                          <SelectItem value="cst">Central Standard Time</SelectItem>
                          <SelectItem value="mst">Mountain Standard Time</SelectItem>
                          <SelectItem value="pst">Pacific Standard Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select defaultValue="usd">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Palette className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">User Interface Theme</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="formTheme">Form Style</Label>
                      <Select value={formTheme} onValueChange={setFormTheme}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">
                            <div className="flex flex-col">
                              <span className="font-medium">Modern</span>
                              <span className="text-xs text-slate-500">Step-by-step progressive forms</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="professional">
                            <div className="flex flex-col">
                              <span className="font-medium">Professional</span>
                              <span className="text-xs text-slate-500">Traditional all-in-one forms</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-slate-600">
                        Choose how forms are displayed throughout the application. Modern theme shows one field at a time for better focus, while Professional shows all fields together for faster data entry.
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full md:w-auto">
                  Save General Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  User Management Settings
                </CardTitle>
                <CardDescription>Configure user access and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">User Registration</h4>
                      <p className="text-sm text-slate-600">Allow new users to register accounts</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Email Verification</h4>
                      <p className="text-sm text-slate-600">Require email verification for new accounts</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Two-Factor Authentication</h4>
                      <p className="text-sm text-slate-600">Enforce 2FA for all users</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Session Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input id="sessionTimeout" type="number" defaultValue="120" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input id="maxLoginAttempts" type="number" defaultValue="5" />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full md:w-auto">
                  Save User Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Management */}
          <TabsContent value="tests">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Database className="w-5 h-5 mr-2 text-purple-600" />
                      Test Categories
                    </CardTitle>
                    <CardDescription>Manage available test categories and pricing</CardDescription>
                  </div>
                  <Dialog open={isNewTestOpen} onOpenChange={setIsNewTestOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Test
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Test Category</DialogTitle>
                        <DialogDescription>Create a new test category</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="testName">Test Name</Label>
                          <Input id="testName" placeholder="Complete Blood Count" />
                        </div>
                        <div>
                          <Label htmlFor="testCode">Test Code</Label>
                          <Input id="testCode" placeholder="CBC" />
                        </div>
                        <div>
                          <Label htmlFor="testPrice">Price ($)</Label>
                          <Input id="testPrice" type="number" placeholder="45.00" />
                        </div>
                        <div>
                          <Label htmlFor="turnaroundTime">Turnaround Time</Label>
                          <Input id="turnaroundTime" placeholder="24 hours" />
                        </div>
                        <Button onClick={handleAddTest} className="w-full">
                          Add Test Category
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Turnaround</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testCategories.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">{test.name}</TableCell>
                        <TableCell className="font-mono">{test.code}</TableCell>
                        <TableCell>${test.price.toFixed(2)}</TableCell>
                        <TableCell>{test.turnaroundTime}</TableCell>
                        <TableCell>
                          <Badge 
                            className={test.isActive 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {test.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleTestStatus(test.id)}
                            >
                              {test.isActive ? 'Disable' : 'Enable'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-orange-600" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure system notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Order Confirmations</h4>
                        <p className="text-sm text-slate-600">Send email when new orders are received</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Result Notifications</h4>
                        <p className="text-sm text-slate-600">Notify doctors when results are ready</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">System Alerts</h4>
                        <p className="text-sm text-slate-600">Send alerts for system issues</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">SMS Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Patient Notifications</h4>
                        <p className="text-sm text-slate-600">Send SMS updates to patients</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Staff Alerts</h4>
                        <p className="text-sm text-slate-600">Send urgent alerts to staff via SMS</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full md:w-auto">
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-600" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security and compliance settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Password Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="minLength">Minimum Length</Label>
                      <Input id="minLength" type="number" defaultValue="8" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complexity">Complexity Requirements</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (letters only)</SelectItem>
                          <SelectItem value="medium">Medium (letters + numbers)</SelectItem>
                          <SelectItem value="high">High (letters + numbers + symbols)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Data Retention</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="patientData">Patient Data (years)</Label>
                      <Input id="patientData" type="number" defaultValue="7" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="auditLogs">Audit Logs (years)</Label>
                      <Input id="auditLogs" type="number" defaultValue="3" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Compliance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">HIPAA Compliance</h4>
                        <p className="text-sm text-slate-600">Enable HIPAA compliance features</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Audit Logging</h4>
                        <p className="text-sm text-slate-600">Log all user activities</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full md:w-auto">
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;