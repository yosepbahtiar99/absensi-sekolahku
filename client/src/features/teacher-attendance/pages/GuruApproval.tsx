import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyRequests } from '../hooks/useAttendanceData';
import { CheckCircle, XCircle, Clock, Calendar, Plus, FileText, Info, Eye } from 'lucide-react';
import { DataTable } from '../../../shared/components/DataTable';
import { Button } from '../../../shared/components/Button';

const GuruApproval = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: response, isLoading } = useMyRequests({ page, limit });

  const requests = response?.data || [];
  const meta = response?.meta;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={14} />;
      case 'rejected': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'custom_pembelajaran': return 'Custom';
      case 'koreksi': return 'Koreksi';
      case 'perizinan': return 'Izin/Sakit';
      case 'lembur': return 'Lembur';
      default: return type;
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 p-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Status Pengajuan</h2>
          <p className="text-slate-500 font-medium">Pantau status izin, koreksi, dan lembur lu di sini.</p>
        </div>
        <Button 
          onClick={() => navigate('/requests/create')}
          className="rounded-2xl px-6 py-6 shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus size={20} />
          Buat Pengajuan
        </Button>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden flex flex-col min-h-0">
        <DataTable 
          data={requests}
          isLoading={isLoading}
          emptyMessage="Belum ada pengajuan."
          className="border-none shadow-none rounded-none flex-1 min-h-0"
          meta={meta}
          onPageChange={setPage}
          onLimitChange={setLimit}
          columns={[
            {
              header: 'Tipe & Tanggal',
              accessor: (req: any) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">
                      {getTypeLabel(req.type)}
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 tabular-nums">
                      {new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              )
            },
            {
              header: 'Detail Pengajuan',
              accessor: (req: any) => (
                <div className="max-w-xs">
                   {req.type === 'koreksi' && (
                     <p className="text-xs font-medium text-slate-600">Revisi jam ke {new Date(req.data.requestedTimestamp).toLocaleTimeString('id-ID')}</p>
                   )}
                   {req.type === 'perizinan' && (
                     <p className="text-xs font-medium text-slate-600">{req.data.absenceType}: {req.data.reason}</p>
                   )}
                   {req.type === 'lembur' && (
                     <p className="text-xs font-medium text-slate-600 truncate">{req.data.reason}</p>
                   )}
                   {req.data.taskNote && (
                     <div className="flex items-center gap-1 text-[10px] text-primary font-bold mt-1">
                        <FileText size={10} />
                        Ada Catatan Tugas
                     </div>
                   )}
                </div>
              )
            },
            {
              header: 'Status',
              accessor: (req: any) => (
                <div className="space-y-1">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(req.status)}`}>
                    {getStatusIcon(req.status)}
                    {req.status}
                  </div>
                  {req.adminNote && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 italic">
                       <Info size={10} />
                       {req.adminNote}
                    </div>
                  )}
                </div>
              )
            },
            {
              header: 'Aksi',
              headerClassName: 'text-right',
              accessor: () => (
                <div className="flex justify-end">
                   <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                      <Eye size={16} className="text-slate-400" />
                   </Button>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
};

export default GuruApproval;
