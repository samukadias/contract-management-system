# 📋 ContractPro - Sistema de Gestão de Contratos

Um sistema completo para gerenciamento de contratos desenvolvido com React, TailwindCSS e componentes modernos.

## 🚀 Funcionalidades

- ✅ **Dashboard Completo** - Visão geral dos contratos com métricas importantes
- ✅ **Gestão de Contratos** - CRUD completo de contratos
- ✅ **Controle de Etapas** - Acompanhamento visual das etapas por tipo de tratativa
- ✅ **Análises Avançadas** - Gráficos de rentabilidade e saúde dos contratos  
- ✅ **Pesquisa Avançada** - Filtros detalhados para encontrar contratos
- ✅ **Import/Export** - Importação e exportação de dados em CSV
- ✅ **Layout Responsivo** - Interface adaptável para desktop e mobile

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca principal
- **Vite** - Build tool e dev server
- **TailwindCSS** - Framework de CSS
- **Shadcn/ui** - Componentes de interface
- **React Router** - Navegação
- **Recharts** - Gráficos e visualizações
- **Date-fns** - Manipulação de datas
- **Framer Motion** - Animações

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/contract-management-system.git
cd contract-management-system

    Instale as dependências

npm install

    Inicie o servidor de desenvolvimento

npm run dev

    Acesse a aplicação

http://localhost:3000

🏗️ Estrutura do Projeto

src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── dashboard/       # Componentes do dashboard
│   ├── contracts/       # Componentes de gestão de contratos
│   ├── analysis/        # Componentes de análise
│   └── stagecontrol/    # Componentes de controle de etapas
├── pages/               # Páginas principais
├── entities/            # Definições de entidades
├── integrations/        # Integrações e APIs
└── utils/               # Utilitários e helpers

🔧 Scripts Disponíveis

npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Gera build de produção
npm run preview  # Visualiza build de produção

📊 Tipos de Tratativas

O sistema suporta diferentes tipos de tratativas para contratos:

    PRORROGAÇÃO - 13 etapas de 120 dias até finalização
    RENOVAÇÃO - 16 etapas de 190 dias até finalização
    ADITAMENTO - Com expansão ou redução
    CANCELAMENTO - Processo de cancelamento
    SEM TRATATIVA - Contratos sem processo específico
    FINALIZADA - Tratativas concluídas
    DESCONTINUIDADE - Contratos descontinuados

🎨 Componentes UI

O projeto utiliza componentes do Shadcn/ui personalizados:

    Cards, Buttons, Inputs, Selects
    Modals, Alerts, Badges, Tables
    Charts, Progress bars, Calendars
    Layout responsivo com Sidebar

📈 Funcionalidades Analíticas

    Métricas de Saúde - Taxa de rentabilidade, eficiência de faturamento
    Gráficos de Gantt - Controle visual das etapas
    Análise de Clientes - Rentabilidade por cliente
    Alertas de Vencimento - Contratos próximos do fim

🤝 Como Contribuir

    Faça um fork do projeto
    Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)
    Commit suas mudanças (git commit -m 'Add some AmazingFeature')
    Push para a branch (git push origin feature/AmazingFeature)
    Abra um Pull Request

📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
👨‍💻 Desenvolvedor

Desenvolvido por Samuel Dias

⭐ Não se esqueça de dar uma estrela se o projeto foi útil para você!