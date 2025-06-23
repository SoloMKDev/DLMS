import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, TestTube, Package, Clock, CheckCircle, AlertTriangle, MapPin, Barcode, Loader2, Edit, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Order, Patient } from '@/types';
import { format } from 'date-fns';

interface Sample {
  id: string;
  sampleId: string;
  orderId: string;
  order?: Order;
  sampleType: string;
  containerType: string;
  status: 'sample_pending' | 'sample_processing' | 'report_processing' | 'verified';
  location: string;
  collectedAt: string;
  collectedBy: string;
  temperature: string;
  notes?: string;
}

const Samples: React.FC = () => {
  const { user } = useAuth();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSample, setEditingSample] = useState<Sample | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    orderId: '',
    sampleType: '',
    notes: ''
  });
  const [patientOrders, setPatientOrders] = useState<Order[]>([]);
  const [verifyingPatient, setVerifyingPatient] = useState(false);
  const [patientVerified, setPatientVerified] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const { toast } = useToast();

  const isAdmin = user?.role === 'ADMIN';
  const canEdit = ['ADMIN', 'LAB_TECH', 'PATHOLOGIST'].includes(user?.role || '');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // For now, we'll simulate sample data based on orders
      const ordersRes = await apiClient.getOrders({ limit: 100 });
      setOrders(ordersRes.orders);
      
      // Simulate sample data - in a real app, this would be a separate API
      const mockSamples: Sample[] = ordersRes.orders
        .filter(order => ['SAMPLE_PROCESSING', 'REPORT_PROCESSING', 'VERIFIED'].includes(order.status))
        .map((order, index) => ({
          id: `sample-${order.id}`,
          sampleId: `SMP-${order.orderNumber.split('-')[2]}`,
          orderId: order.id,
          order,
          sampleType: order.orderTests?.[0]?.test.sampleType || 'Blood',
          containerType: order.orderTests?.[0]?.test.containerType || 'EDTA Tube',
          status: order.status === 'SAMPLE_PROCESSING' ? 'sample_processing' : 
                  order.status === 'REPORT_PROCESSING' ? 'report_processing' : 'verified',
          location: `Lab Station ${String.fromCharCode(65 + (index % 3))}-${(index % 5) + 1}`,
          collectedAt: order.sampleCollectedAt || order.createdAt,
          collectedBy: order.sampleCollector ? 
            `${order.sampleCollector.firstName} ${order.sampleCollector.lastName}` : 'Lab Tech',
          temperature: order.orderTests?.[0]?.test.sampleType === 'Blood' ? '4°C' : 'Room Temp',
          notes: ''
        }));
      
      setSamples(mockSamples);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load samples",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPatient = async (patientCode: string) => {
    if (!patientCode.trim()) {
      setPatientVerified(false);
      setCurrentPatient(null);
      setPatientOrders([]);
      return;
    }

    setVerifyingPatient(true);
    try {
      // Get all patients and find by patient code
      const patientsRes = await apiClient.getPatients({ search: patientCode, limit: 100 });
      const patient = patientsRes.patients.find(p => p.patientCode === patientCode);
      
      if (patient) {
        setCurrentPatient(patient);
        setPatientVerified(true);
        
        // Get orders for this patient that are pending sample collection
        const ordersRes = await apiClient.getOrders({ limit: 100 });
        const allPatientOrders = ordersRes.orders.filter(order => order.patientId === patient.id);
        const patientOrdersPendingSample = allPatientOrders.filter(order => 
          order.status === 'SAMPLE_PENDING'
        );
        setPatientOrders(patientOrdersPendingSample);
        
        if (patientOrdersPendingSample.length === 0) {
          if (allPatientOrders.length === 0) {
            toast({
              title: "No Orders Found",
              description: "This patient has no orders in the system",
              variant: "destructive",
            });
          } else {
            const orderStatuses = allPatientOrders.map(o => o.status).join(', ');
            toast({
              title: "No Pending Sample Orders",
              description: `Patient has ${allPatientOrders.length} order(s) but none are pending sample collection. Current statuses: ${orderStatuses}`,
              variant: "destructive",
            });
          }
        }
      } else {
        setPatientVerified(false);
        setCurrentPatient(null);
        setPatientOrders([]);
        toast({
          title: "Patient Not Found",
          description: "No patient found with this ID",
          variant: "destructive",
        });
      }
    } catch (error) {
      setPatientVerified(false);
      setCurrentPatient(null);
      setPatientOrders([]);
      toast({
        title: "Error",
        description: "Failed to verify patient",
        variant: "destructive",
      });
    } finally {
      setVerifyingPatient(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientVerified || !currentPatient) {
      toast({
        title: "Error",
        description: "Please verify patient ID first",
        variant: "destructive",
      });
      return;
    }

    if (!formData.orderId) {
      toast({
        title: "Error",
        description: "Please select an order",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // In a real app, this would call a samples API
      const selectedOrder = patientOrders.find(order => order.id === formData.orderId);
      const newSample: Sample = {
        id: `sample-${Date.now()}`,
        sampleId: `SMP-${Date.now().toString().slice(-6)}`,
        orderId: formData.orderId,
        order: selectedOrder,
        sampleType: formData.sampleType,
        containerType: selectedOrder?.orderTests?.[0]?.test.containerType || 'Standard Container',
        status: 'sample_processing',
        location: `Lab Station A-${Math.floor(Math.random() * 5) + 1}`,
        collectedAt: new Date().toISOString(),
        collectedBy: `${user?.firstName} ${user?.lastName}`,
        temperature: selectedOrder?.orderTests?.[0]?.test.sampleType === 'Blood' ? '4°C' : 'Room Temp',
        notes: formData.notes
      };

      setSamples(prev => [newSample, ...prev]);
      
      toast({
        title: "Success",
        description: "Sample added successfully",
      });
      
      setIsDialogOpen(false);
      setEditingSample(null);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save sample",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ patientId: '', orderId: '', sampleType: '', notes: '' });
    setPatientVerified(false);
    setCurrentPatient(null);
    setPatientOrders([]);
  };

  const handleStatusUpdate = async (sampleId: string, newStatus: string) => {
    if (!canEdit) return;
    
    try {
      // In a real app, this would update the sample status
      setSamples(prev => prev.map(sample => 
        sample.id === sampleId ? { ...sample, status: newStatus as any } : sample
      ));
      
      toast({
        title: "Success",
        description: "Sample status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update sample status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (sampleId: string) => {
    if (!isAdmin) return;
    
    if (confirm('Are you sure you want to delete this sample record?')) {
      try {
        setSamples(prev => prev.filter(sample => sample.id !== sampleId));
        toast({
          title: "Success",
          description: "Sample record deleted successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete sample",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collected': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'received': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'analyzed': return 'bg-green-100 text-green-800 border-green-200';
      case 'disposed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'collected': return Package;
      case 'received': return TestTube;
      case 'processing': return Clock;
      case 'analyzed': return CheckCircle;
      case 'disposed': return AlertTriangle;
      default: return Package;
    }
  };

  const filteredSamples = samples.filter(sample => {
    const patientName = sample.order?.patient ? 
      `${sample.order.patient.firstName} ${sample.order.patient.lastName}` : '';
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sample.order?.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || sample.status === statusFilter;
    const matchesType = typeFilter === 'all' || sample.sampleType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = [
    { title: 'Total Samples', value: samples.length, icon: TestTube, color: 'from-blue-500 to-blue-600' },
    { title: 'In Processing', value: samples.filter(s => s.status === 'processing').length, icon: Clock, color: 'from-purple-500 to-purple-600' },
    { title: 'Analyzed', value: samples.filter(s => s.status === 'analyzed').length, icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { title: 'Pending', value: samples.filter(s => ['collected', 'received'].includes(s.status)).length, icon: Package, color: 'from-yellow-500 to-yellow-600' }
  ];

  return (
    <div className="p-8 space-y-8 min-h-full bg-gradient-to-b from-transparent to-slate-50/30">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Sample Tracking
          </h1>
          <p className="text-slate-600 mt-2 text-lg">Track and manage laboratory samples throughout the workflow</p>
        </div>
        
        <div className="flex space-x-3">
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transition-all duration-200">
            <Barcode className="w-5 h-5 mr-2" />
            Scan Sample
          </Button>
          
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingSample(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Sample
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {editingSample ? 'Edit Sample' : 'Add New Sample'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSample ? 'Update sample information' : 'Register a new laboratory sample'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                  {/* Patient ID Input */}
                  <div className="space-y-2">
                    <Label htmlFor="patientId" className="text-sm font-semibold text-slate-700">
                      Patient ID *
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="patientId"
                        value={formData.patientId}
                        onChange={(e) => {
                          setFormData({ ...formData, patientId: e.target.value });
                          setPatientVerified(false);
                          setCurrentPatient(null);
                          setPatientOrders([]);
                        }}
                        required
                        className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors font-mono"
                        placeholder="Enter patient ID (e.g., P0001)"
                      />
                      <Button
                        type="button"
                        onClick={() => verifyPatient(formData.patientId)}
                        disabled={verifyingPatient || !formData.patientId.trim()}
                        className="h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl"
                      >
                        {verifyingPatient ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Verify'
                        )}
                      </Button>
                    </div>
                    {patientVerified && currentPatient && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          ✓ Patient verified: {currentPatient.firstName} {currentPatient.lastName}
                        </p>
                        <p className="text-xs text-green-600">
                          Phone: {currentPatient.phone} | DOB: {format(new Date(currentPatient.dateOfBirth), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order Selection - Only show if patient is verified */}
                  {patientVerified && (
                    <div className="space-y-2">
                      <Label htmlFor="orderId" className="text-sm font-semibold text-slate-700">
                        Select Order *
                      </Label>
                      <Select 
                        value={formData.orderId} 
                        onValueChange={(value) => setFormData({ ...formData, orderId: value })}
                        disabled={patientOrders.length === 0}
                      >
                        <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors">
                          <SelectValue placeholder={patientOrders.length === 0 ? "No orders available" : "Select order"} />
                        </SelectTrigger>
                        <SelectContent>
                          {patientOrders.map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{order.orderNumber}</span>
                                <span className="text-xs text-slate-500">
                                  {order.orderTests?.map(ot => ot.test.name).join(', ')} - ${order.totalAmount.toFixed(2)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Sample Type - Only show if order is selected */}
                  {formData.orderId && (
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
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Notes */}
                  {formData.sampleType && (
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                        Notes (Optional)
                      </Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors"
                        placeholder="Additional notes about the sample"
                      />
                    </div>
                  )}

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
                      disabled={submitting || !patientVerified || !formData.orderId || !formData.sampleType}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 rounded-xl disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding Sample...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4 mr-2" />
                          Add Sample
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
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
                placeholder="Search by patient name, sample ID, or order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg bg-slate-50/50 border-slate-200 focus:bg-white transition-colors rounded-xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="analyzed">Analyzed</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Blood">Blood</SelectItem>
                <SelectItem value="Urine">Urine</SelectItem>
                <SelectItem value="Stool">Stool</SelectItem>
                <SelectItem value="Tissue">Tissue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Samples Table */}
      {loading ? (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-xl text-slate-600 font-medium">Loading samples...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Sample Tracking</CardTitle>
            <CardDescription>Real-time tracking of all laboratory samples</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sample ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Container</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Collected</TableHead>
                    <TableHead>Temperature</TableHead>
                    {(canEdit || isAdmin) && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSamples.map((sample) => {
                    const StatusIcon = getStatusIcon(sample.status);
                    return (
                      <TableRow key={sample.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium font-mono">{sample.sampleId}</TableCell>
                        <TableCell>
                          {sample.order?.patient ? (
                            <div>
                              <p className="font-semibold">
                                {sample.order.patient.firstName} {sample.order.patient.lastName}
                              </p>
                              <p className="text-sm text-slate-500">{sample.order.patient.patientCode}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400">Unknown Patient</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{sample.order?.orderNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {sample.sampleType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{sample.containerType}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(sample.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {sample.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                            {sample.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{format(new Date(sample.collectedAt), 'MMM dd, yyyy HH:mm')}</p>
                            <p className="text-slate-500 text-xs">by {sample.collectedBy}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {sample.temperature}
                          </Badge>
                        </TableCell>
                        {(canEdit || isAdmin) && (
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {canEdit && (
                                <Select onValueChange={(value) => handleStatusUpdate(sample.id, value)}>
                                  <SelectTrigger className="w-24 h-8 text-xs">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="collected">Collected</SelectItem>
                                    <SelectItem value="received">Received</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="analyzed">Analyzed</SelectItem>
                                    <SelectItem value="disposed">Disposed</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                              {isAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(sample.id)}
                                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredSamples.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TestTube className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-xl text-slate-600 font-medium">No samples found</p>
                <p className="text-slate-500 mt-2">
                  {canEdit ? 'Try adjusting your search terms or add a new sample' : 'Try adjusting your search terms'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Samples;