import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, FileText, Clock, TestTube, CheckCircle, Loader2, Trash2, Eye, Droplet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import { Order, Patient, Test, Doctor } from '@/types';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';

// Stepper steps for order progress
const ORDER_STEPS = [
  { label: "Order Placed", icon: FileText, key: "ORDER_PLACED" },
  { label: "Sample Collected", icon: Droplet, key: "SAMPLE_COLLECTED" },
  { label: "Sample Processing", icon: TestTube, key: "SAMPLE_PROCESSING" },
  { label: "Report Processing", icon: CheckCircle, key: "REPORT_PROCESSING" },
  { label: "Verified", icon: CheckCircle, key: "VERIFIED" },
];

// Helper to get current step index from order status
function getOrderStep(status: string) {
  switch (status) {
    case "SAMPLE_PENDING": return 1;
    case "SAMPLE_PROCESSING": return 2;
    case "REPORT_PROCESSING": return 3;
    case "VERIFIED": return 4;
    default: return 0;
  }
}

function ProfessionalOrderForm({
  formData, setFormData, patients, tests, doctors, submitting, handleSubmit, setIsDialogOpen, editingOrder
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="patient" className="text-sm font-semibold text-slate-700">Patient *</Label>
          <Select value={formData.patientId} onValueChange={value => setFormData({ ...formData, patientId: value })}>
            <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors">
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName} ({patient.patientCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="referredBy" className="text-sm font-semibold text-slate-700">Referring Doctor</Label>
          <Select value={formData.referredBy} onValueChange={value => setFormData({ ...formData, referredBy: value })}>
            <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors">
              <SelectValue placeholder="Select doctor (optional)" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.name}>
                  {doctor.name} - {doctor.specialization}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">Tests * (Select at least one)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto border-2 border-slate-200 rounded-xl p-4">
          {tests.filter(test => test.isActive).map((test) => (
            <div key={test.id} className="flex items-center space-x-2">
              <Checkbox
                id={test.id}
                checked={formData.testIds.includes(test.id)}
                onCheckedChange={checked => {
                  if (checked) {
                    setFormData({ ...formData, testIds: [...formData.testIds, test.id] });
                  } else {
                    setFormData({ ...formData, testIds: formData.testIds.filter(id => id !== test.id) });
                  }
                }}
              />
              <Label htmlFor={test.id} className="text-sm cursor-pointer">
                <div>
                  <p className="font-medium">{test.name}</p>
                  <p className="text-xs text-slate-500">{test.code} - ${test.price}</p>
                </div>
              </Label>
            </div>
          ))}
        </div>
        {formData.testIds.length > 0 && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Selected Tests: {formData.testIds.length}</p>
            <p className="text-sm text-blue-600">Total Amount: ${tests.filter(t => formData.testIds.includes(t.id)).reduce((sum, t) => sum + t.price, 0).toFixed(2)}</p>
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="px-6 py-3 border-2 hover:bg-slate-50 rounded-xl">Cancel</Button>
        <Button type="submit" disabled={submitting} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 rounded-xl">
          {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{editingOrder ? 'Updating...' : 'Creating...'}</>) : (<><FileText className="w-4 h-4 mr-2" />{editingOrder ? 'Update Order' : 'Create Order'}</>)}
        </Button>
      </div>
    </form>
  );
}

function ModernOrderForm({
  formData, setFormData, patients, tests, doctors, submitting, handleSubmit, setIsDialogOpen, editingOrder
}) {
  // ...ModernOrderForm code as previously defined...
}

// ...ProfessionalOrderForm and ModernOrderForm definitions remain unchanged...
// (Assume they are above this component and correct)

