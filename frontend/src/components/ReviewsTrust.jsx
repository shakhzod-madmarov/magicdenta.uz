import { useState } from "react";

const reviews = [
  {
    name: "Dilnoza Rahimova",
    role: "Ortodontiya bemori",
    rating: 5,
    speciality: "Ortodontiya",
    comment: "Magic Denta klinikasida 1 yildan buyon breket taqdim. Natijasi kutilganimdan ham a'lo bo'ldi! Shifokorlar juda muloyim va professional. Har bir ko'rik mutlaqo og'riqsiz o'tdi.",
    date: "12 Avgust, 2026",
    initials: "DR",
  },
  {
    name: "Akmal Saidov",
    role: "Ortopedik davolanish",
    rating: 5,
    speciality: "Ortopedik stomatologiya",
    comment: "Oldingi tishlarimga 4 ta sirkoniy qoplama qo'ydirdim. Rang va shakli tabiiy tishlarimdan umuman ajralib turmaydi. 1 haftada butunlay yangi tabassumga ega bo'ldim.",
    date: "28 Iyul, 2026",
    initials: "AS",
  },
  {
    name: "Madina Qosimova",
    role: "Estetik stomatologiya",
    rating: 5,
    speciality: "Estetik stomatologiya",
    comment: "Gollivud tabassumi uchun E-max vinirlar o'rnatdik. Hozir bemalol, keng va ishonch bilan kulaman. Magic Denta jamoasiga samimiy minnatdorchilik bildiraman!",
    date: "5 Iyul, 2026",
    initials: "MQ",
  },
  {
    name: "Jasur Bekmurodov",
    role: "Terapevtik davolash",
    rating: 5,
    speciality: "Terapevtik stomatologiya",
    comment: "Tishim qattiq og'rib borgandim. Mikroskop ostida 1 ta qabulda kanalni tozalab, plomba qo'yib berishdi. Hech qanday og'riq sezmadim, zamonaviy anesteziyasi ajoyib.",
    date: "19 Iyun, 2026",
    initials: "JB",
  },
];

const ReviewsTrust = () => {
  return (
    <section className="my-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header with Google/Yandex 4.9 Rating Badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
        <div className="text-left max-w-2xl space-y-2">
          <span className="text-xs font-black tracking-widest text-[#403D88] uppercase block">
            BEMORLARIMIZ ISHONCHI
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0F3040] leading-tight tracking-tight">
            Minglab sog‘lom va mamnun tabassumlar
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Biz har bir bemorga o‘z oila a’zosidek g‘amxo‘rlik qilamiz va eng yuqori sifatli xizmatni taqdim etamiz.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-card-clean flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl font-black border border-amber-200/80">
            ★
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-[#0F3040]">4.9</span>
              <div className="flex text-amber-400 text-sm">★★★★★</div>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Google & Yandex reytingi (500+ baho)
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reviews.map((rev, i) => (
          <div
            key={i}
            className="bg-white rounded-[32px] p-7 border border-slate-200/80 shadow-card-clean hover:shadow-card-hover hover:border-[#403D88]/40 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex text-amber-400 text-sm">
                  {"★".repeat(rev.rating)}
                </div>
                <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#403D88]/10 text-[#403D88]">
                  {rev.speciality}
                </span>
              </div>

              <p className="text-slate-700 text-sm leading-relaxed mb-6 font-normal">
                "{rev.comment}"
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F3040] to-[#321E48] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                {rev.initials}
              </div>
              <div className="text-left">
                <h4 className="text-sm font-black text-[#0F3040] leading-snug">
                  {rev.name}
                </h4>
                <span className="text-[11px] text-slate-500 block font-medium">
                  {rev.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewsTrust;
