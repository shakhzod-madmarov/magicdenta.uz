import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import PatientModal from "../../components/PatientModal";
import { formatDateTimeISO, formatMoneyPlain } from "../../../../shared/date.js";
import profilePic from "../../assets/profile_pic.png";
import { normalizeText } from "../../utils/text";

const digitsOnly = (v) => String(v ?? "").replace(/\D/g, "");
const fmtMoney = (n) => formatMoneyPlain(n);

const Patients = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const authHeader = { headers: { atoken: aToken } };

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [loading, setLoading] = useState(true);
  const [openingPatientId, setOpeningPatientId] = useState("");

  const loadPatients = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/admin/patients`,
        authHeader,
      );

      if (!data?.success) {
        toast.error(data?.message || "Xatolik");
        return;
      }

      setPatients(data.patients || []);
    } catch {
      toast.error("Bemorlar ro‘yxatini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const openPatient = async (p) => {
    if (!p?._id || openingPatientId) return;

    try {
      setOpeningPatientId(String(p._id));
      const { data } = await axios.get(
        `${backendUrl}/api/admin/patients/${p._id}`,
        authHeader,
      );

      if (!data?.success) {
        toast.error(data?.message || "Xatolik");
        return;
      }

      setSelectedPatient(data);
      setModalOpen(true);
    } catch {
      toast.error("Bemor maʼlumotlarini yuklashda xatolik");
    } finally {
      setOpeningPatientId("");
    }
  };

  useEffect(() => {
    if (aToken) loadPatients();
  }, [aToken]);

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;

    const term = search.toLowerCase();
    const dig = digitsOnly(term);
    const normTerm = normalizeText(term);

    return patients.filter((p) => {
      const rawName = p.name || "";
      const rawPid = p.patientId || "";
      const rawAllergy = p.allergy || "";
      const rawWarnings = p.medicalWarnings || "";
      const rawNote = p.note || "";
      const rawAddr1 = p.address?.line1 || "";
      const rawAddr2 = p.address?.line2 || "";
      const name = rawName.toLowerCase();
      const pid = rawPid.toLowerCase();
      const allergy = rawAllergy.toLowerCase();
      const warnings = rawWarnings.toLowerCase();
      const note = rawNote.toLowerCase();
      const addr1 = rawAddr1.toLowerCase();
      const addr2 = rawAddr2.toLowerCase();
      const phone = digitsOnly(p.phone || "");

      const nameNorm = normalizeText(rawName);
      const pidNorm = normalizeText(rawPid);
      const allergyNorm = normalizeText(rawAllergy);
      const warningsNorm = normalizeText(rawWarnings);
      const noteNorm = normalizeText(rawNote);
      const addr1Norm = normalizeText(rawAddr1);
      const addr2Norm = normalizeText(rawAddr2);

      return (
        name.includes(term) ||
        pid.includes(term) ||
        allergy.includes(term) ||
        warnings.includes(term) ||
        note.includes(term) ||
        addr1.includes(term) ||
        addr2.includes(term) ||
        (normTerm && nameNorm.includes(normTerm)) ||
        (normTerm && pidNorm.includes(normTerm)) ||
        (normTerm && allergyNorm.includes(normTerm)) ||
        (normTerm && warningsNorm.includes(normTerm)) ||
        (normTerm && noteNorm.includes(normTerm)) ||
        (normTerm && addr1Norm.includes(normTerm)) ||
        (normTerm && addr2Norm.includes(normTerm)) ||
        (dig && phone.includes(dig))
      );
    });
  }, [patients, search]);

  return (
    <main className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">Bemorlar</h1>
            <p className="text-sm text-gray-600">
              Admin bemor ma’lumotlarini tahrirlashi mumkin.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              className="border rounded-lg px-4 py-2 text-sm w-72"
              placeholder="Qidirish: B-ID, ism yoki telefon"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Link
              to="/admin-patients/create"
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              + Bemor
            </Link>
          </div>
        </header>
        <div className="bg-white rounded-2xl shadow divide-y">
          {loading ? (
            <p className="p-6 text-gray-500">Yuklanmoqda...</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-gray-500">Bemor topilmadi</p>
          ) : (
            filtered.map((p) => (
              <button
                key={p._id}
                onClick={() => openPatient(p)}
                disabled={Boolean(openingPatientId)}
                className="w-full flex items-center gap-4 p-4 hover:bg-primary/5 transition text-left disabled:opacity-60"
              >
                <img
                  src={p.image ? `${backendUrl}${p.image}` : profilePic}
                  alt={p.name}
                  className="w-12 h-12 rounded-full object-cover border"
                  onError={(e) => {
                    e.currentTarget.src = profilePic;
                  }}
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {openingPatientId === String(p._id) ? "Yuklanmoqda..." : `${p.patientId} — ${p.name}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {p.phone || "Telefon yo‘q"}
                    {p.lastVisit && (
                      <>
                        {" "}
                        · Oxirgi kelish:{" "}
                        <span className="font-medium">
                          {formatDateTimeISO(p.lastVisit)}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Qarz</p>
                  <p className="font-bold text-red-600">
                    {fmtMoney(p.totalDebt)} so‘m
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <PatientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={selectedPatient}
        backendUrl={backendUrl}
        authToken={aToken}
        authHeaderName="atoken"
        onPatientUpdated={(patientPatch) => {
          setSelectedPatient((prev) =>
            prev
              ? {
                  ...prev,
                  patient: {
                    ...prev.patient,
                    ...(patientPatch || {}),
                  },
                }
              : prev,
          );
          loadPatients();
        }}
      />
    </main>
  );
};

export default Patients;
