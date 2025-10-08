// 积分套餐配置
// 根据不同的充值金额提供不同数量的积分

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number; // 美元价格
  priceInCNY: number; // 人民币价格
  discount?: number; // 折扣百分比
  popular?: boolean; // 是否为推荐套餐
  bonus?: number; // 赠送的额外积分
  description: string;
  features: string[];
}

// 积分消耗标准（复制自 quota.ts 以便参考）
export const CREDIT_COSTS = {
  compress: 1,       // 图片压缩
  remove_bg: 2,      // AI 抠图
  recognize: 5,      // 图像识别
  generate: 10,      // AI 图像生成
};

// 计算功能使用次数
export function calculateUsageCount(credits: number, taskType: keyof typeof CREDIT_COSTS): number {
  return Math.floor(credits / CREDIT_COSTS[taskType]);
}

// 积分套餐列表
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: '入门套餐',
    credits: 100,
    price: 4.99,
    priceInCNY: 35,
    description: '适合个人用户偶尔使用',
    features: [
      `压缩 ${calculateUsageCount(100, 'compress')} 次`,
      `抠图 ${calculateUsageCount(100, 'remove_bg')} 次`,
      `识别 ${calculateUsageCount(100, 'recognize')} 次`,
      `生图 ${calculateUsageCount(100, 'generate')} 次`,
      '永久有效',
      '无需订阅',
    ],
  },
  {
    id: 'basic',
    name: '基础套餐',
    credits: 300,
    price: 9.99,
    priceInCNY: 68,
    bonus: 30, // 赠送 30 积分
    description: '最受欢迎的选择',
    popular: true,
    features: [
      `总共 330 积分（赠送 30）`,
      `压缩 ${calculateUsageCount(330, 'compress')} 次`,
      `抠图 ${calculateUsageCount(330, 'remove_bg')} 次`,
      `识别 ${calculateUsageCount(330, 'recognize')} 次`,
      `生图 ${calculateUsageCount(330, 'generate')} 次`,
      '永久有效',
      '优先技术支持',
    ],
  },
  {
    id: 'pro',
    name: '专业套餐',
    credits: 1000,
    price: 29.99,
    priceInCNY: 199,
    bonus: 200, // 赠送 200 积分
    discount: 17, // 相比基础套餐节省 17%
    description: '适合专业设计师和内容创作者',
    features: [
      `总共 1200 积分（赠送 200）`,
      `压缩 ${calculateUsageCount(1200, 'compress')} 次`,
      `抠图 ${calculateUsageCount(1200, 'remove_bg')} 次`,
      `识别 ${calculateUsageCount(1200, 'recognize')} 次`,
      `生图 ${calculateUsageCount(1200, 'generate')} 次`,
      '永久有效',
      '优先技术支持',
      'API 访问权限',
    ],
  },
  {
    id: 'enterprise',
    name: '企业套餐',
    credits: 5000,
    price: 99.99,
    priceInCNY: 688,
    bonus: 1500, // 赠送 1500 积分
    discount: 38, // 相比基础套餐节省 38%
    description: '适合团队和企业用户',
    features: [
      `总共 6500 积分（赠送 1500）`,
      `压缩 ${calculateUsageCount(6500, 'compress')} 次`,
      `抠图 ${calculateUsageCount(6500, 'remove_bg')} 次`,
      `识别 ${calculateUsageCount(6500, 'recognize')} 次`,
      `生图 ${calculateUsageCount(6500, 'generate')} 次`,
      '永久有效',
      '专属客户经理',
      'API 访问权限',
      '批量处理优先',
      '自定义需求支持',
    ],
  },
];

// 获取套餐的实际积分数（包含赠送）
export function getTotalCredits(pkg: CreditPackage): number {
  return pkg.credits + (pkg.bonus || 0);
}

// 计算单个积分的成本
export function getCostPerCredit(pkg: CreditPackage): number {
  return pkg.price / getTotalCredits(pkg);
}

// 获取推荐套餐
export function getPopularPackage(): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.popular);
}

// 根据 ID 获取套餐
export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.id === id);
}

// 计算节省的金额
export function calculateSavings(pkg: CreditPackage): number {
  const basePackage = CREDIT_PACKAGES[0]; // 以入门套餐为基准
  const baseRate = getCostPerCredit(basePackage);
  const currentRate = getCostPerCredit(pkg);
  const totalCredits = getTotalCredits(pkg);

  return (baseRate - currentRate) * totalCredits;
}
