import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, Filter, UserPlus, Loader2, Calendar, Phone, Mail, MapPin, Users, CheckCircle, AlertCircle, User } from 'lucide-react';
import { Patient, Doctor } from '@/types';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

function ProfessionalPatientForm({
  formData, setFormData, formValidation, setFormValidation, submitting, handleSubmit, resetForm, isDialogOpen, setIsDialogOpen, doctors, calculateAge
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700">First Name *</Label>
            <Input id="firstName" value={formData.firstName} onChange={e => {
              setFormData({ ...formData, firstName: e.target.value });
              setFormValidation({ ...formValidation, firstName: e.target.value.trim().length >= 2 });
            }} required className={`h-12 border-2 ${formValidation.firstName ? 'border-slate-200 focus:border-blue-500' : 'border-red-300 focus:border-red-500'} rounded-xl transition-colors`} placeholder="Enter first name" />
            {!formValidation.firstName && formData.firstName && (
              <div className="flex items-center text-red-600 text-xs mt-1"><AlertCircle className="w-3 h-3 mr-1" />First name must be at least 2 characters</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Last Name *</Label>
            <Input id="lastName" value={formData.lastName} onChange={e => {
              setFormData({ ...formData, lastName: e.target.value });
              setFormValidation({ ...formValidation, lastName: e.target.value.trim().length >= 2 });
            }} required className={`h-12 border-2 ${formValidation.lastName ? 'border-slate-200 focus:border-blue-500' : 'border-red-300 focus:border-red-500'} rounded-xl transition-colors`} placeholder="Enter last name" />
            {!formValidation.lastName && formData.lastName && (
              <div className="flex items-center text-red-600 text-xs mt-1"><AlertCircle className="w-3 h-3 mr-1" />Last name must be at least 2 characters</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-slate-700 flex items-center"><Calendar className="w-4 h-4 mr-2" />Date of Birth *</Label>
            <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={e => {
              setFormData({ ...formData, dateOfBirth: e.target.value });
              setFormValidation({ ...formValidation, dateOfBirth: e.target.value !== '' && new Date(e.target.value) < new Date() });
            }} required max={new Date().toISOString().split('T')[0]} className={`h-12 border-2 ${formValidation.dateOfBirth ? 'border-slate-200 focus:border-blue-500' : 'border-red-300 focus:border-red-500'} rounded-xl transition-colors`} />
            {!formValidation.dateOfBirth && formData.dateOfBirth && (
              <div className="flex items-center text-red-600 text-xs mt-1"><AlertCircle className="w-3 h-3 mr-1" />Please enter a valid birth date</div>
            )}
            {formData.dateOfBirth && formValidation.dateOfBirth && (
              <div className="flex items-center text-green-600 text-xs mt-1"><CheckCircle className="w-3 h-3 mr-1" />Age: {calculateAge(formData.dateOfBirth)} years</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 flex items-center"><Phone className="w-4 h-4 mr-2" />Phone Number *</Label>
            <Input id="phone" value={formData.phone} onChange={e => {
              setFormData({ ...formData, phone: e.target.value });
              setFormValidation({ ...formValidation, phone: e.target.value.trim().length >= 10 });
            }} required className={`h-12 border-2 ${formValidation.phone ? 'border-slate-200 focus:border-blue-500' : 'border-red-300 focus:border-red-500'} rounded-xl transition-colors font-mono`} placeholder="Enter phone number" />
            {!formValidation.phone && formData.phone && (
              <div className="flex items-center text-red-600 text-xs mt-1"><AlertCircle className="w-3 h-3 mr-1" />Phone number must be at least 10 digits</div>
            )}
          </div>
        </div>
      </div>
      {/* Contact Information */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center space-x-2 mb-4"><Mail className="w-5 h-5 text-blue-600" /><h3 className="text-lg font-semibold text-slate-800">Contact Information</h3></div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center"><Mail className="w-4 h-4 mr-2" />Email Address</Label>
          <Input id="email" type="email" value={formData.email} onChange={e => {
            setFormData({ ...formData, email: e.target.value });
            setFormValidation({ ...formValidation, email: e.target.value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value) });
          }} className={`h-12 border-2 ${formValidation.email ? 'border-slate-200 focus:border-blue-500' : 'border-red-300 focus:border-red-500'} rounded-xl transition-colors`} placeholder="Enter email address (optional)" />
          {!formValidation.email && formData.email && (
            <div className="flex items-center text-red-600 text-xs mt-1"><AlertCircle className="w-3 h-3 mr-1" />Please enter a valid email address</div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-semibold text-slate-700 flex items-center"><MapPin className="w-4 h-4 mr-2" />Address</Label>
          <Textarea id="address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors resize-none" placeholder="Enter full address (optional)" rows={3} />
        </div>
      </div>
      {/* Referral Information */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center space-x-2 mb-4"><UserPlus className="w-5 h-5 text-blue-600" /><h3 className="text-lg font-semibold text-slate-800">Referral Information</h3></div>
        <div className="space-y-2">
          <Label htmlFor="referredBy" className="text-sm font-semibold text-slate-700">Referring Doctor</Label>
          <Select value={formData.referredBy} onValueChange={value => setFormData({ ...formData, referredBy: value })}>
            <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors">
              <SelectValue placeholder="Select referring doctor (optional)" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.name}>
                  <div className="flex flex-col">
                    <span className="font-medium">{doctor.name}</span>
                    <span className="text-xs text-slate-500">{doctor.specialization}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="px-6 py-3 border-2 hover:bg-slate-50 rounded-xl">Cancel</Button>
        <Button type="submit" disabled={submitting || !Object.values(formValidation).every(Boolean)} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 rounded-xl disabled:opacity-50">
          {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registering Patient...</>) : (<><UserPlus className="w-4 h-4 mr-2" />Register Patient</>)}
        </Button>
      </div>
    </form>
  );
}

function ModernPatientForm({
  formData, setFormData, formValidation, setFormValidation, submitting, handleSubmit, resetForm, isDialogOpen, setIsDialogOpen, doctors, calculateAge
}) {
  // Step order: firstName, lastName, dateOfBirth, phone, email, address, referredBy
  const steps = [
    {
      key: 'firstName',
      label: 'First Name',
      required: true,
      icon: <User className="w-6 h-6 text-blue-600" />, 
      input: (
        <Input id="firstName" value={formData.firstName} onChange={e => {
          setFormData({ ...formData, firstName: e.target.value });
          setFormValidation({ ...formValidation, firstName: e.target.value.trim().length >= 2 });
        }} required className={`h-12 border-2 ${formValidation.firstName ? 'border-slate-200 focus:border-blue-500' : 'border-red-300 focus:border-red-500'} rounded-xl transition-colors`} placeholder="Enter first name" />
      ),
      valid: formValidation.firstName && formData.firstName.trim().length >= 2,
      error: !formValidation.firstName && formData.firstName ? 'First name must be at least 2 characters' : ''
    },
    {
      key: 'lastName',
      label: 'Last Name',
      required: true,
      icon: <User className="w-6 h-6 text-blue-600" />, 
      input: (
        <Input id="lastName" value={formData.lastName} onChange={e => {
          setFormData({ ...formData, lastName: e.target.value });
          setFormValidation({ ...formValidation, lastName: e.target.value.trim().length >= 2 });
        }} required className={`h-12 border-2 ${formValidation.lastName ? 'border-slate-200 focus:border-blue-500' : 'border-red-300 focus:border-red-500'} rounded-xl transition-colors`} placeholder="Enter last name" />
      ),
      valid: formValidation.lastName && formData.lastName.trim().length >= 2,
      error: !formValidation.lastName && formData.lastName ? 'Last name must be at least 2 characters' : ''
    },
    {
      key: 'dateOfBirth',
      label: 'Date of Birth',
      required: true,
      icon: <Calendar className="w-6 h-6 text-blue-600" />, 
      input: (
        <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={e => {
          setFormData({ ...formData, dateOfBirth: e.target.value });
          setFormValidation({ ...formValidation, dateOfBirth: e.target.value !== '' && new Date(e.target.value) < new Date() });
        }} required max={new Date().toISOString().split('T')[0]} className={`h-12 border-2 ${formValidation.dateOfBirth ? 'border-slate-200 focus:border-blue-500' : 'border-red-300 focus:border-red-500'} rounded-xl transition-colors`} />
      ),
      valid: formValidation.dateOfBirth && formData.dateOfBirth !== '' && new Date(formData.dateOfBirth) < new Date(),
      error: !formValidation.dateOfBirth && formData.dateOfBirth ? 'Please enter a valid birth date' : ''
    },
    {
      key: 'phone',
      label: 'Phone Number',
      required: true,
      icon: <Phone className="w-6 h-6 text-blue-600" />, 
      input: (
        <Input id="phone" value={formData.phone} onChange={e => {
          setFormData({ ...formData, phone: e.target.value });
          setFormValidation({ ...formValidation, phone: e.target.value.trim().length >= 10 });
        }} required className={`h-12 border-2 ${formValidation.phone ? 'border-slate-200 focus:border-blue-500' : 'border-red-300 focus:border-red-500'} rounded-xl transition-colors font-mono`} placeholder="Enter phone number" />
      ),
      valid: formValidation.phone && formData.phone.trim().length >= 10,
      error: !formValidation.phone && formData.phone ? 'Phone number must be at least 10 digits' : ''
    },
    {
      key: 'email',
      label: 'Email Address',
      required: false,
      icon: <Mail className="w-6 h-6 text-blue-600" />, 
      input: (
        <Input id="email" type="email" value={formData.email} onChange={e => {
          setFormData({ ...formData, email: e.target.value });
          setFormValidation({ ...formValidation, email: e.target.value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value) });
        }} className={`h-12 border-2 ${formValidation.email ? 'border-slate-200 focus:border-blue-500' : 'border-red-300 focus:border-red-500'} rounded-xl transition-colors`} placeholder="Enter email address (optional)" />
      ),
      valid: formValidation.email,
      error: !formValidation.email && formData.email ? 'Please enter a valid email address' : ''
    },
    {
      key: 'address',
      label: 'Address',
      required: false,
      icon: <MapPin className="w-6 h-6 text-blue-600" />, 
      input: (
        <Textarea id="address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors resize-none" placeholder="Enter full address (optional)" rows={3} />
      ),
      valid: true,
      error: ''
    },
    {
      key: 'referredBy',
      label: 'Referring Doctor',
      required: false,
      icon: <UserPlus className="w-6 h-6 text-blue-600" />, 
      input: (
        <Select value={formData.referredBy} onValueChange={value => setFormData({ ...formData, referredBy: value })}>
          <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-colors">
            <SelectValue placeholder="Select referring doctor (optional)" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.name}>
                <div className="flex flex-col">
                  <span className="font-medium">{doctor.name}</span>
                  <span className="text-xs text-slate-500">{doctor.specialization}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
      valid: true,
      error: ''
    }
  ];
  const [step, setStep] = useState(0);
  const current = steps[step];
  const canNext = current.valid;
  const isLast = step === steps.length - 1;
  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-6">
        {steps.map((s, idx) => (
          <div key={s.key} className={`w-3 h-3 rounded-full mx-1 transition-all duration-300 ${idx === step ? 'bg-blue-600 scale-125 shadow-lg' : 'bg-slate-300'}`}></div>
        ))}
      </div>
      <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-white/80 backdrop-blur-sm transition-all duration-300">
        <CardHeader className="flex flex-col items-center">
          <div className="mb-2">{current.icon}</div>
          <CardTitle className="text-xl font-bold text-slate-900 text-center">{current.label}{current.required && ' *'}</CardTitle>
          <CardDescription className="text-center text-slate-500">{step + 1} of {steps.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {current.input}
            {current.error && (
              <div className="flex items-center text-red-600 text-xs mt-1"><AlertCircle className="w-3 h-3 mr-1" />{current.error}</div>
            )}
            {current.key === 'dateOfBirth' && formData.dateOfBirth && formValidation.dateOfBirth && (
              <div className="flex items-center text-green-600 text-xs mt-1"><CheckCircle className="w-3 h-3 mr-1" />Age: {calculateAge(formData.dateOfBirth)} years</div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={() => {
          if (step === 0) {
            setIsDialogOpen(false);
            setStep(0);
            resetForm();
          } else {
            setStep(step - 1);
          }
        }} className="px-6 py-3 border-2 hover:bg-slate-50 rounded-xl">{step === 0 ? 'Cancel' : 'Back'}</Button>
        {!isLast ? (
          <Button type="button" disabled={!canNext} onClick={() => setStep(step + 1)} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 rounded-xl disabled:opacity-50">Next</Button>
        ) : (
          <Button type="submit" disabled={submitting || !canNext} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 rounded-xl disabled:opacity-50">
            {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registering Patient...</>) : (<><UserPlus className="w-4 h-4 mr-2" />Register Patient</>)}
          </Button>
        )}
      </div>
    </form>
  );
}

const Patients: React.FC = () => {
  const { user } = useAuth();
  const { formTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dateOfBirth: '', phone: '', email: '', address: '', referredBy: ''
  });
  const [formValidation, setFormValidation] = useState({
    firstName: true, lastName: true, dateOfBirth: true, phone: true, email: true
  });
  const { toast } = useToast();
  const canEdit = ['ADMIN', 'RECEPTIONIST'].includes(user?.role || '');
  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      const [patientsRes, doctorsRes] = await Promise.all([
        apiClient.getPatients({ search: searchTerm, limit: 50 }),
        apiClient.getDoctors({ limit: 100 })
      ]);
      setPatients(patientsRes.patients);
      setDoctors(doctorsRes.doctors);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally { setLoading(false); }
  };
  useEffect(() => {
    const debounceTimer = setTimeout(() => { if (searchTerm !== '') { loadPatients(); } }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);
  const loadPatients = async () => {
    try {
      const response = await apiClient.getPatients({ search: searchTerm, limit: 50 });
      setPatients(response.patients);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load patients", variant: "destructive" });
    }
  };
  const validateForm = () => {
    const validation = {
      firstName: formData.firstName.trim().length >= 2,
      lastName: formData.lastName.trim().length >= 2,
      dateOfBirth: formData.dateOfBirth !== '' && new Date(formData.dateOfBirth) < new Date(),
      phone: formData.phone.trim().length >= 10,
      email: formData.email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    };
    setFormValidation(validation);
    return Object.values(validation).every(Boolean);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: "Validation Error", description: "Please check all required fields and correct any errors", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.createPatient({
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth),
        email: formData.email || undefined,
        address: formData.address || undefined,
        referredBy: formData.referredBy || undefined
      });
      toast({ title: "Success", description: "Patient registered successfully" });
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to register patient", variant: "destructive" });
    } finally { setSubmitting(false); }
  };
  const resetForm = () => {
    setFormData({ firstName: '', lastName: '', dateOfBirth: '', phone: '', email: '', address: '', referredBy: '' });
    setFormValidation({ firstName: true, lastName: true, dateOfBirth: true, phone: true, email: true });
  };
  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const calculateAge = (dateOfBirth: Date | string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
  };
  const stats = [
    { title: 'Total Patients', value: patients.length, icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Active Today', value: patients.filter(p => new Date(p.createdAt).toDateString() === new Date().toDateString()).length, icon: UserPlus, color: 'from-green-500 to-green-600' },
    { title: 'This Month', value: patients.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).length, icon: Calendar, color: 'from-purple-500 to-purple-600' },
    { title: 'With Orders', value: patients.filter(p => p.orders && p.orders.length > 0).length, icon: CheckCircle, color: 'from-orange-500 to-orange-600' }
  ];
  return (
    <div className="p-8 space-y-8 min-h-full bg-gradient-to-b from-transparent to-slate-50/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-900 to-indigo-700 bg-clip-text text-transparent">Patient Management</h1>
          <p className="text-slate-500 mt-1 text-lg">Manage patient records and registrations</p>
        </div>
        {canEdit && (
          <Dialog open={isDialogOpen} onOpenChange={open => {
            setIsDialogOpen(open);
            if (!open) { resetForm(); }
          }}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Register New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="flex flex-col items-center pb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg mb-3 animate-pulse-slow">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <DialogTitle className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight text-center">
                  Register New Patient
                </DialogTitle>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold shadow-sm mb-1">Step-by-step</span>
                <DialogDescription className="text-center text-base text-slate-500">
                  Add a new patient to the system with complete information
                </DialogDescription>
              </DialogHeader>
              {formTheme === 'modern' ? (
                <ModernPatientForm
                  formData={formData}
                  setFormData={setFormData}
                  formValidation={formValidation}
                  setFormValidation={setFormValidation}
                  submitting={submitting}
                  handleSubmit={handleSubmit}
                  resetForm={resetForm}
                  isDialogOpen={isDialogOpen}
                  setIsDialogOpen={setIsDialogOpen}
                  doctors={doctors}
                  calculateAge={calculateAge}
                />
              ) : (
                <ProfessionalPatientForm
                  formData={formData}
                  setFormData={setFormData}
                  formValidation={formValidation}
                  setFormValidation={setFormValidation}
                  submitting={submitting}
                  handleSubmit={handleSubmit}
                  resetForm={resetForm}
                  isDialogOpen={isDialogOpen}
                  setIsDialogOpen={setIsDialogOpen}
                  doctors={doctors}
                  calculateAge={calculateAge}
                />
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-xl border-0 bg-gradient-to-br from-white via-slate-50 to-blue-50 hover:scale-105 transition-transform duration-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Search and Filters */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search patients by name, code, phone, or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white transition-colors rounded-xl shadow-sm"
              />
            </div>
            <Button variant="outline" className="h-12 px-6 border-2 hover:bg-blue-50 rounded-xl flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Patients Grid */}
      {loading ? (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-xl text-slate-600 font-medium">Loading patients...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="group rounded-2xl shadow-lg border-0 bg-white/95 hover:shadow-2xl transition-all duration-300">
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl w-14 h-14 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {patient.firstName[0]}{patient.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-slate-900">{patient.firstName} {patient.lastName}</h3>
                        <Badge variant="secondary" className="font-mono">{patient.patientCode}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-slate-500 text-sm mt-1">
                        <span>Age: <span className="font-semibold">{calculateAge(patient.dateOfBirth)}</span></span>
                        <span className="font-mono flex items-center"><Phone className="w-4 h-4 mr-1" />{patient.phone}</span>
                      </div>
                      {/* Expandable section for more info */}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-blue-600 hover:underline">Show More</summary>
                        <div className="mt-2 space-y-1 text-xs text-slate-500">
                          {patient.email && (<div className="flex items-center"><Mail className="w-3 h-3 mr-1" />{patient.email}</div>)}
                          {patient.address && (<div className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{patient.address}</div>)}
                          {patient.referredBy && (<div className="flex items-center"><UserPlus className="w-3 h-3 mr-1" />Referred by: {patient.referredBy}</div>)}
                          <div>Registered: {format(new Date(patient.createdAt), 'MMM dd, yyyy')}</div>
                        </div>
                      </details>
                    </div>
                    <div className="flex flex-col gap-2 ml-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="hover:bg-blue-50"
                        title="View Details"
                      >
                        <Link to={`/patients/${patient.id}`}>
                          <Eye className="w-5 h-5" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-green-50" title="Create Order">
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {!loading && filteredPatients.length === 0 && (
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-md rounded-2xl">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-xl text-slate-600 font-medium mb-1">No patients found</p>
                  <p className="text-slate-500 mb-4">{canEdit ? 'Try adjusting your search terms or register a new patient' : 'Try adjusting your search terms'}</p>
                  {canEdit && (
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-6 py-3">
                      <UserPlus className="w-4 h-4 mr-2" /> Register New Patient
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Patients;
