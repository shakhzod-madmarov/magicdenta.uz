import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";

const DentistsList = () => {
  const { dentists, aToken, getAllDentists, backendUrl } =
    useContext(AdminContext);

  useEffect(() => {
    if (aToken) getAllDentists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken]);

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 py-10 px-4 sm:px-8">
      <section aria-label="Stomatologlar roʻyxati" className="w-full max-w-6xl mx-auto space-y-6">
        
        {/* Header Block */}
        <header className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <div>
              <h1 className="text-2xl font-black text-slate-800">Stomatologlar</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Klinika shifokorlari va mutaxassislarini boshqarish</p>
            </div>
          </div>
          <Link
            to="/add-dentists"
            className="shrink-0 flex items-center justify-center gap-2 py-3 px-5 bg-primary text-white font-bold rounded-2xl text-xs transition-all hover:bg-primary/95 shadow-md shadow-primary/10 active:scale-98"
          >
            + Yangi stomatolog qo'shish
          </Link>
        </header>

        {dentists?.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <p className="text-slate-500 font-bold text-lg">
              Hozircha stomatologlar mavjud emas.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {dentists.map((dentist, index) => {
              const specialityText = Array.isArray(dentist.speciality)
                ? dentist.speciality.join(", ")
                : dentist.speciality || "Mutaxassislik ko‘rsatilmagan";

              return (
                <li key={dentist._id || index} className="flex justify-center">
                  <Link
                    to={`/all-dentists/${dentist._id}`}
                    className="w-full max-w-sm bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-lg transition"
                    aria-label={`${dentist.name} Akkauntga o‘tish`}
                  >
                    <figure className="mb-5">
                      <img
                        src={
                          dentist.image
                            ? (dentist.image.startsWith("http") ? dentist.image : backendUrl + dentist.image)
                            : "/doctor-placeholder.svg"
                        }
                        alt={dentist.name}
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-primary/10 shadow-sm bg-slate-100"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/doctor-placeholder.svg";
                        }}
                      />
                    </figure>
                    <div className="mb-1">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                        {index + 1}. {dentist.name}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600 italic">
                      {specialityText}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
};

export default DentistsList;
