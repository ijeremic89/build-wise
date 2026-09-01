package com.jere.build_wise.user;

import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

    // TODO: zamijeniti sa SecurityContextHolder kad dodamo Spring Security
    private static final Long DEFAULT_USER_ID = 1L;

    public Long id() {
        return DEFAULT_USER_ID;
    }
}
