# Sistema de Manutenção - Vandre Turismo

Este sistema permite ativar/desativar facilmente o modo de manutenção do site.

## Como Usar

### 1. Ativar/Desativar Modo de Manutenção

Para ativar o modo de manutenção, edite o arquivo `constants/maintenance.ts`:

```typescript
export const MAINTENANCE_CONFIG = {
  // Mude para true para ativar o modo de manutenção
  isMaintenanceMode: true,
  
  // Mensagem exibida na página de manutenção
  maintenanceMessage: "Estamos trabalhando para melhorar sua experiência",
  
  // Tempo estimado de manutenção em dias
  estimatedDays: 5
};
```

### 2. Configurações Disponíveis

```typescript
export const MAINTENANCE_CONFIG = {
  // Controla se o site está em manutenção
  isMaintenanceMode: false,
  
  // Mensagem exibida na página de manutenção
  maintenanceMessage: "Estamos trabalhando para melhorar sua experiência",
  
  // Tempo estimado de manutenção em dias
  estimatedDays: 5
};
```

### 3. Funcionalidades

- **Redirecionamento Automático**: Quando ativado, todas as rotas são redirecionadas para `/maintenance`
- **Contador Regressivo**: Exibe tempo estimado de conclusão em dias, horas, minutos e segundos
- **Mensagem Personalizada**: Exibe a mensagem configurada
- **Design Simples**: Interface limpa e funcional

### 4. Página de Manutenção

A página de manutenção (`/maintenance`) inclui:

- Título "Site em Manutenção"
- Mensagem configurável
- Texto explicativo sobre as melhorias
- Contador regressivo com dias, horas, minutos e segundos
- Design responsivo

### 5. Middleware

O middleware (`middleware.ts`) intercepta todas as requisições e:

- Verifica se o modo de manutenção está ativo
- Redireciona para `/maintenance` se necessário
- Permite acesso apenas à página de manutenção

## Arquivos Criados/Modificados

- `app/maintenance/page.tsx` - Página de manutenção
- `constants/maintenance.ts` - Configurações de manutenção
- `middleware.ts` - Middleware para redirecionamento
- `app/api/health/route.ts` - Endpoint de saúde da API

## Como Funciona

1. **Configuração**: Edite `isMaintenanceMode: true` no arquivo de configuração
2. **Redirecionamento**: O middleware intercepta todas as requisições
3. **Página de Manutenção**: Usuários são redirecionados para `/maintenance`
4. **Contador**: A página exibe um contador regressivo baseado em `estimatedDays`
5. **Desativação**: Mude `isMaintenanceMode: false` para desativar

## Exemplo de Uso

```typescript
// Para ativar manutenção
export const MAINTENANCE_CONFIG = {
  isMaintenanceMode: true,
  maintenanceMessage: "Manutenção programada - Volte em breve!",
  estimatedDays: 3
};

// Para desativar manutenção
export const MAINTENANCE_CONFIG = {
  isMaintenanceMode: false,
  maintenanceMessage: "Estamos trabalhando para melhorar sua experiência",
  estimatedDays: 5
};
```

## Notas Importantes

- O middleware funciona em todas as rotas exceto `/maintenance`
- Para desenvolvimento, você pode acessar `/maintenance` diretamente
- As configurações são carregadas em tempo de compilação
- Para mudanças dinâmicas, reinicie o servidor após editar o arquivo

## Próximos Passos

Para uma implementação mais avançada, considere:

1. **API para Configuração**: Criar endpoints para gerenciar configurações via API
2. **Persistência**: Salvar configurações em banco de dados
3. **Painel Admin**: Interface para gerenciar manutenção
4. **Notificações**: Alertar usuários sobre manutenção programada
5. **Logs**: Registrar quando manutenção foi ativada/desativada
