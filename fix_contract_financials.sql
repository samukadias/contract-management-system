-- 1. Atualizar 'valor_faturado' somando os TCs APENAS para contratos onde ele é 0 ou NULL
-- Isso garante que não sobrescrevemos correções manuais que possam ter sido feitas, mas preenche os vazios.
WITH calculated_values AS (
    SELECT 
        c.contrato,
        COALESCE(SUM(tc.valor_total), 0) as novo_valor_faturado
    FROM 
        public.contracts c
    LEFT JOIN 
        public.termos_confirmacao tc ON TRIM(tc.contrato_associado_pd) = TRIM(c.contrato)
    WHERE
        c.valor_faturado IS NULL OR c.valor_faturado = 0
    GROUP BY 
        c.contrato
)
UPDATE public.contracts c
SET 
    valor_faturado = cv.novo_valor_faturado
FROM 
    calculated_values cv
WHERE 
    c.contrato = cv.contrato;

-- 2. Atualizar 'valor_a_faturar' para TODOS os contratos
-- Fórmula simples: Valor do Contrato - Valor Faturado
UPDATE public.contracts
SET 
    valor_a_faturar = COALESCE(valor_contrato, 0) - COALESCE(valor_faturado, 0);
