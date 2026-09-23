package com.lifeos.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class LifeOSController {

    @GetMapping("/")
    public String home() {
        return "LifeOS Backend is Running!";
    }
}