package auca.ac.rw.transportManagementSystem;

import auca.ac.rw.transportManagementSystem.model.Bus;
import auca.ac.rw.transportManagementSystem.repository.BusRepository;
import auca.ac.rw.transportManagementSystem.service.BusService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BusServiceTest {

    @Mock
    private BusRepository busRepository;

    @InjectMocks
    private BusService busService;

    @Test
    void testGetAllBuses() {
        Bus bus1 = new Bus();
        Bus bus2 = new Bus();
        
        when(busRepository.findAllWithDriver()).thenReturn(Arrays.asList(bus1, bus2));

        List<Bus> result = busService.getAllBuses();

        assertNotNull(result);
        assertEquals(2, result.size());
    }
}