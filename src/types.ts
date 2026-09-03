export type SourcePlatform = 'Google' | 'Facebook' | 'LinkedIn' | 'Directory' | 'Website' | 'Other';

export type BuyerCategory = 'business' | 'individual' | 'unclassified';

export type BuyerStatus = 'valid' | 'flagged' | 'invalid';

export interface BuyerRecord {
  email: string;
  buyer_name: string;
  company_name: string;
  website: string;
  country: string;
  source_platform: SourcePlatform;
  category: BuyerCategory;
  discovered_date: string;
  status: BuyerStatus;
  notes?: string;
  ai_confidence?: number;
  ai_reasoning?: string;
}

export interface ClassifiedEmailRecord {
  email: string;
  buyer_name: string;
  company_name: string;
  website: string;
  country: string;
  source_platform: SourcePlatform;
  category: 'business' | 'individual';
  ai_confidence: number;
  ai_reasoning: string;
  classified_at: string;
}

export interface SendLogEntry {
  delivery_id: string;
  campaign_id: string;
  email: string;
  buyer_name: string;
  company_name: string;
  subject: string;
  status: 'sent' | 'failed' | 'skipped_duplicate';
  sent_at: string;
  response_message?: string;
}

export interface AppSettings {
  email: string;
  app_password?: string;
  smtp_host: string;
  smtp_port: number;
  use_ssl: boolean;
  cc_monitoring: string;
  delay: number;
  daily_send_limit: number;
  search_keyword: string;
  default_subject: string;
  default_body: string;
  presentation_path: string;
  presentation_filename?: string;
  auto_classify: boolean;
  remove_duplicates: boolean;
  simulation_mode: boolean;
}

export interface CampaignRequest {
  subject: string;
  body: string;
  audience: 'business' | 'individual' | 'all';
  attach_presentation: boolean;
  delay_seconds?: number;
  simulation_mode?: boolean;
  selected_emails?: string[];
  ai_tailor_content?: boolean;
}

export interface CampaignReport {
  campaign_id: string;
  timestamp: string;
  total: number;
  success_count: number;
  failed_count: number;
  skipped_count: number;
  audience: string;
  successful: Array<{ email: string; name: string; company: string; timestamp: string }>;
  failed: Array<{ email: string; name: string; company: string; error: string; timestamp: string }>;
  skipped: Array<{ email: string; reason: string }>;
}

export interface DatabaseStats {
  total_buyers: number;
  business_count: number;
  individual_count: number;
  unclassified_count: number;
  valid_count: number;
  flagged_count: number;
  total_sent: number;
  successful_deliveries: number;
  failed_deliveries: number;
  last_modified: string;
  file_sizes: {
    buyers_csv_kb: number;
    sent_log_csv_kb: number;
    business_csv_kb: number;
    individual_csv_kb: number;
    presentation_kb: number;
  };
}
