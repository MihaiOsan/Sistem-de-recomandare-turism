package com.demo.backend.repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.demo.backend.models.entity.Objective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObjectiveRepository extends JpaRepository<Objective, Long> {

    @Query(value = "SELECT objective.id_locaction FROM objective objective WHERE objective.id_locaction IS NOT NULL GROUP BY objective.id_locaction ORDER BY COUNT(*) DESC LIMIT 12",
            nativeQuery = true)
    List<String> findTopLocations();
}
