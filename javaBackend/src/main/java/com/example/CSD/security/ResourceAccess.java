package com.example.CSD.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class ResourceAccess {
    private ResourceAccess() {}
    public static String userId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken) ? auth.getName() : null;
    }
    public static boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userId() != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_admin"));
    }
    public static boolean owns(String owner) { return owner != null && owner.equals(userId()); }
    public static void requireOwner(String owner) {
        if (userId() == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        if (!isAdmin() && !owns(owner)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }
}
