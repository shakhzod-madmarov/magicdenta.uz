import React from "react";
import AdminManualBookingModal from "./AdminManualBookingModal";
import ManualBookingModal from "./ManualBookingModal";

export default function RescheduleModal({
  open,
  appointment,
  onClose,
  onSuccess,
  isDentist = false,
  dentistsList = [],
}) {
  if (!open || !appointment) return null;

  if (isDentist) {
    return (
      <ManualBookingModal
        open={open}
        onClose={onClose}
        onSubmit={onSuccess}
        rescheduleAppointment={appointment}
      />
    );
  }

  return (
    <AdminManualBookingModal
      open={open}
      onClose={onClose}
      onSubmit={onSuccess}
      dentist={appointment.dentistID}
      rescheduleAppointment={appointment}
    />
  );
}
