package pe.entregaya.api.health;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/db")
    public ResponseEntity<Map<String, Object>> databaseStatus() {
        Integer userCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM usuarios",
                Integer.class
        );

        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "database", "entregaya",
                "usuarios", userCount,
                "timestamp", OffsetDateTime.now(ZoneOffset.UTC).toString()
        ));
    }
}
