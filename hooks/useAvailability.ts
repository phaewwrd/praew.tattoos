"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAvailableDatesAction,
  getAvailableTimesAction,
  reserveAppointmentAction,
} from "@/app/actions/availability";
import type { ServerResponse } from "@/lib/server-response";
import type { AppointmentRequest, AvailableDates } from "@/types/availability";

export const availabilityKeys = {
  dates: ["availability", "dates"] as const,
  times: (date: string) => ["availability", "times", date] as const,
};

export function useAvailableDates(initialData: ServerResponse<AvailableDates>) {
  return useQuery({
    queryKey: availabilityKeys.dates,
    queryFn: getAvailableDatesAction,
    initialData,
    staleTime: Infinity,
  });
}

export function useAvailableTimes(date: string) {
  return useQuery({
    queryKey: availabilityKeys.times(date),
    queryFn: () => getAvailableTimesAction(date),
    enabled: Boolean(date),
  });
}

export function useReserveAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AppointmentRequest) =>
      reserveAppointmentAction(request),
    onSuccess: async (response, request) => {
      if (!response.ok && response.code !== "SLOT_UNAVAILABLE") return;
      await queryClient.invalidateQueries({ queryKey: availabilityKeys.dates });
      await queryClient.invalidateQueries({
        queryKey: availabilityKeys.times(request.date),
      });
    },
  });
}
