export const TRIAL_DAYS = 14;

export function getTrialEndDate(from = new Date()): Date {
  const end = new Date(from);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end;
}
