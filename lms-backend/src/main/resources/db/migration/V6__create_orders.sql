-- =============================================================================
-- V6__create_orders.sql
-- Create Orders and Order Items Tables for MOOC LMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(50) UNIQUE NOT NULL,
  user_id BIGINT NOT NULL,
  total_amount DECIMAL(12,0) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  payment_method VARCHAR(30),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME NULL,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  course_id BIGINT NOT NULL,
  price DECIMAL(12,0) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
