import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { DentistContext } from "../../context/DentistContext";
import PatientModal from "../../components/PatientModal";
import { formatAnyDateTimeDMY, formatMoney } from "../../../../shared/date.js";
import profilePic from "../../assets/profile_pic.png";
import { normalizeText } from "../../utils/text";

const toImgUrl = (backendUrl, img) => {
  const s = String(img || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) return backendUrl + s;
  return backendUrl + "/" + s;
};

const DentistPatients = () => {
  const { backendUrl, dToken, patients, loadPatients } =
    useContext(DentistContext);

  const [search, setSearch] = useState("");
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [openingPatientId, setOpeningPatientId] = useState("");
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (dToken) loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dToken]);

  const filtered = useMemo(() => {
    const list = Array.isArray(patients) ? patients : [];
    const term = search.trim().toLowerCase();
    if (!term) return list;

    const digits = term.replace(/\D/g, "");
    const normTerm = normalizeText(term);

    return list.filter((p) => {
      const rawName = p?.name || "";
      const rawPatientId = p?.patientId || "";
      const rawAddress = [p?.address?.line1, p?.address?.line2].filter(Boolean).join(" ");
      const rawAllergy = p?.allergy || "";
      const rawWarnings = p?.medicalWarnings || "";
      const rawNote = p?.note || "";
      const nameLc = rawName.toLowerCase();
      const patientIdLc = rawPatientId.toLowerCase();
      const addressLc = rawAddress.toLowerCase();
      const allergyLc = rawAllergy.toLowerCase();
      const warningsLc = rawWarnings.toLowerCase();
      const noteLc = rawNote.toLowerCase();
      const nameNorm = normalizeText(rawName);
      const patientIdNorm = normalizeText(rawPatientId);
      const addressNorm = normalizeText(rawAddress);
      const phone = String(p?.phone || "").replace(/\D/g, "");

      return (
        nameLc.includes(term) ||
        patientIdLc.includes(term) ||
        addressLc.includes(term) ||
        allergyLc.includes(term) ||
        warningsLc.includes(term) ||
        noteLc.includes(term) ||
        (normTerm && nameNorm.includes(normTerm)) ||
        (normTerm && patientIdNorm.includes(normTerm)) ||
        (normTerm && addressNorm.includes(normTerm)) ||
        (digits && phone.includes(digits))
      );
    });
  }, [patients, search]);

  const openPatient = async (userId) => {
    if (!userId || !dToken || openingPatientId) return;

    setLoadingPatient(true);
    setOpeningPatientId(String(userId));
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/dentist/patient-history/${userId}`,
        { headers: { dtoken: dToken } },
      );

      if (!data?.success) return;

      setSelectedPatient({
        patient: data.patient,
        totals: data.totals || {
          totalDebt: 0,
          totalAmount: 0,
          totalPaid: 0,
        },
        history: Array.isArray(data.history) ? data.history : [],
      });

      setPatientModalOpen(true);
    } catch (error) {
      console.error("Patient open error:", error);
    } finally {
      setLoadingPatient(false);
      setOpeningPatientId("");
    }
  };

  const hasPatients = filtered.length > 0;

  return (
    <main className="w-full px-4 py-5 flex justify-center">
      <section className="w-full max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Bemorlar</h1>
            <p className="text-xs text-gray-500 mt-1">
              Stomatolog bo‘yicha biriktirilgan bemorlar ro‘yxati
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Ism yoki telefon..."
              className="w-full sm:w-64 h-9 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Link
              to="/dentist-patients/create"
              className="h-9 inline-flex items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              + Bemor
            </Link>
          </div>
        </div>

        {!hasPatients ? (
          <div className="rounded-2xl border bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Bemorlar topilmadi
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Hozircha sizga biriktirilgan bemor yo‘q yoki qidiruv bo‘yicha
              natija topilmadi.
            </p>

            <div className="mt-4">
              <Link
                to="/dentist-patients/create"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Yangi bemor qo‘shish
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const patientId = p?.userId || p?._id || "";
              const lastVisit =
                p?.lastVisitAt || p?.lastVisitDate || p?.updatedAt;

              return (
                <div
                  key={patientId}
                  className="border rounded-xl p-4 bg-white hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={toImgUrl(backendUrl, p?.image) || profilePic}
                      alt={p?.name || "Bemor"}
                      className="w-10 h-10 rounded-full object-cover"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p?.patientId ? `${p.patientId} — ` : ""}{p?.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {p?.phone}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-2">
                    Oxirgi tashrif:{" "}
                    {lastVisit ? formatAnyDateTimeDMY(lastVisit) : "—"}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-[11px] text-gray-500">Tashriflar</p>
                      <p className="text-sm font-semibold">
                        {p?.visitsCount || 0}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-[11px] text-gray-500">Qarz</p>
                      <p className="text-sm font-semibold text-red-500">
                        {formatMoney(p?.totalDebt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openPatient(patientId)}
                      className="flex-1 h-8 text-xs border rounded-lg"
                      disabled={loadingPatient || openingPatientId === String(patientId)}
                    >
                      Batafsil
                    </button>

                    <button
                      onClick={() => openPatient(patientId)}
                      className="flex-1 h-8 text-xs bg-primary text-white rounded-lg disabled:opacity-60"
                      disabled={loadingPatient || openingPatientId === String(patientId)}
                    >
                      {openingPatientId === String(patientId) ? "Yuklanmoqda..." : "Ochish"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <PatientModal
        open={patientModalOpen}
        onClose={() => {
          setPatientModalOpen(false);
          setSelectedPatient(null);
        }}
        data={selectedPatient}
        backendUrl={backendUrl}
        authToken={dToken}
        authHeaderName="dtoken"
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

export default DentistPatients;
