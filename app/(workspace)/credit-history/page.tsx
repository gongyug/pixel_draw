'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Gift,
  CreditCard,
  Zap,
  Loader2,
  RefreshCw,
  Filter,
  TrendingUp,
  Calendar,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { apiGet } from '@/lib/api';

interface Transaction {
  id: string;
  amount: number;
  type: 'initial_grant' | 'purchase' | 'task_consumption' | 'refund' | 'admin_adjustment';
  description: string;
  created_at: string;
  order_id?: string;
  task_id?: string;
}

const TRANSACTION_TYPE_MAP = {
  initial_grant: {
    label: '注册奖励',
    icon: Gift,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  purchase: {
    label: '购买充值',
    icon: CreditCard,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  task_consumption: {
    label: '任务消费',
    icon: Zap,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  refund: {
    label: '退款',
    icon: RefreshCw,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  admin_adjustment: {
    label: '管理员调整',
    icon: AlertCircle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    borderColor: 'border-gray-200 dark:border-gray-800'
  },
};

export default function CreditHistoryPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [filterType, setFilterType] = useState<string>('all');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await apiGet(
        `/api/credit-history?limit=${limit}&offset=${offset}`
      );
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setFilteredTransactions(data.transactions);
        setTotal(data.total);
      }
    } catch (error) {
      // apiGet 会自动处理 401 错误并重定向
      console.error('获取积分历史错误:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchTransactions();
    }
  }, [isLoaded, isSignedIn, offset]);

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredTransactions(transactions);
    } else if (filterType === 'income') {
      setFilteredTransactions(transactions.filter(t => t.amount > 0));
    } else if (filterType === 'expense') {
      setFilteredTransactions(transactions.filter(t => t.amount < 0));
    } else {
      setFilteredTransactions(transactions.filter(t => t.type === filterType));
    }
  }, [filterType, transactions]);

  const getTypeInfo = (type: Transaction['type']) => {
    return TRANSACTION_TYPE_MAP[type] || TRANSACTION_TYPE_MAP.admin_adjustment;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
    } catch {
      return dateString;
    }
  };

  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md text-center">
          <CreditCard className="h-16 w-16 mx-auto mb-4 text-blue-500" />
          <h2 className="text-2xl font-bold mb-2">需要登录</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            请先登录查看您的积分历史记录
          </p>
          <Link href="/sign-in">
            <Button className="w-full">前往登录</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Gradient */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            积分管理系统
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            积分历史记录
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            查看您的所有积分变动明细，掌握每一笔收支情况
          </p>
        </div>

        {/* 统计卡片 - 更精美的设计 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900">
                  <ArrowUpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium">
                  +{transactions.filter(t => t.amount > 0).length} 笔
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">总收入积分</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                +{totalIncome}
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs text-gray-500">
                <TrendingUp className="h-3 w-3" />
                <span>持续增长中</span>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900">
                  <ArrowDownCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 font-medium">
                  {transactions.filter(t => t.amount < 0).length} 笔
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">总支出积分</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                -{totalExpense}
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs text-gray-500">
                <Zap className="h-3 w-3" />
                <span>服务使用</span>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">
                  全部
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">交易记录</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{total}</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-gray-500">
                <CreditCard className="h-3 w-3" />
                <span>历史记录</span>
              </div>
            </div>
          </Card>
        </div>

        {/* 筛选器 */}
        <Card className="mb-6 border-0 shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold">筛选记录</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
                className="rounded-full"
              >
                全部 ({transactions.length})
              </Button>
              <Button
                variant={filterType === 'income' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('income')}
                className="rounded-full"
              >
                <ArrowUpCircle className="h-4 w-4 mr-1" />
                收入 ({transactions.filter(t => t.amount > 0).length})
              </Button>
              <Button
                variant={filterType === 'expense' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('expense')}
                className="rounded-full"
              >
                <ArrowDownCircle className="h-4 w-4 mr-1" />
                支出 ({transactions.filter(t => t.amount < 0).length})
              </Button>
              {Object.entries(TRANSACTION_TYPE_MAP).map(([key, value]) => {
                const count = transactions.filter(t => t.type === key).length;
                if (count === 0) return null;
                return (
                  <Button
                    key={key}
                    variant={filterType === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(key)}
                    className="rounded-full"
                  >
                    {value.label} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* 交易列表 */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-b">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">交易明细</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  共 {filteredTransactions.length} 条记录
                </p>
              </div>
              <Link href="/credits">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <CreditCard className="h-4 w-4 mr-2" />
                  购买积分
                </Button>
              </Link>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <CreditCard className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">暂无交易记录</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filterType === 'all' ? '您还没有任何积分交易记录' : '该类型暂无记录'}
              </p>
              {filterType !== 'all' && (
                <Button variant="outline" onClick={() => setFilterType('all')}>
                  查看全部记录
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTransactions.map((transaction, index) => {
                const typeInfo = getTypeInfo(transaction.type);
                const Icon = typeInfo.icon;
                const isPositive = transaction.amount > 0;

                return (
                  <div
                    key={transaction.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`p-3 rounded-xl ${typeInfo.bgColor} ${typeInfo.color} group-hover:scale-110 transition-transform duration-200`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base">{typeInfo.label}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.bgColor} ${typeInfo.color} font-medium`}>
                              {transaction.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(transaction.created_at)}
                            </span>
                            {transaction.order_id && (
                              <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 font-mono">
                                {transaction.order_id.slice(0, 16)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-2xl font-bold ${
                            isPositive
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-orange-600 dark:text-orange-400'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {transaction.amount}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">积分</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 分页 */}
          {total > limit && (
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                显示 <span className="font-semibold">{offset + 1}</span> - <span className="font-semibold">{Math.min(offset + limit, total)}</span> / 共 <span className="font-semibold">{total}</span> 条
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* 返回链接 */}
        <div className="text-center mt-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              ← 返回仪表盘
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
