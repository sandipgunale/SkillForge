package com.project.skillforgebackend.user.service;



import com.project.skillforgebackend.user.dto.*;
import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.mapper.UserMapper;
import com.project.skillforgebackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserDto getCurrentUser(User user) {
        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto updateProfile(User user, UpdateProfileRequest request) {
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getSkillLevel() != null) {
            user.setSkillLevel(request.getSkillLevel());
        }
        return userMapper.toDto(userRepository.save(user));
    }
}
