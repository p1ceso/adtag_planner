# 📝 Guia de Customização de Fontes - ADTAG Planner

## 🎨 Onde Trocar as Fontes

### 1️⃣ **Configuração Global de Fontes**

#### 📍 Local: `tailwind.config.js` (linhas 24-28)
```javascript
fontFamily: {
  "display": ["Inter", "sans-serif"],  // Fonte principal
  "body": ["Inter", "sans-serif"],      // Fonte do corpo
  "inter": ["Inter", "sans-serif"],     // Alias
}
```

**Como usar:**
- `font-display` → Títulos e elementos principais
- `font-body` → Textos corridos e parágrafos
- `font-inter` → Uso alternativo

---

### 2️⃣ **Importação da Fonte**

#### 📍 Local: `index.html` (linha 14)
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

**Pesos disponíveis:**
- `300` = Light (leve)
- `400` = Regular (normal)
- `500` = Medium (médio)
- `600` = Semi-Bold
- `700` = Bold (negrito)
- `800` = Extra-Bold
- `900` = Black (super negrito)

---

### 3️⃣ **Classes Tailwind para Peso de Fonte**

Use essas classes nos componentes:

```jsx
// Textos leves e suaves
className="font-light"      // 300
className="font-normal"     // 400
className="font-medium"     // 500

// Textos destacados
className="font-semibold"   // 600
className="font-bold"       // 700
className="font-extrabold"  // 800
className="font-black"      // 900
```

---

## 🔤 Como Trocar a Fonte Principal

### Opção 1: Usar outra fonte do Google Fonts

1. Acesse: https://fonts.google.com
2. Escolha uma fonte (exemplo: **Poppins**, **Montserrat**, **Outfit**)
3. Copie o link de importação
4. Substitua no `index.html`:

```html
<!-- Exemplo com Poppins -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

5. Atualize no `tailwind.config.js`:

```javascript
fontFamily: {
  "display": ["Poppins", "sans-serif"],
  "body": ["Poppins", "sans-serif"],
}
```

---

### Opção 2: Usar fontes locais

1. Coloque os arquivos `.woff2` em `public/fonts/`
2. Adicione no `index.css`:

```css
@font-face {
  font-family: 'MinhaFonte';
  src: url('/fonts/MinhaFonte-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'MinhaFonte';
  src: url('/fonts/MinhaFonte-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
```

3. Configure no `tailwind.config.js`:

```javascript
fontFamily: {
  "display": ["MinhaFonte", "sans-serif"],
}
```

---

## 🎯 Exemplos Práticos

### Deixar um título mais fino:

**Antes:**
```jsx
<h1 className="text-3xl font-black">Título Grosso</h1>
```

**Depois:**
```jsx
<h1 className="text-3xl font-light">Título Fino</h1>
```

### Ajustar todo o aplicativo:

No `index.css`, linha 15:
```css
body {
  @apply text-slate-300 antialiased bg-background-dark font-display;
  font-weight: 400; /* Adicione isso para deixar mais leve */
}
```

---

## 🎨 Recomendações para ADTAG Kids

### Fontes Modernas e Child-Friendly:

1. **Outfit** - Geométrica e amigável
   ```
   https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap
   ```

2. **Poppins** - Arredondada e profissional
   ```
   https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap
   ```

3. **Manrope** - Moderna e limpa
   ```
   https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap
   ```

### Configuração Ideal para Leveza:

- **Títulos grandes:** `font-light` ou `font-normal`
- **Subtítulos:** `font-medium`
- **Botões:** `font-semibold`
- **Corpo de texto:** `font-normal`
- **Labels pequenas:** `font-medium`

---

## 📌 Observações Importantes

1. **Performance:** Importe apenas os pesos que você realmente usa
2. **Legibilidade:** Fontes muito finas (`font-light`) podem dificultar leitura em telas pequenas
3. **Consistência:** Use no máximo 2-3 pesos diferentes no app inteiro
4. **Contraste:** Texto muito fino precisa de bom contraste com o fundo

---

**Atualizado:** 2026-01-22  
**ADTAG Planner Pro** - Sistema de Gestão Ministerial
