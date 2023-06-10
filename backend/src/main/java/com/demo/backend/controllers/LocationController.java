package com.demo.backend.controllers;

import com.demo.backend.models.DTO.LocationDetailsDTO;
import com.demo.backend.models.DTO.LocationsDTO;
import com.demo.backend.services.LocationDetailService;
import com.google.maps.errors.ApiException;
import com.google.maps.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/location")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LocationController {

    @Autowired
    LocationDetailService locationDetailService;

    @GetMapping("/api/tourist-attractions-in-radius")
    public LocationsDTO getLocationsInRadius(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radius,
            @RequestParam(required = false) String pageToken,
            @RequestParam(required = false, defaultValue = "turist_attraction") PlaceType locationType,
            @RequestParam(required = false, defaultValue = "prominence") String sortBy
    ) throws InterruptedException, ApiException, IOException {
        return locationDetailService.getLocationsInRadius(lat,lng,radius,pageToken,locationType,sortBy);
    }


    @GetMapping("/api/details/{placeId}")
    public LocationDetailsDTO getPlaceDetails(@PathVariable String placeId) throws IOException, InterruptedException, ApiException {
        return locationDetailService.getPlaceDetailsWithWiki(placeId);
    }

    @GetMapping("/api/detailsWithoutWiki/{placeId}")
    public PlaceDetails getPlaceDetailsWithoutWiki(@PathVariable String placeId) throws IOException, InterruptedException, ApiException {
        return locationDetailService.getPlaceDetail(placeId);
    }
}
