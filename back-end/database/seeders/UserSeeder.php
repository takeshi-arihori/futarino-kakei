<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Couple;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // テストユーザー1を作成
        $user1 = User::create([
            'name' => '田中太郎',
            'email' => 'taro@example.com',
            'password' => Hash::make('password123'),
        ]);

        // テストユーザー2を作成
        $user2 = User::create([
            'name' => '田中花子',
            'email' => 'hanako@example.com',
            'password' => Hash::make('password123'),
        ]);

        // カップル関係を作成
        $couple = Couple::create([
            'name' => '田中家の家計',
            'created_by' => $user1->id,
        ]);

        // ユーザーにカップルIDを設定
        $user1->update(['couple_id' => $couple->id]);
        $user2->update(['couple_id' => $couple->id]);

        $this->command->info('テストユーザーが作成されました:');
        $this->command->info('ユーザー1: taro@example.com / password123');
        $this->command->info('ユーザー2: hanako@example.com / password123');
    }
}
