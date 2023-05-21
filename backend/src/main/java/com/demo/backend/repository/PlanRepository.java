package com.demo.backend.repository;

import com.demo.backend.models.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Long> {
    @Query("SELECT p FROM Plan p WHERE p.user.id = :userId AND p.startDate < CURRENT_TIMESTAMP")
    List<Plan> findVisitedPlansByUserId(@Param("userId") Long userId);
}
