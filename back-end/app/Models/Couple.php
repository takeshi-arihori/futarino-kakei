<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Couple extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'created_by',
    ];

    /**
     * カップルに属するユーザーを取得
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * カップルの支出を取得
     */
    public function expenses()
    {
        return $this->hasManyThrough(Expense::class, User::class);
    }

    /**
     * カップルを作成したユーザーを取得
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
