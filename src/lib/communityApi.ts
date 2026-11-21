import { Review } from '../types/foody';

const VISITOR_ID_KEY = 'hanoi_viki_visitor_id_v1';

function visitorId() {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new Error('Không kết nối được backend. Hãy chạy npm run dev.');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const messages: Record<string, string> = {
      'DATABASE_URL is not configured': 'Backend chưa có DATABASE_URL trong file .env.',
      'Database schema is missing': 'Chưa tạo bảng trong Supabase. Hãy chạy server/schema.sql.',
      'Database password is incorrect': 'Mật khẩu database trong .env không đúng.',
      'Database connection or query failed': 'Backend không kết nối được Supabase. Kiểm tra DATABASE_URL.',
    };
    throw new Error(messages[body.error] || body.error || (response.status === 500
      ? 'Backend chưa chạy hoặc không phản hồi. Hãy chạy npm run dev.'
      : `Backend trả về lỗi ${response.status}.`));
  }
  return response.json();
}

export async function loadCommunity() {
  return request<{ reviews: Review[]; bookmarkedIds: string[] }>(
    `/api/community?visitorId=${encodeURIComponent(visitorId())}`,
  );
}

export function saveReview(review: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>) {
  return request<Review>('/api/reviews', { method: 'POST', body: JSON.stringify(review) });
}

export function voteHelpful(reviewId: string) {
  return request<{ helpfulCount: number }>(`/api/reviews/${encodeURIComponent(reviewId)}/helpful`, {
    method: 'POST',
  });
}

export function saveBookmark(restaurantId: string, bookmarked: boolean) {
  return request<{ ok: boolean }>(`/api/bookmarks/${encodeURIComponent(restaurantId)}`, {
    method: 'PUT',
    body: JSON.stringify({ visitorId: visitorId(), bookmarked }),
  });
}
