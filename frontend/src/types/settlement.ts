// 精算計算のリクエスト型
export interface SettlementCalculateRequest {
    period_start: string; // ISO 8601形式の日付
    period_end: string;   // ISO 8601形式の日付
}

// 精算確定のリクエスト型
export interface SettlementConfirmRequest {
    period_start: string;
    period_end: string;
    expense_ids: number[];
}

// 精算対象の支出
export interface ExpenseForSettlement {
    id: number;
    amount: number;
    date: string;
    category_id: number;
    paid_by_user_id: number;
    split_user1: number;
    split_user2: number;
    memo: string;
    is_settled: boolean;
}

// 精算計算のレスポンス型
export interface SettlementCalculateResponse {
    period_start: string;
    period_end: string;
    expenses: ExpenseForSettlement[];
    settlement_amount: number;
    user1_paid_total: number;
    user2_paid_total: number;
    user1_should_pay: number;
    user2_should_pay: number;
    who_pays_whom: string; // "user1_pays_user2" または "user2_pays_user1"
}

// 精算詳細
export interface SettlementDetails {
    settlement_amount: number;
    user1_paid_total: number;
    user2_paid_total: number;
    user1_should_pay: number;
    user2_should_pay: number;
    who_pays_whom: string;
    expense_count: number;
}

// 精算
export interface Settlement {
    id: number;
    couple_id: number;
    settlement_date: string;
    period_start: string;
    period_end: string;
    details: SettlementDetails;
    created_at: string;
    updated_at: string;
}

// 精算履歴取得のレスポンス型
export interface SettlementsResponse {
    settlements: Settlement[];
    total: number;
} 
