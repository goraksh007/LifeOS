package com.lifeos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lifeos.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
}