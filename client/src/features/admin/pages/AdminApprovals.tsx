import { useState } from 'react';
import { useApprovalRequests, useApproveRequest } from '../hooks/useAdminData';
import { Clock, CheckCircle, XCircle, FileText, Calendar, User as UserIcon } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { DataTable } from '../../../shared/components/DataTable';
import { Button } from '../../../shared/components/Button';
import { useNotificationStore } from '../../../shared/store/notificationStore';

const AdminApprovals = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const { data: response, isLoading } = useApprovalRequests({ 
    page, limit, status: 'pending' 
  });

  const approveMutation = useApproveRequest();
  const { showNotification } = useNotificationStore();

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    const adminNote = prompt(`Tambahkan catatan untuk ${status}:`);
    approveMutation.mutate({ id, data: { status, adminNote: adminNote || '' } }, {
      onSuccess: () => showNotification(`Pengajuan berhasil di-${status}`, 'success'),
      onError: () => showNotification('Gagal memproses approval', 'error')
    });
  };

  const requests = response?.data || [];
  const meta = response?.meta;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'custom_pembelajaran': return { label: 'Custom', color: 'bg-purple-100 text-purple-600' };
      case 'koreksi': return { label: 'Koreksi', color: 'bg-blue-100 text-blue-600' };
      case 'perizinan': return { label: 'Izin', color: 'bg-orange-100 text-orange-600' };
      case 'lembur': return { label: 'Lembur', color: 'bg-indigo-100 text-indigo-600' };
      default: return { label: type, color: 'bg-slate-100 text-slate-600' };
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden p-8">
        <header className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Approval Guru</h2>
            <p className="text-slate-500 font-medium">Verifikasi pengajuan pembelajaran custom, koreksi, izin, dan lembur.</p>
          </div>
          <div className="bg-amber-50 text-amber-600 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest border border-amber-100 shadow-sm flex items-center gap-2">
            <Clock size={18} />
            {meta?.total || 0} Menunggu Approval
          </div>
        </header>

        <div className="flex-1 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col min-h-0">
          <DataTable 
            data={requests}
            isLoading={isLoading}
            emptyMessage="Tidak ada antrean approval."
            className="border-none shadow-none rounded-none flex-1 min-h-0"
            meta={meta}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            columns={[
              {
                header: 'Guru / Tipe',
                accessor: (req: any) => {
                  const typeInfo = getTypeLabel(req.type);
                  return (
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm leading-tight">{req.User?.name || 'Unknown'}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                    </div>
                  );
                }
              },
              {
                header: 'Detail Pengajuan',
                accessor: (req: any) => (
                  <div className="max-w-xs">
                    {req.type === 'koreksi' && (
                      <p className="text-xs font-bold text-slate-600">
                        Revisi jam ke: <span className="text-primary">{new Date(req.data.requestedTimestamp).toLocaleTimeString('id-ID')}</span>
                      </p>
                    )}
                    {req.type === 'perizinan' && (
                      <p className="text-xs font-bold text-slate-600 capitalize">
                        {req.data.absenceType}: <span className="text-primary font-medium italic">"{req.data.reason}"</span>
                      </p>
                    )}
                    {req.type === 'custom_pembelajaran' && (
                      <p className="text-xs font-bold text-slate-600">
                        Pembelajaran diluar jadwal rutin
                      </p>
                    )}
                    {req.type === 'lembur' && (
                      <p className="text-xs font-bold text-slate-600">
                        Alasan: <span className="text-primary font-medium">"{req.data.reason}"</span>
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )
              },
              {
                header: 'Evidence / Tugas',
                accessor: (req: any) => (
                  <div className="flex flex-col gap-2">
                    {req.data.photoSelfie && (
                      <div className="flex gap-1">
                        <a href={`${import.meta.env.VITE_UPLOAD_URL}/${req.data.photoSelfie}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg overflow-hidden border">
                          <img src={`${import.meta.env.VITE_UPLOAD_URL}/${req.data.photoSelfie}`} className="w-full h-full object-cover" alt="Selfie" />
                        </a>
                        {req.data.photoClass && (
                          <a href={`${import.meta.env.VITE_UPLOAD_URL}/${req.data.photoClass}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg overflow-hidden border">
                            <img src={`${import.meta.env.VITE_UPLOAD_URL}/${req.data.photoClass}`} className="w-full h-full object-cover" alt="Class" />
                          </a>
                        )}
                      </div>
                    )}
                    {req.data.taskNote && (
                      <div className="flex items-start gap-1 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-[150px]">
                        <FileText size={12} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-slate-600 leading-tight italic">"{req.data.taskNote}"</p>
                      </div>
                    )}
                  </div>
                )
              },
              {
                header: 'Aksi',
                headerClassName: 'text-right',
                accessor: (req: any) => (
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none rounded-xl h-10 px-4 transition-all"
                      onClick={() => handleAction(req.id, 'approved')}
                      isLoading={approveMutation.isPending}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:bg-red-50 border-slate-100 rounded-xl h-10 px-4 transition-all"
                      onClick={() => handleAction(req.id, 'rejected')}
                      isLoading={approveMutation.isPending}
                    >
                      <XCircle size={16} className="mr-2" />
                      Reject
                    </Button>
                  </div>
                )
              }
            ]}
          />
        </div>
      </main>
    </div>
  );
};

export default AdminApprovals;
