package com.project.skillforgebackend.auth.principal;

import com.project.skillforgebackend.user.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.UUID;

/**
 * The authenticated caller as carried in the {@code SecurityContext}.
 *
 * <p>Deliberately NOT the JPA {@link User} entity: the context holds a lean
 * immutable snapshot (id, email, display name, role, active flag) so no
 * entity lifecycle leaks into security code or controller signatures.
 * Services that need the managed entity resolve it explicitly via
 * {@link com.project.skillforgebackend.auth.principal.CurrentUser}.
 *
 * @param id       user id
 * @param email    lower-cased email
 * @param fullName display name
 * @param role     current role (kept in sync per-request from the DB)
 * @param active   account-active flag (revoked tokens/deactivated users
 *                 are rejected in the filter, so this is always true here)
 */
public record AuthenticatedPrincipal(
        UUID id,
        String email,
        String fullName,
        User.Role role,
        boolean active
) {

    public List<GrantedAuthority> authorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
}
