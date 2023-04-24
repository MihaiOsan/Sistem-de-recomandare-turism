package com.demo.backend.controllers;

import com.google.maps.GeoApiContext;
import com.google.maps.PlacesApi;
import com.google.maps.errors.ApiException;
import com.google.maps.model.LatLng;
import com.google.maps.model.PlacesSearchResponse;
import com.google.maps.model.PlacesSearchResult;
import com.google.maps.model.RankBy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/location")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LocationController {

    @Value("${google.maps.api.key}")
    private String googleMapsApiKey;

    @GetMapping("/api/best-locations")
    public PlacesSearchResult[] getBestLocations(@RequestParam double lat, @RequestParam double lng, @RequestParam double radius) throws InterruptedException, ApiException, IOException, IOException, ApiException {
        GeoApiContext context = new GeoApiContext.Builder()
                .apiKey(googleMapsApiKey)
                .build();

        LatLng location = new LatLng(lat, lng);
        PlacesSearchResponse response = PlacesApi.nearbySearchQuery(context, location)
                .radius((int) radius)
                .rankby(RankBy.PROMINENCE)
                .await();

        return response.results;
    }
}
