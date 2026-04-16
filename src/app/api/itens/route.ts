import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inicio = searchParams.get("inicio") || '2026-01-01';
  const fim = searchParams.get("fim") || '2026-12-31';

  // TRAVA DE SEGURANÇA CONTRA SQL INJECTION
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(inicio) || !dateRegex.test(fim)) {
    return NextResponse.json({ error: "Formato de data inválido. Use AAAA-MM-DD." }, { status: 400 });
  }

  try {
    const pool = await getDbPool();
    
    const result = await pool.request()
      .query(`
        SELECT 
          chaveAcesso,
          tipoNota,
          -- 🌟 O TRUQUE: Mudamos o nome da coluna no SQL para 'dataEmissaoTexto' 
          -- Isso cega o conversor de fuso horário do Node.js
          CONVERT(VARCHAR(10), dataEmissao, 120) as dataEmissaoTexto,
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
        ORDER BY dataEmissao DESC
      `);

    // 🌟 REMAPEAMENTO: Trocamos o nome de volta para 'dataEmissao' antes de enviar para a tela
    const notasCorrigidas = result.recordset.map(nota => {
      // Extrai o dataEmissaoTexto e guarda o resto das colunas
      const { dataEmissaoTexto, ...restoDasColunas } = nota;
      return {
        ...restoDasColunas,
        dataEmissao: dataEmissaoTexto // Texto puro: "2026-04-05" sem fuso horário!
      };
    });

    return NextResponse.json(notasCorrigidas);
  } catch (error: any) {
    console.error("❌ Erro na API de notas:", error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}