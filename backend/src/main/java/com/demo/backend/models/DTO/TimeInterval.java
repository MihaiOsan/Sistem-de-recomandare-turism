package com.demo.backend.models.DTO;

import com.google.maps.model.PlaceDetails;
import lombok.Data;

@Data
public class TimeInterval {
    private String start;
    private String end;
    private String type;
    private PlaceDetails asignedPlace;
}
