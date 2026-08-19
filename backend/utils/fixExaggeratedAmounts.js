import appointmentModel from "../models/appointmentsModel.js";
import treatmentModel from "../models/treatmentModel.js";

export const fixExaggeratedAmounts = async () => {
  try {
    const hugeApps = await appointmentModel.find({
      "financial.amount": { $gt: 100000000 }
    });

    if (hugeApps.length > 0) {
      console.log(`[migration] Found ${hugeApps.length} appointments with exaggerated amount (>100M UZS)`);
    }

    for (const ha of hugeApps) {
      const CORRECT = 2600000;
      console.log(`[migration] Correcting Appointment ${ha._id} from ${ha.financial?.amount} to ${CORRECT} UZS`);

      ha.financial.amount = CORRECT;
      ha.financial.paidAmount = CORRECT;
      ha.financial.debt = 0;
      ha.financial.paymentStatus = "PAID";
      await ha.save();

      const tr = await treatmentModel.findOne({ appointmentId: ha._id });
      if (tr) {
        tr.amount = CORRECT;
        tr.paidAmount = CORRECT;
        tr.paymentStatus = "PAID";

        if (Array.isArray(tr.payments)) {
          tr.payments.forEach((p) => {
            if (p.amount > CORRECT) p.amount = CORRECT;
          });
        }

        if (tr.commission) {
          const pct = tr.commission.percentAtTreatment || 30;
          tr.commission.calculatedShare = Math.round((CORRECT * pct) / 100);
        }

        await tr.save();
        console.log(`[migration] Corrected Treatment ${tr._id} amount to ${CORRECT} UZS`);
      }
    }
  } catch (err) {
    console.error("[migration] fixExaggeratedAmounts error:", err);
  }
};
