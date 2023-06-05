package com.demo.backend.controllers;

import com.demo.backend.repository.ObjectiveRepository;
import com.demo.backend.services.LocationDetailService;
import com.google.maps.errors.ApiException;
import com.google.maps.model.PlaceDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/objective")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ObjectiveController {

    @Autowired
    ObjectiveRepository objectiveRepository;

    @Autowired
    LocationDetailService locationDetailService;

    @GetMapping("/top12")
    public List<PlaceDetails> findTopLocations() throws IOException, InterruptedException, ApiException {
        List<String> topLocations = objectiveRepository.findTopLocations();
        List<PlaceDetails> lacationsDetails = new ArrayList<>();
        for(String id : topLocations){
            PlaceDetails place = locationDetailService.getPlaceDetail(id);
            lacationsDetails.add(place);
        }
        return lacationsDetails;
    }
}
