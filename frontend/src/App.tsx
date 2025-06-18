import { SettlementCalculator } from './components/settlement/SettlementCalculator'
import { SettlementHistory } from './components/settlement/SettlementHistory'

function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">ふたりの家計 - 精算機能</h1>
                    <p className="text-gray-600 mt-2">支出の精算計算と履歴管理</p>
                </header>

                <main className="space-y-8">
                    <SettlementCalculator />
                    <SettlementHistory />
                </main>
            </div>
        </div>
    )
}

export default App 
