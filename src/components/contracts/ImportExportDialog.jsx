
import React, { useState } from "react";
import { Contract } from "@/entities/Contract";
import { ExtractDataFromUploadedFile, UploadFile } from "@/integrations/Core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, FileText, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ImportExportDialog({ open, onOpenChange, contracts, onImportComplete }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const schema = Contract.schema();
      const csvHeaders = Object.keys(schema.properties);

      const csvData = contracts.map(contract => 
        csvHeaders.map(header => {
          const value = contract[header] || "";
          // Handle values with commas
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(",")
      );

      const csvContent = [csvHeaders.join(","), ...csvData].join("\n");
      
      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `contratos_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao exportar:", error);
    }
    setIsExporting(false);
  };

  const downloadTemplate = () => {
    try {
      const schema = Contract.schema();
      const headers = Object.keys(schema.properties);
      const csvContent = headers.join(",");
      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'template_importacao_contratos.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar template:", error);
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus({ type: "info", message: "Enviando arquivo..." });

    try {
      const { file_url } = await UploadFile({ file });
      setImportStatus({ type: "info", message: "Processando dados do arquivo..." });
      
      const result = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            contracts: {
              type: "array",
              items: Contract.schema()
            }
          },
          required: ["contracts"]
        }
      });

      if (result.status === "success" && result.output?.contracts) {
        setImportStatus({ type: "info", message: "Validando e salvando contratos..." });
        const rawContracts = result.output.contracts;

        const processedContracts = rawContracts.map(contract => {
          const processed = { ...contract };
          const numericFields = ["valor_contrato", "valor_faturado", "valor_cancelado", "valor_a_faturar", "valor_novo_contrato"];
          
          numericFields.forEach(field => {
            if (processed[field] && typeof processed[field] === 'string') {
              const cleanedValue = processed[field].replace(/[^\d.,-]/g, '').replace(',', '.');
              processed[field] = parseFloat(cleanedValue) || null;
            } else if (processed[field] === "" || processed[field] === undefined) {
              processed[field] = null;
            }
          });
          
          if (!processed.nome || !processed.cliente || !processed.contrato) {
            return null;
          }
          
          return processed;
        }).filter(Boolean);

        if (processedContracts.length === 0 && rawContracts.length > 0) {
          setImportStatus({
            type: "error",
            message: "Nenhum contrato válido encontrado. Verifique se as colunas obrigatórias (nome, cliente, contrato) estão preenchidas."
          });
        } else if (processedContracts.length > 0) {
          await Contract.bulkCreate(processedContracts);
          setImportStatus({
            type: "success",
            message: `${processedContracts.length} de ${rawContracts.length} contratos foram importados com sucesso!`
          });
          onImportComplete();
        } else {
           setImportStatus({
            type: "error",
            message: "O arquivo parece estar vazio ou em um formato incorreto."
          });
        }
      } else {
        setImportStatus({
          type: "error",
          message: `Erro ao extrair dados: ${result.details || 'Verifique o formato do arquivo e os dados.'}`
        });
      }
    } catch (error) {
      setImportStatus({
        type: "error",
        message: "Ocorreu um erro inesperado durante a importação."
      });
      console.error("Import error:", error);
    }
    
    setIsImporting(false);
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
                Baixe todos os seus contratos em formato CSV.
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
            <div className="text-center py-6 border-2 border-dashed rounded-lg">
              <Upload className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Importar de CSV</h3>
              <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
                Envie um arquivo CSV com os dados dos contratos. Para garantir a compatibilidade, use nosso arquivo de modelo.
              </p>
              
              <div className="flex justify-center gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileImport}
                  className="hidden"
                  id="csv-upload"
                  disabled={isImporting}
                />
                
                <Button
                  onClick={() => document.getElementById('csv-upload').click()}
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
