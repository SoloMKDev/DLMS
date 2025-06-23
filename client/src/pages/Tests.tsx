import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, TestTube, DollarSign, Package, Activity, Loader2, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Test } from '@/types';
import { format } from 'date-fns';

const Tests: React.FC = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('true');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    price: '',
    sampleType: '',
    containerType: '',
    normalRange: '',
    unit: ''
  });
  const { toast } = useToast();

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [testsRes, categoriesRes] = await Promise.all([
        apiClient.getTests({ limit: 100 }),
        apiClient.getTestCategories()
      ]);
      
      setTests(testsRes.tests);
      setCategories(categoriesRes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const testData = {
        ...formData,
        price: parseFloat(formData.price),
        normalRange: formData.normalRange || undefined,
        unit: formData.unit || undefined
      };

      if (editingTest) {
        await apiClient.updateTest(editingTest.id, testData);
        toast({
          title: "Success",
          description: "Test updated successfully",
        });
      } else {
        await apiClient.createTest(testData);
        toast({
          title: "Success",
          description: "Test created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingTest(null);
      setFormData({ name: '', code: '', category: '', price: '', sampleType: '', containerType: '', normalRange: '', unit: '' });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save test",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (test: Test) => {
    if (!isAdmin) return;
    setEditingTest(test);
    setFormData({
      name: test.name,
      code: test.code,
      category: test.category,
      price: test.price.toString(),
      sampleType: test.sampleType,
      containerType: test.containerType,
      normalRange: test.normalRange || '',
      unit: test.unit || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (testId: string) => {
    if (!isAdmin) return;
    
    if (confirm('Are you sure you want to delete this test?')) {
      try {
        await apiClient.deleteTest(testId);
        toast({
          title: "Success",
          description: "Test deleted successfully",
        });
        loadData();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete test",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleStatus = async (testId: string) => {
    if (!isAdmin) return;
    
    try {
      await apiClient.toggleTest(testId);
      toast({
        title: "Success",
        description: "Test status updated successfully",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update test status",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200'
    ];
    const index = category.length % colors.length;
    return colors[index];
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = 
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || test.category === categoryFilter;
    const matchesActive = activeFilter === 'all' || test.isActive.toString() === activeFilter;
    
    return matchesSearch && matchesCategory && matchesActive;
  });

  const stats = [
    { title: 'Total Tests', value: tests.length, icon: TestTube, color: 'from-blue-500 to-blue-600' },
    { title: 'Active Tests', value: tests.filter(t => t.isActive).length, icon: Activity, color: 'from-green-500 to-green-600' },
    { title: 'Categories', value: categories.length, icon: Package, color: 'from-purple-500 to-purple-600' },
    { title: 'Avg Price', value: `$${(tests.reduce((sum, t) => sum + t.price, 0) / tests.length || 0).toFixed(0)}`, icon: DollarSign, color: 'from-orange-500 to-orange-600' }
  ];

  return (
    <div className="p-8 space-y-8 min-h-full bg-gradient-to-b from-transparent to-slate-50/30">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Tests Management
          </h1>
          <p className="text-slate-600 mt-2 text-lg">Manage laboratory tests, pricing, and specifications</p>
        </div>
        
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingTest(null);
              setFormData({ name: '', code: '', category: '', price: '', sampleType: '', containerType: '', normalRange: '', unit: '' });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200">
                <Plus className="w-5 h-5 mr-2" />
                Add Test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {editingTest ? 'Edit Test' : 'Add New Test'}
                </DialogTitle>
                <DialogDescription>
                  {editingTest ? 'Update test information and specifications' : 'Create a new laboratory test with specifications'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                      Test Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors"
                      placeholder="Complete Blood Count"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-semibold text-slate-700">
                      Test Code *
                    </Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                      className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors font-mono"
                      placeholder="CBC"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-slate-700">
                      Category *
                    </Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors"
                      placeholder="Hematology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-semibold text-slate-700 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Price *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors"
                      placeholder="25.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sampleType" className="text-sm font-semibold text-slate-700">
                      Sample Type *
                    </Label>
                    <Select value={formData.sampleType} onValueChange={(value) => setFormData({ ...formData, sampleType: value })}>
                      <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors">
                        <SelectValue placeholder="Select sample type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Blood">Blood</SelectItem>
                        <SelectItem value="Urine">Urine</SelectItem>
                        <SelectItem value="Stool">Stool</SelectItem>
                        <SelectItem value="Tissue">Tissue</SelectItem>
                        <SelectItem value="Swab">Swab</SelectItem>
                        <SelectItem value="Saliva">Saliva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="containerType" className="text-sm font-semibold text-slate-700">
                      Container Type *
                    </Label>
                    <Input
                      id="containerType"
                      value={formData.containerType}
                      onChange={(e) => setFormData({ ...formData, containerType: e.target.value })}
                      required
                      className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors"
                      placeholder="EDTA Tube"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="normalRange" className="text-sm font-semibold text-slate-700">
                      Normal Range
                    </Label>
                    <Textarea
                      id="normalRange"
                      value={formData.normalRange}
                      onChange={(e) => setFormData({ ...formData, normalRange: e.target.value })}
                      className="border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors resize-none"
                      placeholder="e.g., WBC: 4.5-11.0 x10³/µL"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit" className="text-sm font-semibold text-slate-700">
                      Unit
                    </Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors"
                      placeholder="mg/dL, x10³/µL, etc."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="px-6 py-3 border-2 hover:bg-slate-50 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 rounded-xl"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingTest ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        {editingTest ? 'Update Test' : 'Create Test'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search by test name, code, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg bg-slate-50/50 border-slate-200 focus:bg-white transition-colors rounded-xl"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-full sm:w-32 h-12 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tests Table */}
      {loading ? (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-xl text-slate-600 font-medium">Loading tests...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Laboratory Tests</CardTitle>
            <CardDescription>Manage all available laboratory tests and their specifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Sample Info</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Normal Range</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.map((test) => (
                    <TableRow key={test.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900">{test.name}</p>
                          <p className="text-sm text-slate-500 font-mono">{test.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(test.category)}>
                          {test.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{test.sampleType}</p>
                          <p className="text-slate-500">{test.containerType}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                          <span className="font-semibold text-green-600">{test.price.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs">
                          {test.normalRange ? (
                            <div>
                              <p className="truncate">{test.normalRange}</p>
                              {test.unit && <p className="text-slate-500">Unit: {test.unit}</p>}
                            </div>
                          ) : (
                            <span className="text-slate-400">Not specified</span>
                          )}
                        </div>
                      </TableCell>
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
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(test)}
                              className="text-xs"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(test.id)}
                              className="text-xs"
                            >
                              {test.isActive ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                              {test.isActive ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(test.id)}
                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredTests.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TestTube className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-xl text-slate-600 font-medium">No tests found</p>
                <p className="text-slate-500 mt-2">
                  {isAdmin ? 'Try adjusting your search terms or add a new test' : 'Try adjusting your search terms'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tests;