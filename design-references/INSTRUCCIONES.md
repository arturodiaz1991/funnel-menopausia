# Carpeta de Referencias de Diseño

Sube aquí cualquier archivo visual que quieras usar como referencia para rediseñar la landing.

## Qué puedes subir

| Tipo | Formato | Ejemplos |
|------|---------|---------|
| Capturas de pantalla | PNG, JPG, WEBP | Landings que te gustan, competidores, inspiración |
| Mockups / wireframes | PNG, JPG, PDF | Bocetos propios o de Figma/Canva |
| Paletas de colores | PNG, JPG | Capturas de Coolors, Adobe Color, Pinterest |
| Tipografías | PNG, JPG | Capturas con el nombre de la fuente visible |
| Secciones concretas | PNG, JPG | "Quiero este tipo de formulario", "este estilo de headline" |

## Cómo usarlo

1. **Copia o arrastra los archivos** a esta carpeta (`design-references/`)
2. **Abre Claude Code** y dile algo como:
   - *"Rediseña la landing basándote en las imágenes que dejé en design-references"*
   - *"Usa el color de la imagen `paleta.png` como color primario"*
   - *"Quiero un estilo similar al de la captura `referencia1.jpg`, aplícalo al funnel A/B activo"*
3. Claude leerá las imágenes, extraerá los tokens de diseño (colores, tipografía, estilo de botones, layout) y actualizará el builder del funnel o el código directamente.

## Convenciones de nombres (opcional pero recomendado)

Nombra los archivos de forma descriptiva para que Claude entienda la intención:

```
landing-referencia-principal.jpg   → La inspiración principal
paleta-colores.png                 → Colores que quieres usar
estilo-boton.png                   → Cómo debe verse el botón CTA
tipografia-preferida.png           → Fuente o estilo de texto
seccion-formulario.jpg             → Cómo debe quedar el formulario
```

## Notas

- Esta carpeta está en `.gitignore` — los archivos NO se suben a GitHub ni a producción.
- Puedes tener varios archivos a la vez; dile a Claude cuál es la referencia principal.
- Funciona con capturas parciales (no necesitas el diseño completo, solo la parte que te gusta).
