package com.lifeos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lifeos.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
}