# Web de presentación

Catálogo de apps para creadores. Sitio estático: solo HTML y CSS, sin compilar nada.

```
web/
├── index.html      Portada: quién eres + catálogo de apps
├── nutricion.html  Presentación de la app de nutrición
├── styles.css      Estilos compartidos por todas las páginas
└── README.md       Esto
```

---

## ANTES DE PUBLICAR: rellena esto

Busca y reemplaza en `index.html` y `nutricion.html`:

| Buscar | Poner |
|---|---|
| `TU@EMAIL.COM` | Tu email real (aparece 4 veces) |
| `Alejandro` | Tu nombre o el de tu marca, si lo cambias |
| `fancy-caramel-e6b18e.netlify.app` | Tu URL de la demo, si algún día cambia |

---

## Publicar en GitHub Pages (gratis)

**1. Crea el repositorio** en github.com → New repository → nombre `apps-creadores` → Public.

**2. Sube la carpeta.** Desde `C:\Users\alexf\app_influencer\web`:

```bash
git init
git add .
git commit -m "Web de presentacion"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/apps-creadores.git
git push -u origin main
```

**3. Activa Pages:** en el repo → Settings → Pages → Source: `Deploy from a branch`
→ Branch: `main` / carpeta `/ (root)` → Save.

En 1-2 minutos estará en `https://TU-USUARIO.github.io/apps-creadores/`

**Para actualizar** después de cualquier cambio:

```bash
git add .
git commit -m "Cambios"
git push
```

---

## Dominio propio

**1. Compra el dominio** (Namecheap, Porkbun o IONOS: 10-15 €/año un `.com`).

**2. En tu proveedor de dominio**, crea estos registros DNS:

| Tipo | Nombre | Valor |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | TU-USUARIO.github.io |

**3. En GitHub:** Settings → Pages → Custom domain → escribe tu dominio → Save.
Marca **Enforce HTTPS** cuando se active (tarda unos minutos).

GitHub creará solo un archivo `CNAME` en el repo. No lo borres.

---

## Añadir una app nueva al catálogo

**1.** Copia `nutricion.html` y renómbralo, por ejemplo `fitness.html`.

**2.** Cambia el título, los textos, las funciones y la URL de la demo dentro.

**3.** En `index.html`, busca la tarjeta que pone `Próximamente` de Entrenamiento
y sustitúyela por una igual que la de nutrición:

```html
<a class="app-card" href="fitness.html">
  <div class="cover" style="background-image:url('URL-DE-UNA-FOTO')"></div>
  <div class="body">
    <span class="tag">Disponible</span>
    <h3>Entrenamiento</h3>
    <p>Descripción corta de la app.</p>
    <span class="go">Ver la app →</span>
  </div>
</a>
```

Los estilos ya están hechos: no hace falta tocar `styles.css`.

---

## Notas

- Las dos páginas llevan la **demo real incrustada** en un iframe. Se actualiza sola
  cada vez que subes una versión nueva de la app a Netlify.
- Si algún día la demo deja de verse dentro del marco, será porque Netlify empezó a
  bloquear el incrustado: en ese caso, sustituye el `<iframe>` por capturas de pantalla.
- Todo el texto está en los HTML, sin base de datos ni panel: se edita a mano y se sube.
