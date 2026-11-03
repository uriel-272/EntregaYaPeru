package pe.entregaya.api.api;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * Thin JDBC API used by the static client.  The SQL deliberately maps to the
 * existing Spanish schema; no JPA model is needed for the read-heavy screens.
 */
@RestController
@RequestMapping("/api")
public class DeliveryController {
    private final JdbcTemplate db;

    public DeliveryController(JdbcTemplate db) { this.db = db; }

    @GetMapping("/products")
    public List<Map<String, Object>> products() {
        return db.queryForList("""
            SELECT p.producto_id AS id, p.nombre AS name, c.nombre AS category, p.precio AS price,
                   p.stock, p.disponible AS available, NULL AS emoji, NULL AS color,
                   p.descripcion AS description, NULL AS rating
            FROM productos p JOIN categorias c ON c.categoria_id=p.categoria_id ORDER BY p.producto_id
            """);
    }

    @PostMapping("/products")
    public ResponseEntity<Map<String, Object>> createProduct(@RequestBody Map<String, Object> p) {
        Number id = generated("""
            INSERT INTO productos (categoria_id,nombre,descripcion,precio,stock,disponible)
            VALUES ((SELECT categoria_id FROM categorias WHERE nombre=?),?,?,?,?,?)
            """, p.get("category"), p.get("name"), p.get("description"), number(p.get("price")),
                number(p.get("stock")), bool(p.get("available"), true));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", id.longValue(), "message", "Producto creado"));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable long id, @RequestBody Map<String, Object> p) {
        int changed = db.update("""
            UPDATE productos SET categoria_id=(SELECT categoria_id FROM categorias WHERE nombre=?),
              nombre=?,descripcion=?,precio=?,stock=?,disponible=? WHERE producto_id=?
            """, p.get("category"), p.get("name"), p.get("description"), number(p.get("price")),
                number(p.get("stock")), bool(p.get("available"), true), id);
        return changed == 0 ? ResponseEntity.notFound().build() : ResponseEntity.ok(Map.of("id", id));
    }

