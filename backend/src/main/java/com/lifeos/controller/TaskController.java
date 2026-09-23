package com.lifeos.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lifeos.model.Task;
import com.lifeos.model.User;
import com.lifeos.repository.TaskRepository;
import com.lifeos.repository.UserRepository;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class TaskController {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskController(TaskRepository taskRepository,
                          UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    // GET all tasks for a specific user
    @GetMapping("/{username}")
    public List<Task> getTasks(@PathVariable String username) {

        User user = userRepository.findAll()
                .stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst()
                .orElseThrow();

        return taskRepository.findAll()
                .stream()
                .filter(task -> task.getUser() != null
                        && task.getUser().getId().equals(user.getId()))
                .toList();
    }

    // CREATE task for a specific user
    @PostMapping("/{username}")
    public Task createTask(@PathVariable String username,
                           @RequestBody Task task) {

        User user = userRepository.findAll()
                .stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst()
                .orElseThrow();

        task.setUser(user);

        return taskRepository.save(task);
    }

    // UPDATE task only if it belongs to the user
    @PutMapping("/{username}/{id}")
    public Task updateTask(@PathVariable String username,
                           @PathVariable Long id,
                           @RequestBody Task task) {

        User user = userRepository.findAll()
                .stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst()
                .orElseThrow();

        Task existingTask = taskRepository.findById(id)
                .orElseThrow();

        if (existingTask.getUser() == null
                || !existingTask.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You cannot modify this task");
        }

        existingTask.setTitle(task.getTitle());
        existingTask.setCompleted(task.isCompleted());

        return taskRepository.save(existingTask);
    }

    // DELETE task only if it belongs to the user
    @DeleteMapping("/{username}/{id}")
    public void deleteTask(@PathVariable String username,
                            @PathVariable Long id) {

        User user = userRepository.findAll()
                .stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst()
                .orElseThrow();

        Task existingTask = taskRepository.findById(id)
                .orElseThrow();

        if (existingTask.getUser() == null
                || !existingTask.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You cannot delete this task");
        }

        taskRepository.delete(existingTask);
    }
}