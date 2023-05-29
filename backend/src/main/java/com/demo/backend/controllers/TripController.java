package com.demo.backend.controllers;

import com.demo.backend.models.DTO.NewTripInfo;
import com.demo.backend.models.DTO.PlaceAssignment;
import com.demo.backend.models.DTO.SchedulePlacesRequest;
import com.demo.backend.services.LocationDetailService;
import com.demo.backend.services.TripService;
import com.google.maps.errors.ApiException;
import com.google.maps.model.PlaceDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/trip")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TripController {
    @Autowired
    TripService tripService;

    @Autowired
    LocationDetailService locationDetailService;

    @PostMapping("/schedule-places")
    public List<List<PlaceAssignment>> schedulePlaces(@RequestBody SchedulePlacesRequest request) throws IOException, InterruptedException, ApiException {
        List<PlaceDetails> placeDetails = new ArrayList<>();
        for (String id : request.getPlaces()){
            placeDetails.add(locationDetailService.getPlaceDetail(id));
        }
        return tripService.schedulePlaces(request.getTripInfo(), placeDetails);
    }
}
