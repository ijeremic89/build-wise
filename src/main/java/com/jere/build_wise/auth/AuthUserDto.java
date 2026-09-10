package com.jere.build_wise.auth;

import com.jere.build_wise.user.User;

public record AuthUserDto(Long id, String email) {
    public static AuthUserDto from(User user) {
        return new AuthUserDto(user.getId(), user.getEmail());
    }
}
