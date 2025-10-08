/**
 * 统一的 API 请求函数
 * 自动处理 401 未认证错误，显示登录模态框
 */

interface FetchOptions extends RequestInit {
  showAuthModalOnError?: boolean; // 是否在未认证时显示模态框，默认 true
}

export async function apiFetch(url: string, options: FetchOptions = {}) {
  const { showAuthModalOnError = true, ...fetchOptions } = options;

  try {
    const response = await fetch(url, fetchOptions);

    // 处理 401 未认证错误
    if (response.status === 401 && showAuthModalOnError) {
      // 触发认证模态框
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-auth-modal'));
      }

      // 抛出友好的错误信息
      throw new Error('请登录后继续操作');
    }

    return response;
  } catch (error) {
    // 如果是我们主动抛出的认证错误，直接抛出
    if (error instanceof Error && error.message.includes('请登录')) {
      throw error;
    }

    // 其他网络错误
    console.error('API 请求失败:', error);
    throw error;
  }
}

/**
 * 便捷方法：GET 请求
 */
export async function apiGet(url: string, options: FetchOptions = {}) {
  return apiFetch(url, { ...options, method: 'GET' });
}

/**
 * 便捷方法：POST 请求
 */
export async function apiPost(url: string, data?: any, options: FetchOptions = {}) {
  // 如果是 FormData，不设置 Content-Type（让浏览器自动设置）
  const isFormData = data instanceof FormData;

  return apiFetch(url, {
    ...options,
    method: 'POST',
    headers: isFormData ? options.headers : {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
  });
}

/**
 * 便捷方法：PUT 请求
 */
export async function apiPut(url: string, data?: any, options: FetchOptions = {}) {
  return apiFetch(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * 便捷方法：DELETE 请求
 */
export async function apiDelete(url: string, options: FetchOptions = {}) {
  return apiFetch(url, { ...options, method: 'DELETE' });
}
