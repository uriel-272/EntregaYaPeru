CREATE DATABASE IF NOT EXISTS entregaya
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE entregaya;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS incidencias, detalle_pedidos, pedidos, repartidores,
  clientes, administradores, usuarios, productos, categorias, roles;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE roles (
  rol_id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO roles (rol_id, nombre) VALUES
  (1, 'CLIENTE'), (2, 'ADMINISTRADOR'), (3, 'REPARTIDOR');

CREATE TABLE usuarios (
  usuario_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  rol_id TINYINT UNSIGNED NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100),
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES roles (rol_id)
) ENGINE=InnoDB;

CREATE TABLE clientes (
  cliente_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  CONSTRAINT fk_cliente_usuario FOREIGN KEY (cliente_id) REFERENCES usuarios (usuario_id)
) ENGINE=InnoDB;

CREATE TABLE administradores (
  administrador_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  CONSTRAINT fk_admin_usuario FOREIGN KEY (administrador_id) REFERENCES usuarios (usuario_id)
) ENGINE=InnoDB;

CREATE TABLE repartidores (
  repartidor_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  CONSTRAINT fk_repartidor_usuario FOREIGN KEY (repartidor_id) REFERENCES usuarios (usuario_id)
) ENGINE=InnoDB;

CREATE TABLE categorias (
  categoria_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO categorias (nombre) VALUES
  ('Comida'), ('Ropa'), ('Accesorios'), ('Hogar');

CREATE TABLE productos (
  producto_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  categoria_id SMALLINT UNSIGNED NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion VARCHAR(500),
  precio DECIMAL(10,2) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (categoria_id)
) ENGINE=InnoDB;

CREATE TABLE pedidos (
  pedido_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  cliente_id BIGINT UNSIGNED NOT NULL,
  repartidor_id BIGINT UNSIGNED,
  direccion_entrega VARCHAR(300) NOT NULL,
  referencia_entrega VARCHAR(300),
  subtotal DECIMAL(10,2) NOT NULL,
  tarifa_entrega DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pedido_cliente FOREIGN KEY (cliente_id) REFERENCES clientes (cliente_id),
  CONSTRAINT fk_pedido_repartidor FOREIGN KEY (repartidor_id) REFERENCES repartidores (repartidor_id)
) ENGINE=InnoDB;

CREATE TABLE detalle_pedidos (
  detalle_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  pedido_id BIGINT UNSIGNED NOT NULL,
  producto_id BIGINT UNSIGNED NOT NULL,
  nombre_producto VARCHAR(150) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  cantidad INT UNSIGNED NOT NULL,
  importe DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_detalle_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos (pedido_id),
  CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES productos (producto_id)
) ENGINE=InnoDB;

CREATE TABLE incidencias (
  incidencia_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  pedido_id BIGINT UNSIGNED NOT NULL,
  repartidor_id BIGINT UNSIGNED,
  motivo VARCHAR(100) NOT NULL,
  descripcion VARCHAR(500) NOT NULL,
  resuelta BOOLEAN NOT NULL DEFAULT FALSE,
  creada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_incidencia_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos (pedido_id),
  CONSTRAINT fk_incidencia_repartidor FOREIGN KEY (repartidor_id) REFERENCES repartidores (repartidor_id)
) ENGINE=InnoDB;

INSERT INTO productos (categoria_id, nombre, descripcion, precio, stock, disponible)
SELECT c.categoria_id, p.nombre, p.descripcion, p.precio, p.stock, TRUE
FROM (
  SELECT 'Comida' categoria, 'Sánguche de chicharrón' nombre, 'Pan crocante, camote y salsa criolla' descripcion, 18.50 precio, 14 stock
  UNION ALL SELECT 'Comida', 'Café pasado', 'Café de origen, recién preparado', 8.00, 22
  UNION ALL SELECT 'Ropa', 'Polera clásica', 'Algodón suave, varios colores', 49.90, 8
  UNION ALL SELECT 'Accesorios', 'Tote bag de lona', 'Resistente y perfecta para el día a día', 25.00, 12
  UNION ALL SELECT 'Hogar', 'Taza Buen Día', 'Cerámica hecha para tus mañanas', 22.00, 8
) p JOIN categorias c ON c.nombre = p.categoria;