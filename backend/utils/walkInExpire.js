import { expireWalkInAppointments } from "./liveDentistStatus.js";

export const expireWalkIns = async () => {
  return expireWalkInAppointments();
};
