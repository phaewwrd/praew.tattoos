export type AppointmentRequest = {
  date: string;
  time: string;
  fullName: string;
  email: string;
  serviceId: string;
};

export type AvailableDates = {
  dates: string[];
};

export type AvailableTimes = {
  date: string;
  times: string[];
};

export type AppointmentReservation = {
  date: string;
  time: string;
  message: string;
};
