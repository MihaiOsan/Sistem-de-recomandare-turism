package com.demo.backend.models.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Setter
@Getter
@NoArgsConstructor
@Table(name = "plan", schema = "public")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Plan {
    @Id
    @Column(name = "plan_id")
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private ZonedDateTime startDate;

    @Column(nullable = false)
    private ZonedDateTime endDate;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Objective> objectives;

    @ManyToOne
    @JoinColumn(name = "iduser", referencedColumnName = "user_id")
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    double lat;
    @Column(nullable = false)
    double lng;

    @Column(nullable = false)
    double radius;
}
