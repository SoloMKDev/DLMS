import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, User, FileText, TestTube, Droplet, Link2, Calendar, Phone, Mail, MapPin, UserPlus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Layout from '@/components/Layout';

const EntityDetail: React.FC = () => {
  const { entity, id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let result;
      try {
        switch (entity) {
          case 'patients':
            result = await apiClient.getPatient?.(id!);
            break;
          case 'orders':
            result = await apiClient.getOrder?.(id!);
            break;
          case 'samples':
            result = await apiClient.getSample?.(id!);
            break;
          case 'reports':
            result = await apiClient.getReport?.(id!);
            break;
          default:
            result = null;
        }
      } catch (e) {
        result = null;
      }
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [entity, id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-20 text-slate-500">Not found.</div>
      </Layout>
    );
  }

  // Patient Detail Example
  if (entity === 'patients') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-10 space-y-8">
          {/* Profile Card */}
          <Card className="flex flex-col md:flex-row items-center gap-8 p-6 shadow-lg">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                {data.firstName[0]}{data.lastName[0]}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{data.firstName} {data.lastName}</h2>
                <Badge variant="secondary" className="font-mono">{data.patientCode}</Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-slate-600 text-sm">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(data.dateOfBirth), 'MMM dd, yyyy')}</span>
                <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {data.phone}</span>
                {data.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {data.email}</span>}
                {data.address && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {data.address}</span>}
                {data.referredBy && <span className="flex items-center gap-1"><UserPlus className="w-4 h-4" /> {data.referredBy}</span>}
              </div>
              <div className="text-xs text-slate-400 mt-2">Registered: {format(new Date(data.createdAt), 'MMM dd, yyyy')}</div>
            </div>
          </Card>

          {/* Orders & Reports Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Test Orders & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {data.orders && data.orders.length > 0 ? (
                <ol className="relative border-l border-blue-200 ml-4">
                  {data.orders.map((order: any) => (
                    <li key={order.id} className="mb-8 ml-6">
                      <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-8 ring-white">
                        <TestTube className="w-4 h-4 text-blue-600" />
                      </span>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <span className="font-semibold">Order #{order.orderNumber}</span>
                          <Badge variant="outline" className="ml-2">{order.status}</Badge>
                          <div className="text-xs text-slate-500">Ordered: {format(new Date(order.createdAt), 'MMM dd, yyyy')}</div>
                        </div>
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
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="text-slate-500 text-sm">No test orders found for this patient.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // You can apply similar card/timeline patterns for orders, samples, and reports below...

  // Fallback for other entities
  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="capitalize">{entity?.slice(0, -1)} Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-slate-700 bg-slate-50 rounded p-4 overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EntityDetail;