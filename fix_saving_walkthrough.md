# Correção de Salvamento de Contratos

O problema de os dados não serem salvos ocorria porque:
1.  O banco de dados não tinha as colunas para os novos campos (Etapa, Observação, etc.).
2.  O código filtrava esses campos antes de enviar, para evitar erros, mas isso fazia com que os dados fossem perdidos.

## Passo 1: Atualizar o Banco de Dados
Você precisa criar as colunas que faltam.

1.  Abra o arquivo `update_contracts_schema.sql` no seu editor.
2.  Copie todo o conteúdo.
3.  Acesse o painel do Supabase > SQL Editor.
4.  Cole o código e clique em **Run**.

## Passo 2: Testar
Após rodar o script, tente editar um contrato novamente. Agora as informações de Etapa, Observações e outros detalhes serão persistidos corretamente.
