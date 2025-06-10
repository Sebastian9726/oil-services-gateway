-- Script para crear un turno de prueba
-- Primero obtenemos un usuario válido (el admin)
INSERT INTO turnos.turnos (
    id,
    fechaInicio,
    horaInicio,
    observaciones,
    usuarioId,
    createdAt,
    updatedAt
) VALUES (
    'turno_test_001',
    NOW(),
    '08:00',
    'Turno de prueba para testing',
    (SELECT id FROM usuarios.usuarios WHERE username = 'admin' LIMIT 1),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING; 