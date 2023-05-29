package com.demo.backend.models.DTO;

import com.google.maps.model.LatLng;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class NewTripInfo {
    private String tripName;
    private Date startDate;
    private Date endDate;
    private int range;
    private LatLng startLocation;
    private List<List<TimeInterval>> tripTimeSlots;
}
