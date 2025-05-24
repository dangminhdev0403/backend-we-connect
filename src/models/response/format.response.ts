// src/utils/response.util.ts

/**
 * Định nghĩa kiểu dữ liệu trả về cho response.
 * Tính linh hoạt giúp có thể dùng cho nhiều trường hợp (dữ liệu trả về, lỗi, thông báo).
 */
export interface Response<T = object> {
  statusCode: number
  message: string | Record<string, object> | null
  data: T | null
  errors: T | null
}

/**
 * Định nghĩa kiểu dữ liệu truyền vào cho createResponse
 */
interface CreateResponseParams<T = object> {
  statusCode: number
  message?: string | Record<string, object> | null
  data?: T | null
  errors?: T | null
}

/**
 * Tạo một response chuẩn cho các API.
 * @param statusCode - Mã trạng thái HTTP (ví dụ: 200, 400, 500)
 * @param message - Thông điệp trả về cho người dùng hoặc đối tượng chi tiết lỗi
 * @param data - Dữ liệu trả về, mặc định là null
 * @param errors - Chi tiết lỗi nếu có, mặc định là null
 */
const createResponse = <T = object>({
  statusCode,
  message = null,
  data = null,
  errors = null
}: CreateResponseParams<T>): Response<T> => {
  return {
    statusCode,
    message,
    data,
    errors
  }
}

export { createResponse }
