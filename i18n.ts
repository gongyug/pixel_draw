import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

// 支持的语言列表
export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];

// 默认语言
export const defaultLocale: Locale = 'zh';

export default getRequestConfig(async () => {
  // 尝试从 cookie 获取语言偏好
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;

  // 尝试从 Accept-Language header 获取
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  let locale: Locale = defaultLocale;

  // 优先级：Cookie > Accept-Language > 默认
  if (localeCookie && locales.includes(localeCookie as Locale)) {
    locale = localeCookie as Locale;
  } else if (acceptLanguage) {
    // 简单解析 Accept-Language
    const browserLang = acceptLanguage.split(',')[0].split('-')[0];
    if (locales.includes(browserLang as Locale)) {
      locale = browserLang as Locale;
    }
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
