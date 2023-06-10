package com.demo.backend.controllers;

import com.demo.backend.models.DTO.WeatherData;
import com.demo.backend.services.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/weather")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class WeatherController {

    @Autowired
    WeatherService weatherService;

    @GetMapping("/api/weather")
    public List<WeatherData> getWeather(@RequestParam double lat, @RequestParam double lng, @RequestParam String start, @RequestParam String end) throws IOException, InterruptedException {
        return weatherService.getWeatherData(lat,lng, start,end);
    }
}
