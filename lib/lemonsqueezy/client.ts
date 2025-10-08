import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

// 验证并获取环境变量
const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;

if (!LEMONSQUEEZY_API_KEY) {
  console.error('缺少 LEMONSQUEEZY_API_KEY 环境变量');
}

if (!LEMONSQUEEZY_STORE_ID) {
  console.error('缺少 LEMONSQUEEZY_STORE_ID 环境变量');
}

// 初始化 Lemon Squeezy
if (LEMONSQUEEZY_API_KEY) {
  lemonSqueezySetup({
    apiKey: LEMONSQUEEZY_API_KEY,
    onError: (error) => {
      console.error('Lemon Squeezy API 错误:', error);
    },
  });
}

export { LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID };

// 导出 Lemon Squeezy 函数
export {
  getProduct,
  listProducts,
  createCheckout,
  getCheckout,
  listCheckouts,
  getOrder,
  listOrders,
  getCustomer,
  listCustomers,
} from '@lemonsqueezy/lemonsqueezy.js';
