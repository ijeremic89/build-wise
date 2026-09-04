package com.jere.build_wise.settings;

import com.jere.build_wise.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "project_settings")
@Getter
@Setter
@NoArgsConstructor
public class ProjectSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "planned_construction_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal plannedConstructionCost;
}
