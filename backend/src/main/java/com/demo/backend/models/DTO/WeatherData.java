package com.demo.backend.models.DTO;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class WeatherData {
    Date date;
    Double temperature;
    Double humidity;
    Double temperatureMax;
    Double temperatureMin;
    String description;
    Double precProb;
    String precipType;
    String icon;

}
