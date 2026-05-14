package auca.ac.rw.transportManagementSystem.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;

@Entity
@Data
@Table(name = "schedules")
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private LocalTime departureTime;
    private LocalTime arrivalTime;

    // Day of the week (MONDAY, TUESDAY...)
    private String dayOfWeek;

    @ManyToOne
    @JoinColumn(name = "route_id")
    private Route route;

    @ManyToOne
    @JoinColumn(name = "bus_id")
    private Bus bus;
}
