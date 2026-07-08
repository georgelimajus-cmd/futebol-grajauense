# Forno & Gestão — Administração de Pizzaria

MVP web responsivo para uma pizzaria pequena. O sistema funciona diretamente no navegador, sem instalação de dependências e sem backend nesta primeira versão.

## Funcionalidades

- Dashboard com indicadores de faturamento, pedidos, ticket médio e estoque crítico
- Gráfico de vendas dos últimos 7 dias
- Cadastro e acompanhamento de pedidos
- Alteração do status do pedido em tempo real
- Cardápio com CRUD de produtos e controle de disponibilidade
- Cadastro e histórico financeiro de clientes
- Controle de estoque com alerta de reposição
- Caixa com entradas, saídas e vendas concluídas
- Resumo por forma de pagamento
- Configurações básicas da pizzaria
- Backup e restauração em JSON
- Persistência local via `localStorage`
- Interface responsiva para computador, tablet e celular

## Como executar

1. Abra a pasta `pizzaria-admin`.
2. Abra o arquivo `index.html` em um navegador moderno.

Também é possível usar um servidor local simples:

```bash
cd pizzaria-admin
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Estrutura

```text
pizzaria-admin/
├── index.html   # Estrutura da interface
├── styles.css   # Design responsivo
├── app.js       # Regras de negócio, CRUD e persistência
└── README.md    # Documentação
```

## Persistência

Nesta versão, os dados são armazenados no navegador com a chave `forno_gestao_v1`. Para uso comercial com múltiplos dispositivos, recomenda-se evoluir para autenticação e banco de dados centralizado.

## Próxima evolução recomendada

- Supabase/PostgreSQL para dados centralizados
- Login por usuário e perfis de acesso
- Impressão de comandas
- Integração com WhatsApp
- Tela de cozinha (KDS)
- Motoboys e rastreio de entregas
- Ficha técnica e baixa automática de insumos
- Relatórios por período
- Fechamento diário de caixa
- PWA instalável

## Observação

O projeto foi criado em branch isolada para não modificar o conteúdo da branch principal do repositório hospedeiro.