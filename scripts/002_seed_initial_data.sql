-- Insert initial product options
INSERT INTO product_options (category, label, value, order_index) VALUES
-- Product types
('product_type', 'Plantilla Básica', 'plantilla_basica', 1),
('product_type', 'Plantilla Premium', 'plantilla_premium', 2),
('product_type', 'Plantilla Deportiva', 'plantilla_deportiva', 3),
('product_type', 'Plantilla Ortopédica', 'plantilla_ortopedica', 4),

-- Zone options 1 (Antepié)
('zone_option_1', 'Ninguna', 'ninguna', 1),
('zone_option_1', 'Almohadilla metatarsal', 'almohadilla_metatarsal', 2),
('zone_option_1', 'Barra retrocapital', 'barra_retrocapital', 3),
('zone_option_1', 'Descarga 1er metatarsiano', 'descarga_1er_meta', 4),

-- Zone options 2 (Mediopié)
('zone_option_2', 'Ninguna', 'ninguna', 1),
('zone_option_2', 'Soporte arco longitudinal', 'soporte_arco', 2),
('zone_option_2', 'Almohadilla navicular', 'almohadilla_navicular', 3),
('zone_option_2', 'Corrección pronación', 'correccion_pronacion', 4),

-- Zone options 3 (Retropié)
('zone_option_3', 'Ninguna', 'ninguna', 1),
('zone_option_3', 'Talonera', 'talonera', 2),
('zone_option_3', 'Descarga calcáneo', 'descarga_calcaneo', 3),
('zone_option_3', 'Corrección varo/valgo', 'correccion_varo_valgo', 4),

-- Zone options 4 (Dedos)
('zone_option_4', 'Ninguna', 'ninguna', 1),
('zone_option_4', 'Separador dedos', 'separador_dedos', 2),
('zone_option_4', 'Almohadilla digital', 'almohadilla_digital', 3),
('zone_option_4', 'Corrección hallux', 'correccion_hallux', 4),

-- Zone options 5 (Borde externo)
('zone_option_5', 'Ninguna', 'ninguna', 1),
('zone_option_5', 'Almohadilla lateral', 'almohadilla_lateral', 2),
('zone_option_5', 'Descarga 5to metatarsiano', 'descarga_5to_meta', 3),
('zone_option_5', 'Corrección supinación', 'correccion_supinacion', 4),

-- Heel heights
('heel_height', 'Ninguna', 'ninguna', 1),
('heel_height', '2mm', '2mm', 2),
('heel_height', '4mm', '4mm', 3),
('heel_height', '6mm', '6mm', 4),
('heel_height', '8mm', '8mm', 5),
('heel_height', '10mm', '10mm', 6),

-- Posterior wedge options
('posterior_wedge', 'No', 'no', 1),
('posterior_wedge', 'Sí', 'si', 2);

-- Insert initial app settings
INSERT INTO app_settings (key, value) VALUES
('site_title', '"Sistema de Pedidos - Plantillas Ortopédicas"'),
('admin_email', '"admin@plantillas.com"'),
('order_notification_enabled', 'true'),
('google_sheets_enabled', 'false');