    @PatchMapping("/products/{id}/availability")
    public ResponseEntity<?> updateProductAvailability(@PathVariable long id, @RequestBody Map<String, Object> body) {
        int changed = db.update("UPDATE productos SET disponible=? WHERE producto_id=?",
                bool(body.get("available"), false), id);
        return changed == 0 ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(Map.of("id", id, "available", bool(body.get("available"), false)));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable long id) {
        int used = db.queryForObject("SELECT COUNT(*) FROM detalle_pedidos WHERE producto_id=?", Integer.class, id);
        if (used > 0) return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "No se puede eliminar un producto incluido en pedidos existentes"));
        int changed = db.update("DELETE FROM productos WHERE producto_id=?", id);
        return changed == 0 ? ResponseEntity.notFound().build() : ResponseEntity.noContent().build();
    }

    @PostMapping("/auth/register")
    @Transactional
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        String firstName = text(body.get("firstName"), "").trim();
        String lastName = text(body.get("lastName"), "").trim();
        String email = text(body.get("email"), "").toLowerCase();
        if (firstName.isBlank() || lastName.isBlank() || email.isBlank() || text(body.get("password"), "").length() < 6)
            return ResponseEntity.badRequest().body(Map.of("error", "Nombres, apellidos, correo y contraseña son obligatorios"));
        String domain = email.substring(email.indexOf('@') + 1);
        String role = switch (domain) {
            case "gmail.com" -> "CLIENTE";
            case "admin.com" -> "ADMINISTRADOR";
            case "repartidor.com" -> "REPARTIDOR";
            default -> "";
        };
        if (role.isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "El correo debe terminar en @gmail.com, @admin.com o @repartidor.com"));
        if (!db.queryForList("SELECT usuario_id FROM usuarios WHERE email=?", email).isEmpty()) return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "El correo ya está registrado"));
        Number roleId = db.queryForObject("SELECT rol_id FROM roles WHERE nombre=?", Number.class, role);
        Number id = generated("INSERT INTO usuarios (rol_id,nombres,apellidos,email,telefono,password_hash,activo) VALUES (?,?,?,?,?,?,1)",
                roleId, firstName, lastName, email,
                text(body.get("phone"), ""), hash(text(body.get("password"), "")));
        if (role.equals("REPARTIDOR")) db.update("INSERT INTO repartidores (repartidor_id) VALUES (?)", id);
        else if (role.equals("CLIENTE")) db.update("INSERT INTO clientes (cliente_id) VALUES (?)", id);
        else db.update("INSERT INTO administradores (administrador_id) VALUES (?)", id);
        return ResponseEntity.status(HttpStatus.CREATED).body(account(id.longValue(), firstName + " " + lastName, email, text(body.get("phone"), ""), role));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> body) {
        String email = text(body.get("email"), "").toLowerCase();
        List<Map<String, Object>> users = db.queryForList("""
            SELECT u.usuario_id id, CONCAT_WS(' ', u.nombres, u.apellidos) name, u.email, u.telefono phone,
                   CASE WHEN r.repartidor_id IS NOT NULL THEN 'REPARTIDOR'
                        WHEN c.cliente_id IS NOT NULL THEN 'CLIENTE' ELSE 'ADMINISTRADOR' END role,
                   u.password_hash passwordHash
            FROM usuarios u LEFT JOIN repartidores r ON r.repartidor_id=u.usuario_id
              LEFT JOIN clientes c ON c.cliente_id=u.usuario_id
            WHERE u.email=? AND u.activo=1
            """, email);
        if (users.isEmpty() || !Objects.equals(hash(text(body.get("password"), "")), users.get(0).get("passwordHash")))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Credenciales incorrectas"));
        Map<String, Object> u = users.get(0);
        return ResponseEntity.ok(account(((Number) u.get("id")).longValue(), text(u.get("name"), ""), email,
                text(u.get("phone"), ""), text(u.get("role"), "").toLowerCase()));
    }

    @PatchMapping("/auth/account")
    public ResponseEntity<?> updateAccount(@RequestBody Map<String, Object> body) {
        String email = text(body.get("email"), "").toLowerCase();
        int changed = db.update("UPDATE usuarios SET nombres=?, apellidos=?, telefono=? WHERE email=?",
                firstName(text(body.get("name"), "Usuario")), lastName(text(body.get("name"), "")),
                text(body.get("phone"), ""), email);
        return changed == 0 ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(accountForEmail(email));
    }

    @PatchMapping("/auth/password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, Object> body) {
        String email = text(body.get("email"), "").toLowerCase();
        String password = text(body.get("password"), "");
        if (password.length() < 6) return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe tener al menos 6 caracteres"));
        int changed = db.update("UPDATE usuarios SET password_hash=? WHERE email=?", hash(password), email);
        return changed == 0 ? ResponseEntity.notFound().build() : ResponseEntity.ok(Map.of("updated", true));
    }

    @GetMapping("/orders")
    public List<Map<String, Object>> orders(@RequestParam(required = false) String customerEmail) {
        String sql = """
            SELECT p.codigo id, u.nombres customer, u.email customerEmail, u.telefono phone,
                   p.direccion_entrega address, p.referencia_entrega reference, p.creado_en createdAt,
                   LOWER(REPLACE(p.estado, '_', ' ')) status, COALESCE(r.nombres,'') courier,
                   COALESCE(r.email,'') courierEmail, p.subtotal, p.total, p.tarifa_entrega deliveryFee
            FROM pedidos p JOIN clientes cl ON cl.cliente_id=p.cliente_id
              JOIN usuarios u ON u.usuario_id=cl.cliente_id
            LEFT JOIN repartidores rp ON rp.repartidor_id=p.repartidor_id
              LEFT JOIN usuarios r ON r.usuario_id=rp.repartidor_id
            """ + (customerEmail == null ? "" : " WHERE u.email=?") + " ORDER BY p.creado_en DESC, p.pedido_id DESC";
        List<Map<String, Object>> result = customerEmail == null ? db.queryForList(sql) : db.queryForList(sql, customerEmail);
        result.forEach(o -> o.put("items", db.queryForList("""
            SELECT d.producto_id productId, d.nombre_producto name, NULL emoji,
                   d.cantidad quantity, d.precio_unitario price
            FROM detalle_pedidos d
            JOIN pedidos p ON p.pedido_id=d.pedido_id
            WHERE p.codigo=?
            ORDER BY d.detalle_id
            """, o.get("id"))));
        return result;
    }

    @PostMapping("/orders")
    @Transactional
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        List<Map<String, Object>> customers = db.queryForList("""
            SELECT c.cliente_id id FROM clientes c JOIN usuarios u ON u.usuario_id=c.cliente_id
            WHERE u.email=? AND u.activo=1
            """, text(body.get("customerEmail"), "").toLowerCase());
        if (customers.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "La cuenta del cliente no está activa"));
        Map<String, Object> customer = customers.get(0);
        List<?> orderItems = body.get("items") instanceof List<?> list ? list : List.of();
        if (orderItems.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "El pedido debe contener al menos un producto"));
        double subtotal = 0;
        List<Map<String, Object>> verifiedItems = new ArrayList<>();
        for (Object raw : orderItems) {
            if (!(raw instanceof Map<?, ?> item)) return ResponseEntity.badRequest().body(Map.of("error", "Producto inválido"));
            long productId;
            int quantity;
            try {
                productId = Long.parseLong(text(item.get("productId"), "0"));
                quantity = Integer.parseInt(text(item.get("quantity"), "0"));
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Producto o cantidad inválidos"));
            }
            if (quantity < 1) return ResponseEntity.badRequest().body(Map.of("error", "La cantidad debe ser positiva"));
            List<Map<String, Object>> products = db.queryForList(
                    "SELECT nombre name, precio price, stock, disponible available FROM productos WHERE producto_id=?",
                    productId);
            if (products.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "El producto ya no existe"));
            Map<String, Object> product = products.get(0);
            if (!truthy(product.get("available")) || ((Number) product.get("stock")).intValue() < quantity)
                return ResponseEntity.badRequest().body(Map.of("error", "El producto no tiene stock suficiente"));
            double price = ((Number) product.get("price")).doubleValue();
            subtotal += price * quantity;
            verifiedItems.add(Map.of("productId", productId, "name", product.get("name"), "price", price, "quantity", quantity));
        }
        double fee = Double.parseDouble(text(body.get("deliveryFee"), "0"));
        String code = "EY-" + System.currentTimeMillis();
        Number id = generated("""
            INSERT INTO pedidos (codigo,cliente_id,direccion_entrega,referencia_entrega,subtotal,tarifa_entrega,total,estado,creado_en)
            VALUES (?,?,?,?,?,?,?,?,NOW())
            """, code, customer.get("id"), body.get("address"), body.get("reference"), subtotal, fee, subtotal + fee, "PENDIENTE");
        for (Map<String, Object> item : verifiedItems) {
            db.update("""
                INSERT INTO detalle_pedidos (pedido_id,producto_id,nombre_producto,precio_unitario,cantidad,importe)
                VALUES (?,?,?,?,?,?)
                """, id, item.get("productId"), item.get("name"), item.get("price"), item.get("quantity"),
                number(item.get("price")) instanceof Number price ? price.doubleValue() * Double.parseDouble(text(item.get("quantity"), "0")) : 0);
            int changed = db.update("UPDATE productos SET stock=stock-? WHERE producto_id=? AND stock>=?",
                    item.get("quantity"), item.get("productId"), item.get("quantity"));
            if (changed == 0) throw new IllegalStateException("El stock cambió mientras se registraba el pedido");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", code, "status", "pendiente"));
    }

    @PatchMapping("/orders/{id}")
    @Transactional
    public ResponseEntity<?> updateOrder(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String orderCode = id.startsWith("EY-") ? id : "EY-" + id;
        String status = text(body.get("status"), "");
        if (!status.isBlank() && !List.of("PENDIENTE", "ASIGNADO", "EN RUTA", "ENTREGADO", "CANCELADO").contains(status.toUpperCase()))
            return ResponseEntity.badRequest().body(Map.of("error", "Estado de pedido inválido"));
        List<Map<String, Object>> current = db.queryForList("SELECT pedido_id, repartidor_id, estado FROM pedidos WHERE codigo=?", orderCode);
        if (current.isEmpty()) return ResponseEntity.notFound().build();
        String currentStatus = text(current.get(0).get("estado"), "");
        if ("CANCELADO".equals(currentStatus) || "ENTREGADO".equals(currentStatus))
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "El pedido ya no admite cambios"));
        if ("CANCELADO".equalsIgnoreCase(status) && !"PENDIENTE".equals(currentStatus))
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Solo se puede cancelar un pedido pendiente"));
        if (body.containsKey("courier")) {
            String courier = text(body.get("courier"), "");
            if (!courier.isBlank() && db.queryForList("""
                    SELECT rp.repartidor_id FROM repartidores rp JOIN usuarios u ON u.usuario_id=rp.repartidor_id
                    WHERE u.email=? AND u.activo=1
                    """, courier).isEmpty())
                return ResponseEntity.badRequest().body(Map.of("error", "El repartidor no existe o está desactivado"));
            db.update("""
            UPDATE pedidos SET repartidor_id=(SELECT repartidor_id FROM repartidores rp
              JOIN usuarios u ON u.usuario_id=rp.repartidor_id WHERE u.email=?), estado=IF(?='',estado,'ASIGNADO')
            WHERE codigo=?
            """, body.get("courier"), body.get("courier"), orderCode);
        }
        if ("CANCELADO".equalsIgnoreCase(status)) {
            db.update("""
                UPDATE productos p JOIN detalle_pedidos d ON d.producto_id=p.producto_id
                JOIN pedidos o ON o.pedido_id=d.pedido_id
                SET p.stock=p.stock+d.cantidad
                WHERE o.codigo=?
                """, orderCode);
        }
        if (!status.isBlank()) db.update("UPDATE pedidos SET estado=?, repartidor_id=IF(?='CANCELADO',NULL,repartidor_id) WHERE codigo=?", status.toUpperCase(), status.toUpperCase(), orderCode);
        return ResponseEntity.ok(Map.of("id", id, "status", status));
    }

    @PatchMapping("/orders/{id}/assignment")
    public ResponseEntity<?> assignOrder(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return updateOrder(id, Map.of("courier", text(body.get("courier"), ""), "status", "asignado"));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> statusOrder(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return updateOrder(id, Map.of("status", text(body.get("status"), "")));
    }

    @PatchMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String id) {
        return updateOrder(id, Map.of("status", "cancelado"));
    }

    @GetMapping("/couriers")
    public List<Map<String, Object>> couriers() {
        return db.queryForList("""
            SELECT rp.repartidor_id id,u.nombres name,u.email,u.telefono phone,u.activo active
            FROM repartidores rp JOIN usuarios u ON u.usuario_id=rp.repartidor_id
            """);
    }

    @PatchMapping("/couriers/{id}/status")
    public ResponseEntity<?> courierStatus(@PathVariable long id, @RequestBody Map<String, Object> body) {
        boolean active = bool(body.get("active"), true);
        int changed = db.update("""
            UPDATE usuarios SET activo=?
            WHERE usuario_id=? AND EXISTS (SELECT 1 FROM repartidores WHERE repartidor_id=?)
            """, active, id, id);
        return changed == 0 ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(Map.of("id", id, "active", active));
    }

    @DeleteMapping("/couriers/{id}")
    @Transactional
    public ResponseEntity<?> deleteCourier(@PathVariable long id) {
        int exists = db.queryForObject("SELECT COUNT(*) FROM repartidores WHERE repartidor_id=?", Integer.class, id);
        if (exists == 0) return ResponseEntity.notFound().build();
        int activeOrders = db.queryForObject("""
            SELECT COUNT(*) FROM pedidos
            WHERE repartidor_id=? AND estado IN ('ASIGNADO','EN RUTA')
            """, Integer.class, id);
        if (activeOrders > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Reasigna los pedidos activos antes de eliminar este repartidor"));
        }
        db.update("UPDATE pedidos SET repartidor_id=NULL WHERE repartidor_id=?", id);
        db.update("UPDATE incidencias SET repartidor_id=NULL WHERE repartidor_id=?", id);
        db.update("DELETE FROM repartidores WHERE repartidor_id=?", id);
        db.update("DELETE FROM usuarios WHERE usuario_id=?", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/incidents")
    public List<Map<String, Object>> incidents() {
        return db.queryForList("""
            SELECT incidencia_id id, (SELECT codigo FROM pedidos p WHERE p.pedido_id=i.pedido_id) orderId,
              motivo reason, descripcion description, resuelta resolved, creada_en createdAt
            FROM incidencias i ORDER BY creada_en DESC
            """);
    }

    @PostMapping("/incidents")
    public ResponseEntity<?> incident(@RequestBody Map<String, Object> body) {
        String orderCode = text(body.get("orderId"), "");
        Number orderId = db.queryForObject("SELECT pedido_id FROM pedidos WHERE codigo=?", Number.class, orderCode);
        Number courier = body.get("courierId") == null ? null : Long.valueOf(text(body.get("courierId"), "0"));
        Number id = generated("INSERT INTO incidencias (pedido_id,repartidor_id,motivo,descripcion,resuelta,creada_en) VALUES (?,?,?,?,0,NOW())",
                orderId, courier, body.get("reason"), body.get("description"));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", id.longValue()));
    }

    @PatchMapping("/incidents/{id}")
    public ResponseEntity<?> resolveIncident(@PathVariable long id) {
        int changed = db.update("UPDATE incidencias SET resuelta=1 WHERE incidencia_id=?", id);
        return changed == 0 ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(Map.of("id", id, "resolved", true));
    }

    private Number generated(String sql, Object... args) {
        GeneratedKeyHolder keys = new GeneratedKeyHolder();
        db.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            for (int i = 0; i < args.length; i++) ps.setObject(i + 1, args[i]);
            return ps;
        }, keys);
        return keys.getKey() == null ? 0 : keys.getKey();
    }
    private static String text(Object value, String fallback) { return value == null ? fallback : String.valueOf(value); }
    private static Object number(Object value) { return value instanceof Number ? value : Double.valueOf(text(value, "0")); }
    private static boolean bool(Object value, boolean fallback) { return value == null ? fallback : Boolean.parseBoolean(String.valueOf(value)); }
    private static boolean truthy(Object value) {
        return value instanceof Boolean b ? b : value instanceof Number n ? n.intValue() != 0 : Boolean.parseBoolean(text(value, "false"));
    }
    private static String firstName(String name) { return name.trim().split("\\s+", 2)[0]; }
    private static String lastName(String name) { String[] p = name.trim().split("\\s+", 2); return p.length > 1 ? p[1] : ""; }
    private static String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception e) { throw new IllegalStateException(e); }
    }
    private static Map<String, Object> account(long id, String name, String email, String phone, String role) {
        return Map.of("id", id, "name", name, "email", email, "phone", phone, "role", role, "addresses", new ArrayList<>());
    }

    private Map<String, Object> accountForEmail(String email) {
        Map<String, Object> user = db.queryForMap("""
            SELECT u.usuario_id id, CONCAT_WS(' ', u.nombres, u.apellidos) name, u.email,
                   u.telefono phone, LOWER(r.nombre) role
            FROM usuarios u JOIN roles r ON r.rol_id=u.rol_id WHERE u.email=?
            """, email);
        return account(((Number) user.get("id")).longValue(), text(user.get("name"), ""), email,
                text(user.get("phone"), ""), text(user.get("role"), ""));
    }
}
