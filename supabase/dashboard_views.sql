-- Ejecuta este script en el SQL Editor de Supabase

-- Función para obtener las métricas del dashboard de forma eficiente
CREATE OR REPLACE FUNCTION get_dashboard_metrics(p_company_id UUID, p_year TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  v_monthly JSONB;
  v_clients JSONB;
  v_products JSONB;
BEGIN
  -- 1. Métricas Mensuales (Facturas y Gastos)
  WITH monthly_invoices AS (
    SELECT 
      to_char(created_at, 'YYYY-MM') as month_key,
      SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END) as revenue,
      SUM(CASE WHEN payment_status != 'paid' THEN total - COALESCE((note->>'paidAmount')::numeric, 0) ELSE 0 END) as pending
    FROM invoices
    WHERE company_id = p_company_id
      AND (p_year = 'all' OR to_char(created_at, 'YYYY') = p_year)
    GROUP BY to_char(created_at, 'YYYY-MM')
  ),
  monthly_expenses AS (
    SELECT 
      to_char(created_at, 'YYYY-MM') as month_key,
      SUM(amount) as expenses
    FROM expenses
    WHERE company_id = p_company_id
      AND (p_year = 'all' OR to_char(created_at, 'YYYY') = p_year)
    GROUP BY to_char(created_at, 'YYYY-MM')
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'month_key', COALESCE(i.month_key, e.month_key),
      'revenue', COALESCE(i.revenue, 0),
      'pending', COALESCE(i.pending, 0),
      'expenses', COALESCE(e.expenses, 0)
    )
  ) INTO v_monthly
  FROM monthly_invoices i
  FULL OUTER JOIN monthly_expenses e ON i.month_key = e.month_key;

  -- 2. Estadísticas de Clientes
  SELECT jsonb_object_agg(
    client_id, 
    jsonb_build_object('count', count, 'revenue', revenue)
  ) INTO v_clients
  FROM (
    SELECT client_id, COUNT(*) as count, SUM(total) as revenue
    FROM invoices
    WHERE company_id = p_company_id AND client_id IS NOT NULL
    GROUP BY client_id
  ) c;

  -- 3. Estadísticas de Productos (sumando qty desde el JSON items)
  SELECT jsonb_object_agg(
    product_id, qty_sum
  ) INTO v_products
  FROM (
    SELECT 
      jsonb_array_elements(items)->>'productId' as product_id,
      SUM((jsonb_array_elements(items)->>'qty')::numeric) as qty_sum
    FROM invoices
    WHERE company_id = p_company_id
    GROUP BY jsonb_array_elements(items)->>'productId'
  ) p
  WHERE product_id IS NOT NULL;

  -- 4. Construir resultado final
  result := jsonb_build_object(
    'monthly', COALESCE(v_monthly, '[]'::jsonb),
    'clients', COALESCE(v_clients, '{}'::jsonb),
    'products', COALESCE(v_products, '{}'::jsonb)
  );

  RETURN result;
END;
$$;
