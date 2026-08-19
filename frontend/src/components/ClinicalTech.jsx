const equipmentList = [
  {
    title: "3D Raqamli Kompyuter Tomografiyasi",
    brand: "Planmeca 3D (Finland)",
    desc: "Jag' suyagi, nerv kanallari va ildizlarni 100% mikron darajasida xatosiz 3D tahlil qilish imkoniyati.",
    tag: "3D TASHXIS",
    icon: (
      <svg className="w-8 h-8 text-[#91008D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Carl Zeiss Dental Mikroskopi",
    brand: "Carl Zeiss (Germany)",
    desc: "Murakkab tish kanallarini 25 karra kattalashtirish ostida xavfsiz va tishni saqlab qolgan holda davolash.",
    tag: "MIKRO-TERAPIYA",
    icon: (
      <svg className="w-8 h-8 text-[#403D88]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: "Kompyuterli Nozik Anesteziya",
    brand: "QuickSleeper (France)",
    desc: "Ukol og'rig'isiz, nozik dozalangan kompyuter nazorati orqali tishni tez va qulay uyushtirish tizimi.",
    tag: "OG'RIQSIZ TIZIM",
    icon: (
      <svg className="w-8 h-8 text-[#92003A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "5 Bosqichli Melag Autoclave Sterilizatsiyasi",
    brand: "Melag Class B (Germany)",
    desc: "134°C harorat va vakuumpress ostida 100% mutlaq xavfsiz gigiyena va viruslardan himoya.",
    tag: "100% STERILLIK",
    icon: (
      <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const ClinicalTech = () => {
  return (
    <section className="my-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-black tracking-widest text-[#403D88] uppercase block mb-3">
          KLINIK USKUNALAR & XALQARO STANDARTLAR
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0F3040] leading-tight tracking-tight">
          Eng so‘nggi tibbiy innovatsiyalar
        </h2>
        <p className="text-slate-600 mt-4 text-sm sm:text-base leading-relaxed">
          Magic Denta Germaniya, Shveytsariya va Finlyandiyaning eng ilg‘or tibbiy texnologiyalari bilan jihozlangan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {equipmentList.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-[32px] p-7 border border-slate-200/80 shadow-card-clean hover:shadow-card-hover hover:border-[#403D88]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  {item.icon}
                </div>
                <span className="text-[10px] font-black tracking-widest text-[#403D88] uppercase px-3 py-1 rounded-full bg-[#403D88]/10">
                  {item.tag}
                </span>
              </div>

              <span className="text-[11px] font-black text-[#92003A] uppercase tracking-wider block mb-1">
                {item.brand}
              </span>
              <h3 className="text-lg font-black text-[#0F3040] leading-snug mb-3">
                {item.title}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Magic Denta Standarti
              </span>
              <div className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ClinicalTech;
