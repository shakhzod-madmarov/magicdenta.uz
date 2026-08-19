import { useState, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminContext } from '../context/AdminContext';

const DualPasswordModal = ({ onConfirm, onCancel, title, description, dentistId }) => {
  const { backendUrl, aToken, dentists, getAllDentists } = useContext(AdminContext);
  const [adminPass, setAdminPass] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(dentistId || '');
  const [doctorPass, setDoctorPass] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dentists || dentists.length === 0) {
      getAllDentists?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllDentists]);

  useEffect(() => {
    if (dentistId) {
      setSelectedDoctorId(dentistId);
    }
  }, [dentistId]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // 30 seconds inactivity timeout
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        toast.info("Faolsizlik tufayli oyna yopildi");
        onCancel();
      }, 30000); // 30 seconds
    };

    resetTimer();

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [onCancel]);

  // Close on page/route navigation
  useEffect(() => {
    const handleLocationChange = () => {
      onCancel();
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [onCancel]);

  const activeDoctors = (dentists || []).filter((d) => d.isActive !== false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminPass.trim()) { toast.warning('Administrator parolini kiriting'); return; }
    if (!selectedDoctorId) { toast.warning('Shifokorni tanlang'); return; }
    if (!doctorPass.trim()) { toast.warning('stomatolog parolini kiriting'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + '/api/admin/verify-password/admin-and-dentist',
        { adminPassword: adminPass, dentistId: selectedDoctorId, dentistPassword: doctorPass },
        { headers: { Authorization: 'Bearer ' + aToken } }
      );
      if (data.success) {
        onConfirm();
      } else {
        toast.error(data.message || 'Parol notogri');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return createPortal(
    <div onClick={handleOverlayClick} className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl transition-all duration-300">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              {title || 'Harakatni tasdiqlash'}
            </h3>
          </div>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-700 font-bold text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed border-l-2 border-primary/40 pl-3">
            {description || "Ushbu harakatni tasdiqlash uchun administrator paroli va masul stomatolog paroli talab etiladi."}
          </p>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Administrator paroli</label>
            <input
              type="password"
              required
              autoFocus
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Masul stomatolog</label>
            {selectedDoctorId && activeDoctors.some(d => d._id === selectedDoctorId) ? (
              <div className="w-full border border-slate-200 bg-slate-50/80 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-black border-l-4 border-l-primary">
                {activeDoctors.find(d => d._id === selectedDoctorId)?.name}
              </div>
            ) : (
              <select
                required
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold bg-white"
                disabled={loading}
              >
                <option value="">Shifokorni tanlang</option>
                {activeDoctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}{d.speciality ? ' (' + d.speciality + ')' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">stomatolog paroli</label>
            <input
              type="password"
              required
              value={doctorPass}
              onChange={(e) => setDoctorPass(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 border border-slate-200 text-slate-500 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-50 active:scale-95 transition-all"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all"
            >
              {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default DualPasswordModal;
