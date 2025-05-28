<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * ユーザー登録のテスト
     */
    public function test_user_can_register()
    {
        $userData = [
            'name' => 'テストユーザー',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'created_at',
                        'updated_at'
                    ],
                    'token'
                ]
            ])
            ->assertJson([
                'success' => true,
                'message' => 'ユーザー登録が完了しました'
            ]);

        $this->assertDatabaseHas('users', [
            'name' => 'テストユーザー',
            'email' => 'test@example.com',
        ]);
    }

    /**
     * 無効なデータでの登録テスト
     */
    public function test_user_registration_validation()
    {
        // 必須フィールドなし
        $response = $this->postJson('/api/register', []);
        $response->assertStatus(422)
            ->assertJson([
                'success' => false
            ])
            ->assertJsonValidationErrors(['name', 'email', 'password']);

        // 無効なメールアドレス
        $response = $this->postJson('/api/register', [
            'name' => 'テストユーザー',
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        // パスワード確認不一致
        $response = $this->postJson('/api/register', [
            'name' => 'テストユーザー',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different_password',
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * 重複メールアドレスでの登録テスト
     */
    public function test_user_registration_with_duplicate_email()
    {
        User::factory()->create(['email' => 'test@example.com']);

        $userData = [
            'name' => 'テストユーザー',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * ログインのテスト
     */
    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $loginData = [
            'email' => 'test@example.com',
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/login', $loginData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'created_at',
                        'updated_at'
                    ],
                    'token'
                ]
            ])
            ->assertJson([
                'success' => true,
                'message' => 'ログインしました',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'email' => $user->email,
                    ]
                ]
            ]);
    }

    /**
     * 無効な認証情報でのログインテスト
     */
    public function test_user_login_with_invalid_credentials()
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        // 間違ったパスワード
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'メールアドレスまたはパスワードが正しくありません'
            ]);

        // 存在しないメールアドレス
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
    }

    /**
     * ログインバリデーションテスト
     */
    public function test_login_validation()
    {
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);

        $response = $this->postJson('/api/login', [
            'email' => 'invalid-email',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * 認証済みユーザー情報取得のテスト
     */
    public function test_authenticated_user_can_get_user_info()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                    'email',
                    'created_at',
                    'updated_at'
                ]
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'email' => $user->email,
                ]
            ]);
    }

    /**
     * 未認証でのユーザー情報取得テスト
     */
    public function test_unauthenticated_user_cannot_get_user_info()
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    /**
     * ログアウトのテスト
     */
    public function test_authenticated_user_can_logout()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token');
        $plainTextToken = $token->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $plainTextToken,
        ])->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'ログアウトしました'
            ]);

        // データベースからトークンが削除されていることを確認
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token->accessToken->id
        ]);
    }

    /**
     * 未認証でのログアウトテスト
     */
    public function test_unauthenticated_user_cannot_logout()
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    /**
     * 無効なトークンでのアクセステスト
     */
    public function test_invalid_token_access()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid_token',
        ])->getJson('/api/user');

        $response->assertStatus(401);
    }

    /**
     * トークンの形式が正しくない場合のテスト
     */
    public function test_malformed_token_access()
    {
        $response = $this->withHeaders([
            'Authorization' => 'InvalidFormat token_here',
        ])->getJson('/api/user');

        $response->assertStatus(401);
    }
}
