/**
 * Định nghĩa kiểu dữ liệu lỗi chuẩn trong hệ thống.
 */
export type ErrorType = {
  statusCode: number // Mã HTTP trả về (vd: 400, 401, 500, ...)
  isOperational: boolean // Xác định đây là lỗi nghiệp vụ (true) hay lỗi không mong muốn (false)
  message: string // Thông điệp lỗi chính
  errors?: unknown // Chi tiết lỗi phụ (nếu có), ví dụ như mảng lỗi validation
}

/**
 * AppError là class tùy chỉnh kế thừa từ Error,
 * cho phép mở rộng để xử lý lỗi thống nhất trong toàn bộ hệ thống.
 *
 * @template T là kiểu dữ liệu của phần `errors` (thường là chi tiết lỗi)
 */
export class AppError<T = ErrorType> extends Error {
  public readonly statusCode: number // HTTP status code
  public readonly isOperational: boolean // Đánh dấu lỗi nghiệp vụ (true) hay lỗi không lường trước (false)
  public readonly errors: T | null // Chi tiết lỗi, có thể null nếu không có

  /**
   * Tạo một lỗi mới.
   *
   * @param message - Thông điệp lỗi chính
   * @param statusCode - Mã lỗi HTTP (mặc định 500)
   * @param isOperational - Có phải lỗi nghiệp vụ không (mặc định true)
   * @param errors - Chi tiết lỗi (có thể truyền vào tùy ý)
   */
  constructor(message: string, statusCode = 500, isOperational = true, errors?: T) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.errors = errors ?? null // Nếu không có `errors` truyền vào, gán là null

    // Ghi lại stack trace cho lỗi hiện tại
    Error.captureStackTrace(this, this.constructor)
  }
}
