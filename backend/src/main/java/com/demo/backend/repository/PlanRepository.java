package com.demo.backend.repository;

import com.demo.backend.models.entity.Plan;
import com.demo.backend.models.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Long> {
    @Query("SELECT p FROM Plan p WHERE p.user.id = :userId AND p.startDate < CURRENT_TIMESTAMP")
    List<Plan> findVisitedPlansByUserId(@Param("userId") Long userId);

    List<Plan> findByUser(User user);

    List<Plan> findByUserAndEndDateBefore(User user, LocalDate endDate);
}
