// 日付フォーマット関数
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

// クラス名を結合するユーティリティ
export function cn(...classes: (string | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
} 
