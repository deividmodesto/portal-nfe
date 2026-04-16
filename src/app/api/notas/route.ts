import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inicio = searchParams.get("inicio") || '2026-01-01';
  const fim = searchParams.get("fim") || '2026-12-31';

  // TRAVA DE SEGURANÇA
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(inicio) || !dateRegex.test(fim)) {
    return NextResponse.json({ error: "Formato de data inválido." }, { status: 400 });
  }

  try {
    const pool = await getDbPool();
    
    // 🌟 OPÇÃO NUCLEAR: O banco de dados formata para DD/MM/YYYY (código 103)
    const result = await pool.request()
      .query(`
        SELECT 
          chaveAcesso,
          tipoNota,
          CONVERT(VARCHAR(10), dataEmissao, 103) as dataEmissao, -- Retorna direto "05/04/2026"
          cfop,
          cnpjEmitente,
          nomeEmitente,
          cpfCnpjDestinatario,
          nomeDestinatario,
          numeroNF,
          valorNF,
          statusSefaz,
          statusSistema,
          filial
        FROM VW_CONCILIACAO_NFE
        WHERE dataEmissao >= '${inicio} 00:00:00' 
          AND dataEmissao <= '${fim} 23:59:59'
        ORDER BY VW_CONCILIACAO_NFE.dataEmissao DESC
      `);

    return NextResponse.json(result.recordset);
  } catch (error: any) {
    console.error("❌ Erro na API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}