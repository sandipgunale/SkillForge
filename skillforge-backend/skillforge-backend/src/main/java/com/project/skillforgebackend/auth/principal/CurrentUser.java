package com.project.skillforgebackend.auth.principal;

import com.project.skillforgebackend.common.exception.InvalidCredentialsException;
import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Bridges the lean {@link AuthenticatedPrincipal} held in the
 * {@code SecurityContext} back to the managed JPA {@link User} entity for
 * service/repository calls that need it.
 *
 * <p>The principal carries the user id, so this translates to one index lookup
 * by primary key; the account may have been deactivated between filter and
 * handler, in which case the call is rejected rather than operating on an
 * inactive account.
 */
@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UserRepository userRepository;

    /**
     * Resolves the full (managed) entity for the currently authenticated
     * caller.
     *
     * @throws InvalidCredentialsException when the caller is unauthenticated
     *                                     or their account no longer exists
     */
    public User require(AuthenticatedPrincipal principal) {
        if (principal == null) {
            throw new InvalidCredentialsException();
        }
        return userRepository.findById(principal.id())
                .orElseThrow(InvalidCredentialsException::new);
    }

    /**
     * Resolves the entity from an {@link Authentication} holding an
     * {@link AuthenticatedPrincipal} as its principal.
     */
    public User require(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedPrincipal principal)) {
            throw new InvalidCredentialsException();
        }
        return require(principal);
    }
}