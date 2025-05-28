<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Http\JsonResponse;

// テスト用のコントローラークラス（protectedメソッドを公開）
class TestableBaseController extends BaseController
{
    public function publicSuccessResponse($data = null, string $message = '成功しました', int $status = 200): JsonResponse
    {
        return $this->successResponse($data, $message, $status);
    }

    public function publicErrorResponse(string $message = 'エラーが発生しました', int $status = 400, $errors = null): JsonResponse
    {
        return $this->errorResponse($message, $status, $errors);
    }

    public function publicValidationErrorResponse($errors, string $message = 'バリデーションエラーが発生しました'): JsonResponse
    {
        return $this->validationErrorResponse($errors, $message);
    }

    public function publicUnauthorizedResponse(string $message = '認証が必要です'): JsonResponse
    {
        return $this->unauthorizedResponse($message);
    }

    public function publicNotFoundResponse(string $message = 'リソースが見つかりません'): JsonResponse
    {
        return $this->notFoundResponse($message);
    }
}

class BaseControllerTest extends TestCase
{
    private TestableBaseController $controller;

    protected function setUp(): void
    {
        parent::setUp();
        $this->controller = new TestableBaseController();
    }

    /**
     * 成功レスポンスのテスト
     */
    public function test_success_response_format()
    {
        $data = ['test' => 'data'];
        $message = 'テストメッセージ';
        $statusCode = 200;

        $response = $this->controller->publicSuccessResponse($data, $message, $statusCode);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals($statusCode, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $responseData);
    }

    /**
     * デフォルトメッセージでの成功レスポンステスト
     */
    public function test_success_response_with_default_message()
    {
        $data = ['test' => 'data'];

        $response = $this->controller->publicSuccessResponse($data);

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals([
            'success' => true,
            'message' => '成功しました',
            'data' => $data
        ], $responseData);
        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     * エラーレスポンスのテスト
     */
    public function test_error_response_format()
    {
        $message = 'エラーメッセージ';
        $statusCode = 400;
        $errors = ['field' => ['エラー詳細']];

        $response = $this->controller->publicErrorResponse($message, $statusCode, $errors);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals($statusCode, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $responseData);
    }

    /**
     * エラーなしでのエラーレスポンステスト
     */
    public function test_error_response_without_errors()
    {
        $message = 'エラーメッセージ';

        $response = $this->controller->publicErrorResponse($message);

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals([
            'success' => false,
            'message' => $message
        ], $responseData);
        $this->assertEquals(400, $response->getStatusCode());
    }

    /**
     * バリデーションエラーレスポンステスト
     */
    public function test_validation_error_response()
    {
        // モックのバリデーションエラーを作成
        $errors = collect([
            'email' => ['メールアドレスは必須です'],
            'password' => ['パスワードは8文字以上である必要があります']
        ]);

        $response = $this->controller->publicValidationErrorResponse($errors);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(422, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals([
            'success' => false,
            'message' => 'バリデーションエラーが発生しました',
            'errors' => $errors->toArray()
        ], $responseData);
    }

    /**
     * 未認証レスポンステスト
     */
    public function test_unauthorized_response()
    {
        $message = '認証が必要です';

        $response = $this->controller->publicUnauthorizedResponse($message);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(401, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals([
            'success' => false,
            'message' => $message
        ], $responseData);
    }

    /**
     * デフォルトメッセージでの未認証レスポンステスト
     */
    public function test_unauthorized_response_with_default_message()
    {
        $response = $this->controller->publicUnauthorizedResponse();

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals([
            'success' => false,
            'message' => '認証が必要です'
        ], $responseData);
        $this->assertEquals(401, $response->getStatusCode());
    }

    /**
     * 見つからないレスポンステスト
     */
    public function test_not_found_response()
    {
        $message = 'リソースが見つかりません';

        $response = $this->controller->publicNotFoundResponse($message);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(404, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals([
            'success' => false,
            'message' => $message
        ], $responseData);
    }

    /**
     * デフォルトメッセージでの見つからないレスポンステスト
     */
    public function test_not_found_response_with_default_message()
    {
        $response = $this->controller->publicNotFoundResponse();

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals([
            'success' => false,
            'message' => 'リソースが見つかりません'
        ], $responseData);
        $this->assertEquals(404, $response->getStatusCode());
    }
}
