package com.demo.backend.controllers;

import com.demo.backend.models.DTO.LocationsDTO;
import com.demo.backend.services.recommendation.ContentBasedRecommedationService;
import com.demo.backend.services.recommendation.DataPreparationService;
import com.google.maps.model.PlaceType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/recommendation")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class RecommendationController {


    @Autowired
    ContentBasedRecommedationService recommendationService;

    @Autowired
    DataPreparationService dataPreparationService;


    @GetMapping("/api/recommended-tourist-attractions-in-radius")
    public LocationsDTO getRecommendedLocationsInRadius(
            @RequestParam Long idUser,
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radius,
            @RequestParam(required = false) String pageToken,
            @RequestParam(required = false, defaultValue = "turist_attraction") String locationType,
            @RequestParam(required = false, defaultValue = "prominence") String sortBy
    ) throws Exception {
        PlaceType placeType;
        try {
            placeType = PlaceType.valueOf(locationType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid locationType: " + locationType);
        }
        return recommendationService.recommendPlaces(dataPreparationService.fetchVisitedLocationsFromGooglePlaces(idUser),lat,lng,radius,placeType);
    }
}
