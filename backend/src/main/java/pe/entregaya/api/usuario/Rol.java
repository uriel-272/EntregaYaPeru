package pe.entregaya.api.usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "roles")
public class Rol {

    public enum Nombre {
        CLIENTE,
        ADMINISTRADOR,
        REPARTIDOR
    }

    @Id
    @Column(name = "rol_id", columnDefinition = "tinyint unsigned")
    private Byte id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 30)
    private Nombre nombre;

    protected Rol() {
    }

    public Byte getId() {
        return id;
    }

    public Nombre getNombre() {
        return nombre;
    }
}
