export type Profile = {
  id: string;
  name: string | null;
  dob: string | null; // YYYY-MM-DD
  tob: string | null; // HH:MM
  birthplace: string | null;
  current_location: string | null;
  gender: string | null;
  deity_id: string;
  rashi: string | null;
  nakshatra: string | null;
  onboarded: boolean;
};

export type UserState = {
  japa_lifetime: number;
  japa_today: number;
  last_japa: string | null;
  streak: number;
  punya: number;
  wallet: number;
};

export const EMPTY_STATE: UserState = {
  japa_lifetime: 0,
  japa_today: 0,
  last_japa: null,
  streak: 0,
  punya: 0,
  wallet: 0,
};
