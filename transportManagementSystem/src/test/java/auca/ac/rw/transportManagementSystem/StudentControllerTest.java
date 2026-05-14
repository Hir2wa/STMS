package auca.ac.rw.transportManagementSystem;

import auca.ac.rw.transportManagementSystem.service.StudentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false) // Disables Spring Security temporarily so we don't get a 401 Unauthorized during the test
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StudentService studentService;

    @Test
    void testGetAllStudentsEndpoint() throws Exception {
        // Mock the service to return an empty list
        when(studentService.getAllStudents()).thenReturn(Collections.emptyList());

        // Perform a GET request to your API endpoint and expect a 200 OK status
        mockMvc.perform(get("/api/students/all")).andExpect(status().isOk());
    }
}