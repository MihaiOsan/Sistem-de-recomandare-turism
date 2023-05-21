package com.demo.backend.controllers;

import com.demo.backend.services.LocationDetailService;
import com.demo.backend.services.WikiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/wiki")
public class WikiController {

    private final WikiService wikipediaService;
    @Autowired
    private final LocationDetailService locationDetailService;

    public WikiController(WikiService wikipediaService, LocationDetailService locationDetailService) {
        this.wikipediaService = wikipediaService;
        this.locationDetailService = locationDetailService;
    }

    @GetMapping("/wikipedia")
    public String searchForPlace(@RequestParam("query") String query) throws IOException {
        return locationDetailService.searchForPlaceDescriptin(query);
    }
}
