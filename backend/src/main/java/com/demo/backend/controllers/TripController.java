package com.demo.backend.controllers;

import com.demo.backend.models.DTO.NewTripInfo;
import com.demo.backend.models.DTO.PlaceAssignment;
import com.demo.backend.models.DTO.SchedulePlacesRequest;
import com.demo.backend.models.entity.Plan;
import com.demo.backend.services.LocationDetailService;
import com.demo.backend.services.PlanService;
import com.demo.backend.services.TripService;
import com.google.maps.errors.ApiException;
import com.google.maps.model.PlaceDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    PlanService planService;

    @Autowired
    LocationDetailService locationDetailService;

    @PostMapping("/schedule-places")
    public List<List<PlaceAssignment>> schedulePlaces(@RequestBody SchedulePlacesRequest request) throws IOException, InterruptedException, ApiException {
        List<PlaceDetails> placeDetails = new ArrayList<>();
        for (String id : request.getPlaces()){
            System.out.println(id);
            placeDetails.add(locationDetailService.getPlaceDetail(id));
        }
        return tripService.schedulePlaces(request.getTripInfo(), placeDetails);
    }

    @PostMapping("/save-plan")
    public Plan savePlan(@RequestParam Long userID, @RequestBody NewTripInfo newTripInfo){
        return planService.savePlan(userID,newTripInfo);
    }

    @PostMapping("/update-plan")
    public Plan updatePlan(@RequestParam Long PlanID, @RequestBody NewTripInfo newTripInfo){
        return planService.updatePlan(PlanID,newTripInfo);
    }

    @GetMapping("/get-plans")
    public List<NewTripInfo> getPlansByUserId(@RequestParam Long userID) throws IOException, InterruptedException, ApiException {
        return planService.getPlansByUserId(userID);
    }

    @GetMapping("/get-plans-past")
    public List<NewTripInfo> getPlansByUserIdPast(@RequestParam Long userID) throws IOException, InterruptedException, ApiException {
        return planService.getPlansByUserId(userID);
    }

    @DeleteMapping("/delete-plan")
    public ResponseEntity<?> deletePlan(@RequestParam Long planID) {
        try {
            planService.deletePlanById(planID);
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
