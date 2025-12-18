export interface Claim {
  text: string;
  status: 'verified' | 'uncertain' | 'outdated' | 'unsupported' | 'contradicted';
  reason: string;
  sources?: string[];
}

export interface Verification {
  claims: Claim[];
  overall_confidence?: number;
}

export interface Source {
  title: string;
  snippet: string;
  url: string;
}

export interface RiskData {
  confidence: number;
  risk_emoji: string;
  risk_message: string;
  risk_color: string;
  status_counts: {
    verified: number;
    uncertain: number;
    outdated: number;
    unsupported: number;
    contradicted: number;
  };
  total_claims: number;
}

export interface VerificationResult {
  question: string;
  answer: string;
  verification: Verification;
  sources: Source[];
  search_queries: string[];
  risk_data: RiskData;
}

