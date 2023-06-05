package com.demo.backend.models.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;

@Entity
@Setter
@Getter
@NoArgsConstructor
@Table(name = "objective", schema = "public")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Objective {
    @Id
    @Column(name = "objective_id")
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;


    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private ZonedDateTime startTime;

    @Column(nullable = false)
    private ZonedDateTime endTime;

    @Column(nullable = true)
    private String idLocaction;

    @ManyToOne
    @JoinColumn(name = "idPlan", referencedColumnName = "plan_id")
    @JsonIgnore
    private Plan plan;


}
