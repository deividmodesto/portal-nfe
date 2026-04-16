"use client"

import { ColumnDef } from "@tanstack/react-table"
import { NotaFiscal } from "@/types/nfe"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<NotaFiscal>[] = [
  {
    accessorKey: "numeroNF",
    header: "NF",
  },
  // --- INÍCIO DA NOVA COLUNA DE TIPO ---
  {
    accessorKey: "tipoNota",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.getValue("tipoNota") as string;
      if (tipo === "NFSE") {
        return <Badge className="bg-purple-600 hover:bg-purple-700">Serviço</Badge>
      }
      return <Badge className="bg-blue-600 hover:bg-blue-700">Produto</Badge>
    }
  },

  {
    accessorKey: "filial",
    header: "Filial",
    cell: ({ row }) => {
      const filial = row.getValue("filial") as string;
      // O .trim() remove os espaços em branco extras que vêm do Protheus
      return <div className="truncate max-w-[150px] font-medium text-slate-600" title={filial}>{filial?.trim()}</div>;
    },
  },
  // --- FIM DA NOVA COLUNA ---
 {
    accessorKey: "dataEmissao",
    header: "Emissão",
    cell: ({ row }) => {
      // 🌟 Ele apenas pega a string "05/04/2026" que veio do banco e joga na tela!
      const dataString = row.getValue("dataEmissao") as string;
      return <div className="text-slate-600 font-medium">{dataString}</div>;
    },
  },
  {
    accessorKey: "cfop",
    header: "CFOP",
  },
  {
    accessorKey: "nomeEmitente",
    header: "Emitente",
  },
  {
    accessorKey: "nomeDestinatario",
    header: "Destinatário",
  },
  {
    accessorKey: "valorNF",
    header: "Valor NF",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("valorNF"))
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount)
      return <div className="font-medium text-slate-700">{formatted}</div>
    },
  },
  {
    accessorKey: "statusSistema",
    header: "Status Protheus",
    cell: ({ row }) => {
      const status = row.getValue("statusSistema") as string;
      const dataEmissao = row.original.dataEmissao as string;
      
      let isAtrasada = false;
      if (status === "Não lançado" && dataEmissao && dataEmissao.includes('/')) {
        const partes = dataEmissao.split('/');
        const dataNf = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
        const diffEmDias = Math.floor((new Date().getTime() - dataNf.getTime()) / (1000 * 60 * 60 * 24));
        isAtrasada = diffEmDias > 5;
      }

      return (
        <div className="flex items-center gap-2">
          {isAtrasada && (
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="SLA Violado (+5 dias)" />
          )}
          <span className={`font-semibold ${
            status === 'Entrada' || status === 'Saída' ? 'text-green-600' : 
            status === 'Não lançado' ? (isAtrasada ? 'text-red-600' : 'text-amber-600') : 
            'text-slate-500'
          }`}>
            {status}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "statusSefaz",
    header: "Status NF-e",
  },
]