<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AuthController extends BaseController
{
    /**
     * ユーザー登録
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->successResponse([
            'user' => $user,
            'token' => $token,
        ], 'ユーザー登録が完了しました', 201);
    }

    /**
     * ログイン
     */
    public function login(Request $request)
    {
        Log::info('Login request received', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'headers' => $request->headers->all(),
            'input' => $request->all(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            Log::info('Login validation passed', ['email' => $request->email]);

            $credentials = $request->only('email', 'password');

            if (!Auth::attempt($credentials)) {
                Log::warning('Login failed - invalid credentials', ['email' => $request->email]);
                return $this->unauthorizedResponse('認証に失敗しました');
            }

            /** @var \App\Models\User $user */
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('Login successful', [
                'user_id' => $user->id,
                'email' => $user->email,
                'token_prefix' => substr($token, 0, 10) . '...'
            ]);

            return $this->successResponse([
                'user' => $user,
                'token' => $token,
            ], 'ログインしました');
        } catch (\Exception $e) {
            Log::error('Login exception', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->unauthorizedResponse('ログインに失敗しました');
        }
    }

    /**
     * ログアウト
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'ログアウトしました');
    }

    /**
     * 認証済みユーザー情報取得
     */
    public function user(Request $request): JsonResponse
    {
        return $this->successResponse($request->user());
    }
}
