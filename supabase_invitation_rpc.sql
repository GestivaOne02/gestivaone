-- SCRIPT DE MIGRACIÓN: CREACIÓN DE FUNCIÓN DE VINCULACIÓN SEGURA
--
-- Ejecuta este script en el editor SQL de tu panel de Supabase para añadir una capa de seguridad
-- extra. Permite marcar los códigos de invitación como consumidos de forma atómica y segura
-- saltándose las reglas de RLS para el trabajador en el momento del registro.

CREATE OR REPLACE FUNCTION public.use_invitation_code(inv_code TEXT, worker_email TEXT)
RETURNS TABLE (
    company_id UUID,
    invite_role TEXT,
    company_plan TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    comp_row RECORD;
    inv_item JSONB;
    new_invitations JSONB := '[]'::jsonb;
    found BOOLEAN := false;
    matched_role TEXT;
BEGIN
    -- Recorrer todas las empresas buscando la invitación activa con el código ingresado
    FOR comp_row IN SELECT id, settings, plan FROM public.companies LOOP
        IF comp_row.settings ? 'invitations' THEN
            new_invitations := '[]'::jsonb;
            found := false;
            
            FOR inv_item IN SELECT * FROM jsonb_array_elements(comp_row.settings->'invitations') LOOP
                IF (inv_item->>'code' = inv_code) AND (inv_item->>'used' = 'false') AND ((inv_item->>'expiresAt')::timestamp > now()) THEN
                    found := true;
                    matched_role := inv_item->>'role';
                    -- Marcar la invitación como usada
                    new_invitations := new_invitations || jsonb_build_object(
                        'code', inv_item->>'code',
                        'role', inv_item->>'role',
                        'expiresAt', inv_item->>'expiresAt',
                        'created', inv_item->>'created',
                        'used', true,
                        'usedBy', worker_email,
                        'usedAt', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
                    );
                ELSE
                    new_invitations := new_invitations || inv_item;
                END IF;
            END LOOP;
            
            -- Si encontramos la invitación activa, guardamos los ajustes actualizados y retornamos el resultado
            IF found THEN
                UPDATE public.companies 
                SET settings = jsonb_set(settings, '{invitations}', new_invitations)
                WHERE id = comp_row.id;
                
                company_id := comp_row.id;
                invite_role := matched_role;
                company_plan := COALESCE(comp_row.plan, 'standard');
                RETURN NEXT;
                RETURN;
            END IF;
        END IF;
    END LOOP;
    
    -- Si no se encontró ningún código de invitación activo, lanzar una excepción
    RAISE EXCEPTION 'Código de vinculación inválido, ya usado o caducado.';
END;
$$;
