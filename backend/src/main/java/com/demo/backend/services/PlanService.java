package com.demo.backend.services;

import com.demo.backend.models.DTO.NewTripInfo;
import com.demo.backend.models.DTO.TimeInterval;
import com.demo.backend.models.entity.Objective;
import com.demo.backend.models.entity.Plan;
import com.demo.backend.models.entity.User;
import com.demo.backend.repository.ObjectiveRepository;
import com.demo.backend.repository.PlanRepository;
import com.demo.backend.repository.UserRepository;
import com.google.maps.errors.ApiException;
import com.google.maps.model.LatLng;
import com.google.maps.model.PlaceDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class PlanService {

    @Autowired
    PlanRepository planRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    LocationDetailService locationDetailService;

    @Autowired
    ObjectiveRepository objectiveRepository;

    public Plan savePlan(Long userId, NewTripInfo newTripInfo){
        User user = userRepository.getReferenceById(userId);
        Plan plan = new Plan();
        System.out.println(user.getEmail());
        System.out.println(newTripInfo.getTripName());
        List<Objective> objectives = new ArrayList<>();
        LocalDate startDate = newTripInfo.getStartDate().toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        LocalDate endDate = newTripInfo.getEndDate().toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();

        ZonedDateTime startDateTime = startDate.atStartOfDay(ZoneId.systemDefault());
        ZonedDateTime endDateTime = endDate.atStartOfDay(ZoneId.systemDefault());

        plan.setStartDate(startDateTime);
        plan.setEndDate(endDateTime);

        for (int i = 0; i < newTripInfo.getTripTimeSlots().size(); i++)
        {
            for (TimeInterval timeInterval : newTripInfo.getTripTimeSlots().get(i)){
                Objective objective = new Objective();
                objective.setType(timeInterval.getType());
                String[] startParts = timeInterval.getStart().split(":");
                int startHour = Integer.parseInt(startParts[0]);
                int startMinute = Integer.parseInt(startParts[1]);

                String[] endParts = timeInterval.getEnd().split(":");
                int endHour = Integer.parseInt(endParts[0]);
                int endMinute = Integer.parseInt(endParts[1]);

                // Add `i` days to the startDate
                LocalDate currentDay = startDate.plusDays(i);

                ZonedDateTime startTime = ZonedDateTime.of(currentDay.getYear(), currentDay.getMonthValue(),
                        currentDay.getDayOfMonth(), startHour, startMinute, 0, 0,
                        ZoneId.systemDefault());
                ZonedDateTime endTime = ZonedDateTime.of(currentDay.getYear(), currentDay.getMonthValue(),
                        currentDay.getDayOfMonth(), endHour, endMinute, 0, 0,
                        ZoneId.systemDefault());
                objective.setStartTime(startTime);
                objective.setEndTime(endTime);
                if (timeInterval.getAsignedPlace()!=null)
                    objective.setIdLocaction(timeInterval.getAsignedPlace().placeId);
                objective.setPlan(plan);
                objectives.add(objective);
            }
        }
        plan.setRadius(newTripInfo.getRange());
        plan.setLng(newTripInfo.getStartLocation().lng);
        plan.setLat(newTripInfo.getStartLocation().lat);
        plan.setTitle(newTripInfo.getTripName());
        plan.setObjectives(objectives);
        plan.setUser(user);
        System.out.println(plan.getTitle());
        return planRepository.saveAndFlush(plan);
    }

    public List<NewTripInfo> getPlansByUserId(Long userId) throws IOException, InterruptedException, ApiException {
        User user = userRepository.getReferenceById(userId);
        List<Plan> plans = planRepository.findByUser(user);
        List<NewTripInfo> newTripInfos = new ArrayList<>();

        for (Plan plan : plans) {
            NewTripInfo newTripInfo = new NewTripInfo();
            newTripInfo.setPlanID(plan.getId());
            newTripInfo.setStartDate(Date.from(plan.getStartDate().toInstant().atZone(ZoneId.systemDefault()).toInstant()));
            newTripInfo.setEndDate(Date.from(plan.getEndDate().toInstant().atZone(ZoneId.systemDefault()).toInstant()));
            newTripInfo.setTripName(plan.getTitle());
            newTripInfo.setStartLocation(new LatLng(plan.getLat(), plan.getLng()));
            newTripInfo.setRange((int)plan.getRadius());

            // Create a map to group TimeIntervals by date
            Map<LocalDate, List<TimeInterval>> dateToTimeIntervalsMap = new LinkedHashMap<>();

            for (Objective objective : plan.getObjectives()) {
                TimeInterval timeInterval = new TimeInterval();

                timeInterval.setType(objective.getType());
                timeInterval.setStart(objective.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")));
                timeInterval.setEnd(objective.getEndTime().format(DateTimeFormatter.ofPattern("HH:mm")));

                if (objective.getIdLocaction()!=null)
                    if (!objective.getIdLocaction().isEmpty()){
                        PlaceDetails assignedPlace = locationDetailService.getPlaceDetail(objective.getIdLocaction());
                        timeInterval.setAsignedPlace(assignedPlace);
                    }
                LocalDate date = objective.getStartTime().toLocalDate();  // Extract date from ZonedDateTime


                if (!dateToTimeIntervalsMap.containsKey(date)) {
                    dateToTimeIntervalsMap.put(date, new ArrayList<>());
                }
                dateToTimeIntervalsMap.get(date).add(timeInterval);

                // Sort time intervals by start time within the map
                dateToTimeIntervalsMap.get(date).sort((o1, o2) -> {
                    LocalTime time1 = LocalTime.parse(o1.getStart());
                    LocalTime time2 = LocalTime.parse(o2.getStart());

                    return time1.compareTo(time2);
                });
            }

            // Get the keys (dates) and sort them
            List<LocalDate> sortedDates = new ArrayList<>(dateToTimeIntervalsMap.keySet());
            Collections.sort(sortedDates);

            // Create the tripTimeSlots list in the order of sortedDates
            List<List<TimeInterval>> tripTimeSlots = new ArrayList<>();
            for (LocalDate date : sortedDates) {
                tripTimeSlots.add(dateToTimeIntervalsMap.get(date));
            }

            newTripInfo.setTripTimeSlots(tripTimeSlots);

            newTripInfos.add(newTripInfo);
        }
        return newTripInfos;
    }

    public void deletePlanById(Long planId) {
        Optional<Plan> optionalPlan = planRepository.findById(planId);
        if (optionalPlan.isPresent()) {
            planRepository.delete(optionalPlan.get());
        } else {
            throw new RuntimeException("Plan not found with id: " + planId);
        }
    }

    public Plan updatePlan(Long planId, NewTripInfo updatedTripInfo) {
        Optional<Plan> optionalPlan = planRepository.findById(planId);
        if (optionalPlan.isPresent()) {
            Plan plan = optionalPlan.get();

            List<Objective> oldObjectives = new ArrayList<>(plan.getObjectives());
            plan.getObjectives().clear();  // Clear the objectives in the plan

            for (Objective oldObjective : oldObjectives) {
                objectiveRepository.delete(oldObjective);
            }
            objectiveRepository.flush(); // Flush the changes to the database


            // Prepare the new objectives based on the updated trip information
            LocalDate startDate = updatedTripInfo.getStartDate().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();

            for (int i = 0; i < updatedTripInfo.getTripTimeSlots().size(); i++) {
                for (TimeInterval timeInterval : updatedTripInfo.getTripTimeSlots().get(i)){
                    Objective objective = new Objective();
                    objective.setType(timeInterval.getType());

                    String[] startParts = timeInterval.getStart().split(":");
                    int startHour = Integer.parseInt(startParts[0]);
                    int startMinute = Integer.parseInt(startParts[1]);

                    String[] endParts = timeInterval.getEnd().split(":");
                    int endHour = Integer.parseInt(endParts[0]);
                    int endMinute = Integer.parseInt(endParts[1]);

                    // Add `i` days to the startDate
                    LocalDate currentDay = startDate.plusDays(i);

                    ZonedDateTime startTime = ZonedDateTime.of(currentDay.getYear(), currentDay.getMonthValue(),
                            currentDay.getDayOfMonth(), startHour, startMinute, 0, 0,
                            ZoneId.systemDefault());
                    ZonedDateTime endTime = ZonedDateTime.of(currentDay.getYear(), currentDay.getMonthValue(),
                            currentDay.getDayOfMonth(), endHour, endMinute, 0, 0,
                            ZoneId.systemDefault());
                    objective.setStartTime(startTime);
                    objective.setEndTime(endTime);

                    if (timeInterval.getAsignedPlace() != null)
                        objective.setIdLocaction(timeInterval.getAsignedPlace().placeId);

                    objective.setPlan(plan);
                    plan.getObjectives().add(objective);
                }
            }

            return planRepository.saveAndFlush(plan);
        } else {
            throw new RuntimeException("Plan not found with id: " + planId);
        }
    }

    public List<NewTripInfo> getPlansByUserIdBefore(Long userId) throws IOException, InterruptedException, ApiException {
        User user = userRepository.getReferenceById(userId);
        LocalDate currentDate = LocalDate.now();
        List<Plan> plans = planRepository.findByUserAndEndDateBefore(user, currentDate);

        List<NewTripInfo> newTripInfos = new ArrayList<>();

        for (Plan plan : plans) {
            NewTripInfo newTripInfo = new NewTripInfo();
            newTripInfo.setPlanID(plan.getId());
            newTripInfo.setStartDate(Date.from(plan.getStartDate().toInstant().atZone(ZoneId.systemDefault()).toInstant()));
            newTripInfo.setEndDate(Date.from(plan.getEndDate().toInstant().atZone(ZoneId.systemDefault()).toInstant()));
            newTripInfo.setTripName(plan.getTitle());
            newTripInfo.setStartLocation(new LatLng(plan.getLat(), plan.getLng()));
            newTripInfo.setRange((int)plan.getRadius());

            // Create a map to group TimeIntervals by date
            Map<LocalDate, List<TimeInterval>> dateToTimeIntervalsMap = new LinkedHashMap<>();

            for (Objective objective : plan.getObjectives()) {
                TimeInterval timeInterval = new TimeInterval();

                timeInterval.setType(objective.getType());
                timeInterval.setStart(objective.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")));
                timeInterval.setEnd(objective.getEndTime().format(DateTimeFormatter.ofPattern("HH:mm")));

                if (objective.getIdLocaction()!=null)
                    if (!objective.getIdLocaction().isEmpty()){
                        PlaceDetails assignedPlace = locationDetailService.getPlaceDetail(objective.getIdLocaction());
                        timeInterval.setAsignedPlace(assignedPlace);
                    }
                LocalDate date = objective.getStartTime().toLocalDate();  // Extract date from ZonedDateTime


                if (!dateToTimeIntervalsMap.containsKey(date)) {
                    dateToTimeIntervalsMap.put(date, new ArrayList<>());
                }
                dateToTimeIntervalsMap.get(date).add(timeInterval);

                // Sort time intervals by start time within the map
                dateToTimeIntervalsMap.get(date).sort((o1, o2) -> {
                    LocalTime time1 = LocalTime.parse(o1.getStart());
                    LocalTime time2 = LocalTime.parse(o2.getStart());

                    return time1.compareTo(time2);
                });
            }

            // Get the keys (dates) and sort them
            List<LocalDate> sortedDates = new ArrayList<>(dateToTimeIntervalsMap.keySet());
            Collections.sort(sortedDates);

            // Create the tripTimeSlots list in the order of sortedDates
            List<List<TimeInterval>> tripTimeSlots = new ArrayList<>();
            for (LocalDate date : sortedDates) {
                tripTimeSlots.add(dateToTimeIntervalsMap.get(date));
            }

            newTripInfo.setTripTimeSlots(tripTimeSlots);

            newTripInfos.add(newTripInfo);
        }
        return newTripInfos;
    }


}
