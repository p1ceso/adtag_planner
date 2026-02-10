# 🎨 Guia de Ícones - Material Symbols

## ✨ Configuração Implementada

Os ícones agora são **mais finos por padrão** (peso 300).

---

## 📌 Classes Disponíveis para Peso de Ícones

Use essas classes para ajustar o peso dos ícones conforme necessário:

### Pesos Disponíveis:

```jsx
// Ícone super fino (weight 200)
<span className="material-symbols-outlined icon-thin">favorite</span>

// Ícone fino - PADRÃO (weight 300)
<span className="material-symbols-outlined icon-light">favorite</span>

// Ícone regular (weight 400)
<span className="material-symbols-outlined icon-regular">favorite</span>

// Ícone destacado (weight 500)
<span className="material-symbols-outlined icon-bold">favorite</span>
```

---

## 🎯 Exemplos Práticos

### Exemplo 1: Ícone de Navegação (Fino)
```jsx
<button>
  <span className="material-symbols-outlined icon-light">
    dashboard
  </span>
  Dashboard
</button>
```

### Exemplo 2: Ícone de Ação Principal (Regular)
```jsx
<button className="btn-primary">
  <span className="material-symbols-outlined icon-regular">
    add
  </span>
  Novo Objetivo
</button>
```

### Exemplo 3: Ícone de Título (Super Fino)
```jsx
<h2>
  <span className="material-symbols-outlined icon-thin text-primary">
    flag
  </span>
  Metas Estratégicas
</h2>
```

---

## 🔧 Personalização Avançada

### Ajustar Peso Manualmente
```jsx
<span 
  className="material-symbols-outlined"
  style={{ fontVariationSettings: "'wght' 250" }}
>
  icon_name
</span>
```

### Ícone Preenchido
```jsx
<span 
  className="material-symbols-outlined"
  style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}
>
  star
</span>
```

### Ícone com Gradiente Visual
```jsx
<span 
  className="material-symbols-outlined"
  style={{ fontVariationSettings: "'GRAD' 200, 'wght' 300" }}
>
  favorite
</span>
```

---

## 📊 Tabela de Referência

| Classe          | Peso | Uso Recomendado                          |
|-----------------|------|------------------------------------------|
| `icon-thin`     | 200  | Títulos grandes, ícones decorativos      |
| `icon-light`    | 300  | **Padrão** - Navegação, cards            |
| `icon-regular`  | 400  | Botões, formulários                      |
| `icon-bold`     | 500  | Ações principais, destaque               |

---

## 💡 Dicas de Design

1. **Consistência**: Use preferencialmente `icon-light` (padrão) em todo o app
2. **Destaque**: Use `icon-regular` ou `icon-bold` apenas em ações críticas
3. **Títulos**: `icon-thin` funciona bem em títulos grandes (h1, h2)
4. **Tamanho**: Ícones finos ficam melhor em tamanhos maiores (24px+)

---

## 🚀 Migração de Ícones Existentes

Se você quiser tornar um ícone específico mais fino:

**Antes:**
```jsx
<span className="material-symbols-outlined">dashboard</span>
```

**Depois (mais fino):**
```jsx
<span className="material-symbols-outlined icon-thin">dashboard</span>
```

**Ou manter padrão (já é fino agora):**
```jsx
<span className="material-symbols-outlined">dashboard</span>
```

---

## 🎨 Integração com ADTAG Colors

```jsx
// Ícone fino com cor da marca
<span className="material-symbols-outlined icon-light text-primary">
  church
</span>

<span className="material-symbols-outlined icon-light text-brand-orange">
  school
</span>

<span className="material-symbols-outlined icon-light text-brand-magenta">
  celebration
</span>
```

---

**Atualizado:** 2026-01-22  
**ADTAG Planner Pro** - Sistema de Gestão Ministerial
