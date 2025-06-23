import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, FileText, TestTube, Droplet, Link2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';

const PatientDetail: React.FC = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await apiClient.getPatientById(id!);
      setPatient(data.patient);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!patient) return <div className="text-center py-20 text-slate-500">Patient not found.</div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Side Nav */}
      <aside className="w-64 bg-gradient-to-b from-blue-700 to-indigo-800 text-white flex flex-col py-8 px-6 shadow-xl">
        <Link to="/patients" className="flex items-center mb-8 text-blue-100 hover:text-white">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Patients
        </Link>
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-3xl font-bold shadow-lg mb-2">
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div className="text-xl font-bold">{patient.firstName} {patient.lastName}</div>
          <Badge variant="secondary" className="mt-2">{patient.patientCode}</Badge>
        </div>
        <div className="mt-8 space-y-2 text-sm">
          <div><span className="font-semibold">Age:</span> {patient.age}</div>
          <div><span className="font-semibold">Phone:</span> {patient.phone}</div>
          {patient.email && <div><span className="font-semibold">Email:</span> {patient.email}</div>}
          {patient.address && <div><span className="font-semibold">Address:</span> {patient.address}</div>}
          {patient.referredBy && <div><span className="font-semibold">Referred By:</span> {patient.referredBy}</div>}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Patient Details</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patient Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><span className="font-semibold">Full Name:</span> {patient.firstName} {patient.lastName}</div>
              <div><span className="font-semibold">Patient Code:</span> {patient.patientCode}</div>
              <div><span className="font-semibold">Date of Birth:</span> {format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}</div>
              <div><span className="font-semibold">Phone:</span> {patient.phone}</div>
              {patient.email && <div><span className="font-semibold">Email:</span> {patient.email}</div>}
              {patient.address && <div><span className="font-semibold">Address:</span> {patient.address}</div>}
              {patient.referredBy && <div><span className="font-semibold">Referred By:</span> {patient.referredBy}</div>}
              <div><span className="font-semibold">Registered:</span> {format(new Date(patient.createdAt), 'MMM dd, yyyy')}</div>
            </CardContent>
          </Card>

          {/* Test Orders History */}
          <Card>
            <CardHeader>
              <CardTitle>Test Orders & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.orders && patient.orders.length > 0 ? (
                <div className="space-y-4">
                  {patient.orders.map((order: any) => (
                    <div key={order.id} className="p-4 rounded-xl bg-slate-50 border flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <TestTube className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold">Order #{order.orderNumber}</span>
                        <Badge variant="outline" className="ml-2">{order.status}</Badge>
                      </div>
                      <div className="text-xs text-slate-500">Ordered: {format(new Date(order.createdAt), 'MMM dd, yyyy')}</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Link to={`/orders/${order.id}`} className="inline-flex items-center text-blue-600 hover:underline text-xs">
                          <FileText className="w-4 h-4 mr-1" /> Order Details
                        </Link>
                        {order.sampleId && (
                          <Link to={`/samples/${order.sampleId}`} className="inline-flex items-center text-indigo-600 hover:underline text-xs">
                            <Droplet className="w-4 h-4 mr-1" /> Sample
                          </Link>
                        )}
                        {order.reportId && (
                          <Link to={`/reports/${order.reportId}`} className="inline-flex items-center text-green-600 hover:underline text-xs">
                            <Link2 className="w-4 h-4 mr-1" /> Report
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-sm">No test orders found for this patient.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PatientDetail;