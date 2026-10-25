export interface NormalizedTransaction {
  externalTxId: string;
  amount: bigint;
  type: "INCOME" | "EXPENSE";
  date: Date;
  description: string;
  bankCode?: string | null;
  accountNumber?: string | null;
  rawPayload?: any;
}

export interface BankProviderVerificationResult {
  isValid: boolean;
  error?: string;
}

export interface BankProvider {
  name: string;
  verifySignature(headers: Headers, rawBody: string, secretKey: string): Promise<BankProviderVerificationResult>;
  normalizePayload(payload: any): NormalizedTransaction[];
}
