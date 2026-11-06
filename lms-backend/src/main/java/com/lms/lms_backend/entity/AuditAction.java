package com.lms.lms_backend.entity;

public enum AuditAction {
    COURSE_CREATED("Tạo khóa học"),
    COURSE_UPDATED("Chỉnh sửa"),
    COURSE_SUBMITTED("Gửi duyệt"),
    COURSE_APPROVED("Được duyệt"),
    COURSE_REJECTED("Bị từ chối"),
    COURSE_DELETE_REQUESTED("Yêu cầu xóa"),
    COURSE_DELETED("Đã xóa"),
    COURSE_RESTORED("Khôi phục"),
    SECTION_CREATED("Thêm chương học"),
    SECTION_UPDATED("Sửa chương học"),
    SECTION_DELETED("Xóa chương học"),
    LESSON_CREATED("Thêm bài giảng"),
    LESSON_UPDATED("Sửa bài giảng"),
    LESSON_DELETED("Xóa bài giảng"),
    CERTIFICATE_REVOKED("Thu hồi chứng chỉ"),
    CERTIFICATE_REINSTATED("Khôi phục chứng chỉ"),
    USER_SENSITIVE_DATA_REVEALED("Xem thông tin nhạy cảm"),
    USER_SENSITIVE_DATA_REVEAL_FAILED("Xem thông tin nhạy cảm thất bại"),
    USER_PASSWORD_RESET("Đặt lại mật khẩu");

    private final String label;

    AuditAction(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