const Orders: React.FC = () => {
  const { user } = useAuth();
  const { formTheme } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ patientId: '', testIds: [] as string[], referredBy: '' });
  const { toast } = useToast();
  const isAdmin = user?.role === 'ADMIN';
  const canEdit = ['ADMIN', 'LAB_TECH', 'RECEPTIONIST'].includes(user?.role || '');

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, patientsRes, testsRes, doctorsRes] = await Promise.all([
        apiClient.getOrders({ limit: 100 }),
        apiClient.getPatients({ limit: 100 }),
        apiClient.getTests({ limit: 100 }),
        apiClient.getDoctors({ limit: 100 })
      ]);
      setOrders(ordersRes.orders);
      setPatients(patientsRes.patients);
      setTests(testsRes.tests);
      setDoctors(doctorsRes.doctors);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally { setLoading(false); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.testIds.length === 0) {
      toast({ title: "Error", description: "Please select at least one test", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      if (editingOrder) {
        toast({ title: "Info", description: "Order editing not implemented yet", variant: "destructive" });
      } else {
        await apiClient.createOrder(formData);
        toast({ title: "Success", description: "Order created successfully" });
      }
      setIsDialogOpen(false);
      setEditingOrder(null);
      setFormData({ patientId: '', testIds: [], referredBy: '' });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save order", variant: "destructive" });
    } finally { setSubmitting(false); }
  };
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!canEdit) return;
    try {
      await apiClient.updateOrderStatus(orderId, newStatus);
      toast({ title: "Success", description: "Order status updated successfully" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update order status", variant: "destructive" });
    }
  };
  const handleDelete = async (orderId: string) => {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await apiClient.deleteOrder(orderId);
        toast({ title: "Success", description: "Order deleted successfully" });
        loadData();
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to delete order", variant: "destructive" });
      }
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SAMPLE_PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SAMPLE_PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REPORT_PROCESSING': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'VERIFIED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.patient && `${order.patient.firstName} ${order.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.patient && order.patient.patientCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const stats = [
    { title: 'Total Orders', value: orders.length, icon: FileText, color: 'from-blue-500 to-blue-600' },
    { title: 'Sample Pending', value: orders.filter(o => o.status === 'SAMPLE_PENDING').length, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
    { title: 'Processing', value: orders.filter(o => ['SAMPLE_PROCESSING', 'REPORT_PROCESSING'].includes(o.status)).length, icon: TestTube, color: 'from-purple-500 to-purple-600' },
    { title: 'Verified', value: orders.filter(o => o.status === 'VERIFIED').length, icon: CheckCircle, color: 'from-green-500 to-green-600' }
  ];
  return (
    <div className="p-8 space-y-8 min-h-full bg-gradient-to-b from-transparent to-slate-50/30">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Test Orders
          </h1>
          <p className="text-slate-600 mt-2 text-lg">Manage laboratory test orders and requests</p>
        </div>
        {canEdit && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={open => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingOrder(null);
                setFormData({ patientId: '', testIds: [], referredBy: '' });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200">
                <Plus className="w-5 h-5 mr-2" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {editingOrder ? 'Edit Order' : 'Create New Test Order'}
                </DialogTitle>
                <DialogDescription>
                  {editingOrder ? 'Update order information' : 'Add a new laboratory test order'}
                </DialogDescription>
              </DialogHeader>
              {formTheme === 'modern' ? (
                <ModernOrderForm
                  formData={formData}
                  setFormData={setFormData}
                  patients={patients}
                  tests={tests}
                  doctors={doctors}
                  submitting={submitting}
                  handleSubmit={handleSubmit}
                  setIsDialogOpen={setIsDialogOpen}
                  editingOrder={editingOrder}
                />
              ) : (
                <ProfessionalOrderForm
                  formData={formData}
                  setFormData={setFormData}
                  patients={patients}
                  tests={tests}
                  doctors={doctors}
                  submitting={submitting}
                  handleSubmit={handleSubmit}
                  setIsDialogOpen={setIsDialogOpen}
                  editingOrder={editingOrder}
                />
              )}
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
              <Input placeholder="Search by patient name, order number, or patient code..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-12 h-12 text-lg bg-slate-50/50 border-slate-200 focus:bg-white transition-colors rounded-xl" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SAMPLE_PENDING">Sample Pending</SelectItem>
                <SelectItem value="SAMPLE_PROCESSING">Sample Processing</SelectItem>
                <SelectItem value="REPORT_PROCESSING">Report Processing</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Orders Table */}
      {loading ? (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-xl text-slate-600 font-medium">Loading orders...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Test Orders</CardTitle>
            <CardDescription>Real-time tracking of all laboratory test orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Tests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Amount</TableHead>
                    {(canEdit || isAdmin) && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-blue-50/40 transition-colors">
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        {order.patient ? (
                          <div>
                            <p className="font-semibold">{order.patient.firstName} {order.patient.lastName}</p>
                            <p className="text-sm text-slate-500">{order.patient.patientCode}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400">Unknown Patient</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.orderTests?.slice(0, 2).map((orderTest, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{orderTest.test.name}</Badge>
                          ))}
                          {(order.orderTests?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">+{(order.orderTests?.length || 0) - 2} more</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                          <p className="text-xs text-slate-500">{format(new Date(order.createdAt), 'HH:mm')}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">${order.totalAmount.toFixed(2)}</TableCell>
                      {(canEdit || isAdmin) && (
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link to={`/orders/${order.id}`}>
                                    <Button variant="ghost" size="icon" className="hover:bg-blue-100" aria-label="View Order">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>View Order</TooltipContent>
                              </Tooltip>
                              {canEdit && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Select onValueChange={value => handleStatusUpdate(order.id, value)}>
                                      <SelectTrigger className="w-24 h-8 text-xs">
                                        <SelectValue placeholder="Status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="SAMPLE_PENDING">Sample Pending</SelectItem>
                                        <SelectItem value="SAMPLE_PROCESSING">Sample Processing</SelectItem>
                                        <SelectItem value="REPORT_PROCESSING">Report Processing</SelectItem>
                                        <SelectItem value="VERIFIED">Verified</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TooltipTrigger>
                                  <TooltipContent>Change Status</TooltipContent>
                                </Tooltip>
                              )}
                              {isAdmin && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50" aria-label="Delete Order">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Order</TooltipContent>
                                </Tooltip>
                              )}
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4"><FileText className="w-10 h-10 text-slate-400" /></div>
                <p className="text-xl text-slate-600 font-medium">No orders found</p>
                <p className="text-slate-500 mt-2">{canEdit ? 'Try adjusting your search terms or create a new order' : 'Try adjusting your search terms'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Orders;
