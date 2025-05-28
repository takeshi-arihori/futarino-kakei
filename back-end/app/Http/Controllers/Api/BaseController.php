<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BaseController extends Controller
{
    /**
     * 成功レスポンスを返す
     */
    protected function successResponse($data = null, string $message = 'Success', int $status = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }

    /**
     * エラーレスポンスを返す
     */
    protected function errorResponse(string $message = 'Error', int $status = 400, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }

    /**
     * バリデーションエラーレスポンスを返す
     */
    protected function validationErrorResponse($errors, string $message = 'バリデーションエラーが発生しました'): JsonResponse
    {
        return $this->errorResponse($message, 422, $errors);
    }

    /**
     * 認証エラーレスポンスを返す
     */
    protected function unauthorizedResponse(string $message = '認証が必要です'): JsonResponse
    {
        return $this->errorResponse($message, 401);
    }

    /**
     * 権限エラーレスポンスを返す
     */
    protected function forbiddenResponse(string $message = 'アクセス権限がありません'): JsonResponse
    {
        return $this->errorResponse($message, 403);
    }

    /**
     * 見つからないエラーレスポンスを返す
     */
    protected function notFoundResponse(string $message = 'リソースが見つかりません'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }
}
