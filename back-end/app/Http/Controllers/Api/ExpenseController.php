<?php

namespace App\Http\Controllers\Api;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends BaseController
{
    /**
     * 支出一覧取得
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = Expense::where('user_id', $user->id)
            ->with('user:id,name');

        // フィルタリング
        if ($request->has('category') && $request->category !== '') {
            $query->where('category', $request->category);
        }

        if ($request->has('start_date') && $request->start_date !== '') {
            $query->where('date', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date !== '') {
            $query->where('date', '<=', $request->end_date);
        }

        if ($request->has('min_amount') && $request->min_amount !== '') {
            $query->where('amount', '>=', $request->min_amount);
        }

        if ($request->has('max_amount') && $request->max_amount !== '') {
            $query->where('amount', '<=', $request->max_amount);
        }

        if ($request->has('search') && $request->search !== '') {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                    ->orWhere('memo', 'like', '%' . $request->search . '%');
            });
        }

        // ソート
        $sortField = $request->get('sort_field', 'date');
        $sortDirection = $request->get('sort_direction', 'desc');

        $allowedSortFields = ['date', 'amount', 'category', 'description', 'created_at'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'date';
        }

        $query->orderBy($sortField, $sortDirection);

        // ページネーション
        $perPage = $request->get('per_page', 15);
        $expenses = $query->paginate($perPage);

        return $this->successResponse([
            'data' => $expenses->items(),
            'current_page' => $expenses->currentPage(),
            'last_page' => $expenses->lastPage(),
            'per_page' => $expenses->perPage(),
            'total' => $expenses->total(),
        ], '支出一覧を取得しました');
    }

    /**
     * 支出詳細取得
     */
    public function show(int $id): JsonResponse
    {
        $user = Auth::user();

        $expense = Expense::where('user_id', $user->id)
            ->with('user:id,name')
            ->find($id);

        if (!$expense) {
            return $this->notFoundResponse('指定された支出が見つかりません');
        }

        return $this->successResponse($expense, '支出詳細を取得しました');
    }

    /**
     * 支出作成
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0|max:9999999.99',
            'description' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'date' => 'required|date',
            'memo' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $expense = Expense::create([
            'user_id' => Auth::id(),
            'amount' => $request->amount,
            'description' => $request->description,
            'category' => $request->category,
            'date' => $request->date,
            'memo' => $request->memo,
        ]);

        $expense->load('user:id,name');

        return $this->successResponse($expense, '支出を記録しました', 201);
    }

    /**
     * 支出更新
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = Auth::user();

        $expense = Expense::where('user_id', $user->id)->find($id);

        if (!$expense) {
            return $this->notFoundResponse('指定された支出が見つかりません');
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'sometimes|required|numeric|min:0|max:9999999.99',
            'description' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'date' => 'sometimes|required|date',
            'memo' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $expense->update($request->only([
            'amount',
            'description',
            'category',
            'date',
            'memo'
        ]));

        $expense->load('user:id,name');

        return $this->successResponse($expense, '支出を更新しました');
    }

    /**
     * 支出削除
     */
    public function destroy(int $id): JsonResponse
    {
        $user = Auth::user();

        $expense = Expense::where('user_id', $user->id)->find($id);

        if (!$expense) {
            return $this->notFoundResponse('指定された支出が見つかりません');
        }

        $expense->delete();

        return $this->successResponse(null, '支出を削除しました');
    }

    /**
     * 支出統計取得
     */
    public function stats(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = Expense::where('user_id', $user->id);

        // フィルタリング
        if ($request->has('start_date') && $request->start_date !== '') {
            $query->where('date', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date !== '') {
            $query->where('date', '<=', $request->end_date);
        }

        $expenses = $query->get();

        $stats = [
            'total' => $expenses->sum('amount'),
            'count' => $expenses->count(),
            'average' => $expenses->count() > 0 ? $expenses->avg('amount') : 0,
            'by_category' => $expenses->groupBy('category')->map(function ($items) {
                return $items->sum('amount');
            }),
            'by_month' => $expenses->groupBy(function ($item) {
                return $item->date->format('Y-m');
            })->map(function ($items) {
                return $items->sum('amount');
            }),
        ];

        return $this->successResponse($stats, '支出統計を取得しました');
    }

    /**
     * カテゴリ一覧取得
     */
    public function categories(): JsonResponse
    {
        $user = Auth::user();

        $categories = Expense::where('user_id', $user->id)
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values();

        return $this->successResponse($categories, 'カテゴリ一覧を取得しました');
    }
}
