<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Expense;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ExpenseApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test_token')->plainTextToken;
    }

    /**
     * 認証ヘッダーを取得
     */
    private function authHeaders(): array
    {
        return ['Authorization' => 'Bearer ' . $this->token];
    }

    /**
     * 支出一覧取得のテスト
     */
    public function test_can_get_expenses_list()
    {
        // テストデータ作成
        Expense::factory()->count(5)->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders($this->authHeaders())
            ->getJson('/api/expenses');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'user_id',
                            'amount',
                            'description',
                            'category',
                            'date',
                            'memo',
                            'created_at',
                            'updated_at',
                            'user'
                        ]
                    ],
                    'current_page',
                    'last_page',
                    'per_page',
                    'total'
                ]
            ])
            ->assertJson([
                'success' => true,
                'message' => '支出一覧を取得しました'
            ]);

        $this->assertEquals(5, $response->json('data.total'));
    }

    /**
     * 他のユーザーの支出が表示されないことのテスト
     */
    public function test_cannot_see_other_users_expenses()
    {
        $otherUser = User::factory()->create();

        // 自分の支出
        Expense::factory()->count(3)->create(['user_id' => $this->user->id]);
        // 他のユーザーの支出
        Expense::factory()->count(2)->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders($this->authHeaders())
            ->getJson('/api/expenses');

        $response->assertStatus(200);
        $this->assertEquals(3, $response->json('data.total'));
    }

    /**
     * 支出詳細取得のテスト
     */
    public function test_can_get_expense_detail()
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders($this->authHeaders())
            ->getJson("/api/expenses/{$expense->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'user_id',
                    'amount',
                    'description',
                    'category',
                    'date',
                    'memo',
                    'created_at',
                    'updated_at',
                    'user'
                ]
            ])
            ->assertJson([
                'success' => true,
                'message' => '支出詳細を取得しました',
                'data' => [
                    'id' => $expense->id,
                    'user_id' => $this->user->id,
                ]
            ]);
    }

    /**
     * 他のユーザーの支出詳細を取得できないテスト
     */
    public function test_cannot_get_other_users_expense_detail()
    {
        $otherUser = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders($this->authHeaders())
            ->getJson("/api/expenses/{$expense->id}");

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => '指定された支出が見つかりません'
            ]);
    }

    /**
     * 支出作成のテスト
     */
    public function test_can_create_expense()
    {
        $expenseData = [
            'amount' => 1500.50,
            'description' => 'ランチ代',
            'category' => '食費',
            'date' => '2024-01-15',
            'memo' => 'おいしいレストランでした',
        ];

        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/expenses', $expenseData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'user_id',
                    'amount',
                    'description',
                    'category',
                    'date',
                    'memo',
                    'created_at',
                    'updated_at',
                    'user'
                ]
            ])
            ->assertJson([
                'success' => true,
                'message' => '支出を記録しました',
                'data' => [
                    'user_id' => $this->user->id,
                    'amount' => '1500.50',
                    'description' => 'ランチ代',
                    'category' => '食費',
                    'memo' => 'おいしいレストランでした',
                ]
            ]);

        // 日付は別途確認（ISO8601形式で返される）
        $responseData = $response->json('data');
        $this->assertStringStartsWith('2024-01-15', $responseData['date']);

        $this->assertDatabaseHas('expenses', [
            'user_id' => $this->user->id,
            'amount' => 1500.50,
            'description' => 'ランチ代',
            'category' => '食費',
            'date' => '2024-01-15',
            'memo' => 'おいしいレストランでした',
        ]);
    }

    /**
     * 支出作成バリデーションのテスト
     */
    public function test_expense_creation_validation()
    {
        // 必須フィールドなし
        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/expenses', []);

        $response->assertStatus(422)
            ->assertJson(['success' => false])
            ->assertJsonValidationErrors(['amount', 'description', 'category', 'date']);

        // 無効な金額
        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/expenses', [
                'amount' => -100,
                'description' => 'テスト',
                'category' => '食費',
                'date' => '2024-01-15',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);

        // 無効な日付
        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/expenses', [
                'amount' => 1000,
                'description' => 'テスト',
                'category' => '食費',
                'date' => 'invalid-date',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['date']);
    }

    /**
     * 支出更新のテスト
     */
    public function test_can_update_expense()
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id]);

        $updateData = [
            'amount' => 2000.00,
            'description' => '更新されたランチ代',
            'category' => '娯楽費',
            'memo' => '更新されたメモ',
        ];

        $response = $this->withHeaders($this->authHeaders())
            ->putJson("/api/expenses/{$expense->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => '支出を更新しました',
                'data' => [
                    'id' => $expense->id,
                    'amount' => '2000.00',
                    'description' => '更新されたランチ代',
                    'category' => '娯楽費',
                    'memo' => '更新されたメモ',
                ]
            ]);

        $this->assertDatabaseHas('expenses', [
            'id' => $expense->id,
            'amount' => 2000.00,
            'description' => '更新されたランチ代',
            'category' => '娯楽費',
            'memo' => '更新されたメモ',
        ]);
    }

    /**
     * 他のユーザーの支出を更新できないテスト
     */
    public function test_cannot_update_other_users_expense()
    {
        $otherUser = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders($this->authHeaders())
            ->putJson("/api/expenses/{$expense->id}", [
                'amount' => 2000.00,
            ]);

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => '指定された支出が見つかりません'
            ]);
    }

    /**
     * 支出削除のテスト
     */
    public function test_can_delete_expense()
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders($this->authHeaders())
            ->deleteJson("/api/expenses/{$expense->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => '支出を削除しました'
            ]);

        $this->assertDatabaseMissing('expenses', [
            'id' => $expense->id,
        ]);
    }

    /**
     * 他のユーザーの支出を削除できないテスト
     */
    public function test_cannot_delete_other_users_expense()
    {
        $otherUser = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders($this->authHeaders())
            ->deleteJson("/api/expenses/{$expense->id}");

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => '指定された支出が見つかりません'
            ]);

        $this->assertDatabaseHas('expenses', [
            'id' => $expense->id,
        ]);
    }

    /**
     * 支出フィルタリングのテスト
     */
    public function test_can_filter_expenses()
    {
        // テストデータ作成
        Expense::factory()->create([
            'user_id' => $this->user->id,
            'category' => '食費',
            'date' => '2024-01-15',
            'amount' => 1000,
        ]);
        Expense::factory()->create([
            'user_id' => $this->user->id,
            'category' => '交通費',
            'date' => '2024-01-20',
            'amount' => 500,
        ]);

        // カテゴリフィルター
        $response = $this->withHeaders($this->authHeaders())
            ->getJson('/api/expenses?category=食費');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('data.total'));

        // 日付範囲フィルター
        $response = $this->withHeaders($this->authHeaders())
            ->getJson('/api/expenses?start_date=2024-01-16&end_date=2024-01-25');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('data.total'));

        // 金額範囲フィルター
        $response = $this->withHeaders($this->authHeaders())
            ->getJson('/api/expenses?min_amount=600&max_amount=1500');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('data.total'));
    }

    /**
     * 支出統計のテスト
     */
    public function test_can_get_expense_stats()
    {
        // テストデータ作成
        Expense::factory()->create([
            'user_id' => $this->user->id,
            'category' => '食費',
            'amount' => 1000,
            'date' => '2024-01-15',
        ]);
        Expense::factory()->create([
            'user_id' => $this->user->id,
            'category' => '食費',
            'amount' => 1500,
            'date' => '2024-01-20',
        ]);
        Expense::factory()->create([
            'user_id' => $this->user->id,
            'category' => '交通費',
            'amount' => 500,
            'date' => '2024-02-01',
        ]);

        $response = $this->withHeaders($this->authHeaders())
            ->getJson('/api/expenses-stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'total',
                    'count',
                    'average',
                    'by_category',
                    'by_month'
                ]
            ])
            ->assertJson([
                'success' => true,
                'message' => '支出統計を取得しました',
                'data' => [
                    'total' => 3000,
                    'count' => 3,
                    'average' => 1000,
                ]
            ]);

        // カテゴリ別統計の確認
        $stats = $response->json('data');
        $this->assertEquals(2500, $stats['by_category']['食費']);
        $this->assertEquals(500, $stats['by_category']['交通費']);
    }

    /**
     * カテゴリ一覧取得のテスト
     */
    public function test_can_get_categories()
    {
        // テストデータ作成
        Expense::factory()->create(['user_id' => $this->user->id, 'category' => '食費']);
        Expense::factory()->create(['user_id' => $this->user->id, 'category' => '交通費']);
        Expense::factory()->create(['user_id' => $this->user->id, 'category' => '食費']); // 重複

        $response = $this->withHeaders($this->authHeaders())
            ->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data'
            ])
            ->assertJson([
                'success' => true,
                'message' => 'カテゴリ一覧を取得しました'
            ]);

        $categories = $response->json('data');
        $this->assertCount(2, $categories);
        $this->assertContains('食費', $categories);
        $this->assertContains('交通費', $categories);
    }

    /**
     * 未認証でのアクセステスト
     */
    public function test_unauthenticated_access_denied()
    {
        $response = $this->getJson('/api/expenses');
        $response->assertStatus(401);

        $response = $this->postJson('/api/expenses', []);
        $response->assertStatus(401);

        $response = $this->getJson('/api/expenses-stats');
        $response->assertStatus(401);

        $response = $this->getJson('/api/categories');
        $response->assertStatus(401);
    }
}
