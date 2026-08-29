export interface QuotaDetail {
  used?: number;
  total?: number;
  remaining?: number;
  resetAt?: string;
  unlimited?: boolean;
}

export interface AccountQuotaView {
  id: string;
  provider: string;
  name: string;
  email: string;
  is_active: boolean;
  test_status: string;
  plan?: string;
  limit_reached: boolean;
  reset_credits_available: number;
  session_quota?: QuotaDetail;
  weekly_quota?: QuotaDetail;
  quotas: Record<string, QuotaDetail>;
  error?: string;
}

export type SortMode = "default" | "remaining-asc" | "remaining-desc" | "expiring-first";
export type FilterMode = "all" | "active" | "inactive";
