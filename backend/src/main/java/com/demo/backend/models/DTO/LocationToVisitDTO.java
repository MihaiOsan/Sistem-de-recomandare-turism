package com.demo.backend.models.DTO;

import com.google.maps.model.PlaceDetails;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class LocationToVisitDTO {
    private PlaceDetails place;
    private String wikiDescription;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
    private Double predictedRating;
}
