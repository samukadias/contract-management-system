import React, { useState } from "react";
import { toast } from "sonner";
import { Contract } from "@/entities/Contract";
import { UploadFile } from "@/integrations/Core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, FileText, AlertTriangle, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as XLSX from "xlsx";

export default function ImportExportDialog({ open, onOpenChange, contracts, onImportComplete }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const schema = Contract.schema();
      const headers = Object.keys(schema.properties);

      const data = contracts.map(contract => {
        const row = {};
        headers.forEach(header => {
          row[header] = contract[header];
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contratos");

      const fileName = `contratos_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

    } catch (error) {
      console.error("Erro ao exportar:", error);
      setImportStatus({
        type: "error",
        message: "Erro ao exportar dados. Tente novamente."
      });
    }
    setIsExporting(false);
  };

  const downloadTemplate = () => {
    try {
      const schema = Contract.schema();
      const headers = Object.keys(schema.properties);

      const worksheet = XLSX.utils.aoa_to_sheet([headers]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

      XLSX.writeFile(workbook, "template_importacao_contratos.xlsx");
    } catch (error) {
      console.error("Erro ao baixar template:", error);
    }
  };

  const parseDate = (dateInfo) => {
    if (!dateInfo) return null;

    // Handle Excel serial date
    if (typeof dateInfo === 'number') {
      const date = new Date(Math.round((dateInfo - 25569) * 86400 * 1000));
      return date.toISOString();
    }

    const dateString = String(dateInfo).trim();
    if (!dateString) return null;

    // Try parsing ISO format first
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) return date.toISOString();

    // Try parsing DD/MM/YYYY or DD-MM-YYYY
    const parts = dateString.split(/[\/\-]/);
    if (parts.length === 3) {
      // Assume DD/MM/YYYY
      date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      if (!isNaN(date.getTime())) return date.toISOString();
    }
    return null;
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus({ type: "info", message: "Lendo arquivo..." });
    toast.info("Iniciando leitura do arquivo...");

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawContracts = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rawContracts || rawContracts.length === 0) {
          throw new Error("O arquivo está vazio ou não pôde ser lido.");
        }

        setImportStatus({ type: "info", message: "Validando e salvando contratos..." });

        const processedContracts = rawContracts.map(contract => {
          const processed = { ...contract };
          const numericFields = ["valor_contrato", "valor_faturado", "valor_cancelado", "valor_a_faturar", "valor_novo_contrato"];
          const dateFields = ["data_inicio_efetividade", "data_fim_efetividade", "data_limite_andamento"];

          // Clean numeric fields
          numericFields.forEach(field => {
            if (processed[field] !== undefined && processed[field] !== null && processed[field] !== "") {
              if (typeof processed[field] === 'string') {
                const cleanedValue = processed[field].replace(/[^\d.,-]/g, '').replace(',', '.');
                processed[field] = parseFloat(cleanedValue) || 0;
              } else {
                processed[field] = Number(processed[field]) || 0;
              }
            } else {
              processed[field] = 0;
            }
          });

          // Clean date fields
          dateFields.forEach(field => {
            processed[field] = parseDate(processed[field]);
          });

          // Ensure required fields are present
          if (!processed.analista_responsavel || !processed.cliente || !processed.contrato) {
            return null; // Skip invalid rows
          }

          return processed;
        }).filter(Boolean);

        if (processedContracts.length === 0) {
          const msg = "Nenhum contrato válido encontrado. Verifique se as colunas obrigatórias (analista_responsavel, cliente, contrato) estão preenchidas.";
          setImportStatus({ type: "error", message: msg });
          toast.error(msg);
        } else {
          await Contract.bulkCreate(processedContracts);
          const msg = `${processedContracts.length} de ${rawContracts.length} contratos foram importados com sucesso!`;
          setImportStatus({ type: "success", message: msg });
          toast.success(msg);
          onImportComplete();
        }

      } catch (error) {
        console.error("Import error:", error);
        const msg = `Erro ao importar: ${error.message}`;
        setImportStatus({ type: "error", message: msg });
        toast.error(msg);
      }
      setIsImporting(false);
    };

    reader.onerror = () => {
      setImportStatus({ type: "error", message: "Erro ao ler o arquivo." });
      toast.error("Erro ao ler o arquivo.");
      setIsImporting(false);
    };

    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar/Exportar Contratos</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Exportar</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="text-center py-6">
              <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Exportar Contratos</h3>
              <p className="text-gray-600 mb-6">
                Baixe todos os seus contratos em formato Excel.
              </p>
              <Button
                onClick={exportToCSV}
                disabled={isExporting || contracts.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {isExporting ? "Exportando..." : `Baixar ${contracts.length} Contratos`}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 p-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Formatos aceitos:</strong> .xlsx, .xls, .csv
              </AlertDescription>
            </Alert>

            <div className="text-center py-6 border-2 border-dashed rounded-lg">
              <Upload className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Importar Arquivo</h3>
              <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
                Envie um arquivo Excel ou CSV com os dados dos contratos.
              </p>

              <div className="flex justify-center gap-4">
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileImport}
                  className="hidden"
                  id="file-upload"
                  disabled={isImporting}
                />

                <Button
                  onClick={() => document.getElementById('file-upload').click()}
                  disabled={isImporting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {isImporting ? "Importando..." : "Selecionar Arquivo"}
                </Button>

                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Modelo
                </Button>
              </div>
            </div>

            {importStatus && (
              <Alert variant={importStatus.type === "error" ? "destructive" : "default"} className={importStatus.type === "success" ? "bg-green-50 border-green-200" : ""}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{importStatus.message}</AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
