<?php

namespace Database\Factories;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Expense>
 */
class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            '食費',
            '交通費',
            '娯楽費',
            '日用品',
            '医療費',
            '光熱費',
            '通信費',
            '衣服費',
            '美容費',
            'その他'
        ];

        $descriptions = [
            '食費' => ['スーパーでの買い物', 'コンビニ弁当', 'レストランでの食事', '外食', 'お菓子'],
            '交通費' => ['電車代', 'バス代', 'タクシー代', 'ガソリン代', '駐車場代'],
            '娯楽費' => ['映画鑑賞', 'ゲーム購入', '本・雑誌', 'カラオケ', 'アミューズメント'],
            '日用品' => ['洗剤', 'ティッシュ', 'シャンプー', '掃除用品', '文房具'],
            '医療費' => ['病院代', '薬代', '健康診断', 'マッサージ', 'サプリメント'],
            '光熱費' => ['電気代', 'ガス代', '水道代', '灯油代', '太陽光発電'],
            '通信費' => ['携帯電話代', 'インターネット代', 'プロバイダー料金', 'Wi-Fi代', '郵送料'],
            '衣服費' => ['洋服', '靴', 'バッグ', 'アクセサリー', 'クリーニング代'],
            '美容費' => ['美容院', '化粧品', 'エステ', 'ネイル', 'スキンケア'],
            'その他' => ['雑費', '予期しない出費', 'プレゼント', '寄付', '手数料']
        ];

        $category = $this->faker->randomElement($categories);
        $description = $this->faker->randomElement($descriptions[$category]);

        return [
            'user_id' => User::factory(),
            'amount' => $this->faker->randomFloat(2, 100, 50000),
            'description' => $description,
            'category' => $category,
            'date' => $this->faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'memo' => $this->faker->optional(0.3)->sentence(),
        ];
    }

    /**
     * 特定のカテゴリの支出を生成
     */
    public function category(string $category): static
    {
        return $this->state(fn(array $attributes) => [
            'category' => $category,
        ]);
    }

    /**
     * 特定の金額範囲の支出を生成
     */
    public function amountBetween(float $min, float $max): static
    {
        return $this->state(fn(array $attributes) => [
            'amount' => $this->faker->randomFloat(2, $min, $max),
        ]);
    }

    /**
     * 特定の日付範囲の支出を生成
     */
    public function dateBetween(string $startDate, string $endDate): static
    {
        return $this->state(fn(array $attributes) => [
            'date' => $this->faker->dateTimeBetween($startDate, $endDate)->format('Y-m-d'),
        ]);
    }

    /**
     * 今月の支出を生成
     */
    public function thisMonth(): static
    {
        return $this->state(fn(array $attributes) => [
            'date' => $this->faker->dateTimeBetween('first day of this month', 'now')->format('Y-m-d'),
        ]);
    }

    /**
     * 先月の支出を生成
     */
    public function lastMonth(): static
    {
        return $this->state(fn(array $attributes) => [
            'date' => $this->faker->dateTimeBetween('first day of last month', 'last day of last month')->format('Y-m-d'),
        ]);
    }
}
