package com.demo.backend.models.DTO;

import lombok.Data;

import java.util.Date;

@Data
public class WeatherData {
    Date date;
    Double temperature;
    Double humidity;
    Double temperatureMax;
    Double temperatureMin;
    String icon;

}
