package com.demo.backend.controllers;

import com.demo.backend.models.DTO.LocationDetailsDTO;
import com.demo.backend.models.DTO.LocationsDTO;
import com.demo.backend.models.DTO.WeatherData;
import com.demo.backend.services.LocationDetailService;
import com.demo.backend.services.WeatherService;
import com.demo.backend.services.recommendation.ContentBasedRecommedationService;
import com.demo.backend.services.recommendation.DataPreparationService;
import com.demo.backend.services.recommendation.RecommendationService;
import com.google.maps.GeoApiContext;
import com.google.maps.PlacesApi;
import com.google.maps.errors.ApiException;
import com.google.maps.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/location")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LocationController {

    @Autowired
    LocationDetailService locationDetailService;

    @Autowired
    WeatherService weatherService;

    @Autowired
    ContentBasedRecommedationService recommendationService;

    @Autowired
    DataPreparationService dataPreparationService;

    @Value("${google.maps.api.key}")
    private String googleMapsApiKey;

    @GetMapping("/api/best-locations-in-radius")
    public PlacesSearchResult[] getBestLocations(@RequestParam double lat, @RequestParam double lng, @RequestParam double radius) throws InterruptedException, ApiException, IOException, IOException, ApiException {
        GeoApiContext context = new GeoApiContext.Builder()
                .apiKey(googleMapsApiKey)
                .build();

        LatLng location = new LatLng(lat, lng);
        PlacesSearchResponse response = PlacesApi.nearbySearchQuery(context, location)
                .radius((int) radius)
                .type(PlaceType.TOURIST_ATTRACTION)
                .await();

        return response.results;
    }

    @GetMapping("/api/tourist-attractions-in-radius")
    public LocationsDTO getLocationsInRadius(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radius,
            @RequestParam(required = false) String pageToken,
            @RequestParam(required = false, defaultValue = "turist_attraction") PlaceType locationType,
            @RequestParam(required = false, defaultValue = "prominence") String sortBy
    ) throws InterruptedException, ApiException, IOException {
        System.out.println(locationType.toString());
        return locationDetailService.getLocationsInRadius(lat,lng,radius,pageToken,locationType,sortBy);
    }

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
        System.out.println(locationType.toString());
        PlaceType placeType;
        try {
            placeType = PlaceType.valueOf(locationType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid locationType: " + locationType);
        }
        return recommendationService.recommendPlaces(dataPreparationService.fetchVisitedLocationsFromGooglePlaces(idUser),lat,lng,radius,placeType);
    }

    @GetMapping("/api/details/{placeId}")
    public LocationDetailsDTO getPlaceDetails(@PathVariable String placeId) throws IOException, InterruptedException, ApiException {
        return locationDetailService.getPlaceDetailsWithWiki(placeId);
    }

    @GetMapping("/api/detailsWithoutWiki/{placeId}")
    public PlaceDetails getPlaceDetailsWithoutWiki(@PathVariable String placeId) throws IOException, InterruptedException, ApiException {
        return locationDetailService.getPlaceDetail(placeId);
    }

    @GetMapping("/api/weather")
    public List<WeatherData> getWeather(@RequestParam double lat, @RequestParam double lng, @RequestParam String start, @RequestParam String end) throws IOException, InterruptedException {
        return weatherService.getWeatherData(lat,lng, start,end);
    }
}
