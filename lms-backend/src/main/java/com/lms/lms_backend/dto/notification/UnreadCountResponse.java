package com.lms.lms_backend.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UnreadCountResponse {
    private long unreadCount;
    private long count;

    public static UnreadCountResponse of(long count) {
        return new UnreadCountResponse(count, count);
    }
}

