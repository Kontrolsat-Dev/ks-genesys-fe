
```
frontend
├─ .env
├─ .env.example
├─ components.json
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  ├─ favicon.png
│  └─ logo.png
├─ README.md
├─ src
│  ├─ api
│  │  ├─ auth
│  │  │  ├─ index.ts
│  │  │  ├─ service.ts
│  │  │  └─ types.ts
│  │  ├─ brands
│  │  │  ├─ index.ts
│  │  │  ├─ service.ts
│  │  │  └─ types.ts
│  │  ├─ categories
│  │  │  ├─ index.ts
│  │  │  ├─ service.ts
│  │  │  └─ types.ts
│  │  ├─ products
│  │  │  ├─ index.ts
│  │  │  ├─ service.ts
│  │  │  └─ types.ts
│  │  ├─ suppliers
│  │  │  ├─ index.ts
│  │  │  ├─ service.ts
│  │  │  └─ types.ts
│  │  └─ system
│  │     ├─ index.ts
│  │     ├─ service.ts
│  │     └─ types.ts
│  ├─ app
│  │  ├─ app-router.tsx
│  │  ├─ guards
│  │  │  └─ require-auth.tsx
│  │  └─ layouts
│  │     ├─ private-layout.tsx
│  │     ├─ public-layout.tsx
│  │     ├─ sidebar-footer.tsx
│  │     ├─ sidebar.tsx
│  │     └─ topbar.tsx
│  ├─ App.tsx
│  ├─ assets
│  ├─ components
│  │  ├─ feedback
│  │  │  └─ status-dot.tsx
│  │  ├─ genesys-ui
│  │  │  ├─ expandable-text.tsx
│  │  │  └─ Hightlight.tsx
│  │  └─ ui
│  │     ├─ alert-dialog.tsx
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ checkbox.tsx
│  │     ├─ dialog.tsx
│  │     ├─ dropdown-menu.tsx
│  │     ├─ form.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ mode-toggle.tsx
│  │     ├─ select.tsx
│  │     ├─ separator.tsx
│  │     ├─ skeleton.tsx
│  │     ├─ slider.tsx
│  │     ├─ sonner.tsx
│  │     ├─ switch.tsx
│  │     ├─ table.tsx
│  │     ├─ tabs.tsx
│  │     ├─ textarea.tsx
│  │     └─ tooltip.tsx
│  ├─ constants
│  │  ├─ colors.ts
│  │  └─ endpoints.ts
│  ├─ features
│  │  ├─ auth
│  │  │  └─ login
│  │  │     ├─ index.tsx
│  │  │     └─ queries.ts
│  │  ├─ home
│  │  │  └─ index.tsx
│  │  ├─ products
│  │  │  ├─ brands
│  │  │  │  ├─ index.tsx
│  │  │  │  └─ queries.ts
│  │  │  ├─ categories
│  │  │  │  ├─ index.tsx
│  │  │  │  └─ queries.ts
│  │  │  ├─ components
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ offers-inline.tsx
│  │  │  │  ├─ status-dot.tsx
│  │  │  │  ├─ table-empty.tsx
│  │  │  │  └─ table-skeleton.tsx
│  │  │  ├─ index.tsx
│  │  │  ├─ product
│  │  │  │  ├─ components
│  │  │  │  │  ├─ fields.tsx
│  │  │  │  │  ├─ index.ts
│  │  │  │  │  ├─ margin-update.tsx
│  │  │  │  │  ├─ product-header.tsx
│  │  │  │  │  ├─ product-image-card.tsx
│  │  │  │  │  ├─ product-info.tsx
│  │  │  │  │  ├─ product-loading-page.tsx
│  │  │  │  │  ├─ product-meta-table.tsx
│  │  │  │  │  ├─ product-offers-table.tsx
│  │  │  │  │  ├─ product-price-chart.tsx
│  │  │  │  │  ├─ product-stats.tsx
│  │  │  │  │  ├─ product-stock-chart.tsx
│  │  │  │  │  └─ stat.tsx
│  │  │  │  ├─ index.tsx
│  │  │  │  └─ queries.ts
│  │  │  └─ queries.ts
│  │  ├─ suppliers
│  │  │  ├─ components
│  │  │  │  ├─ page-header.tsx
│  │  │  │  ├─ pagination.tsx
│  │  │  │  ├─ skeleton-rows.tsx
│  │  │  │  ├─ suppliers-table.tsx
│  │  │  │  ├─ toolbar.tsx
│  │  │  │  └─ use-debounced.ts
│  │  │  ├─ create
│  │  │  │  ├─ components
│  │  │  │  │  ├─ condition-row.tsx
│  │  │  │  │  ├─ drop-if-editor.tsx
│  │  │  │  │  ├─ error-note.tsx
│  │  │  │  │  ├─ feed-advanced.tsx
│  │  │  │  │  ├─ feed-origin.tsx
│  │  │  │  │  ├─ feed-test-preview.tsx
│  │  │  │  │  ├─ kv-editor.tsx
│  │  │  │  │  ├─ mapping-field-advanced.tsx
│  │  │  │  │  ├─ mapping-field-table.tsx
│  │  │  │  │  ├─ mapping-json-editor.tsx
│  │  │  │  │  ├─ mapping-required.tsx
│  │  │  │  │  ├─ rule-editor.tsx
│  │  │  │  │  ├─ step-feed.tsx
│  │  │  │  │  ├─ step-mapper.tsx
│  │  │  │  │  ├─ step-supplier.tsx
│  │  │  │  │  └─ stepper.tsx
│  │  │  │  ├─ index.tsx
│  │  │  │  ├─ mapping-types.ts
│  │  │  │  ├─ queries.ts
│  │  │  │  └─ utils.ts
│  │  │  ├─ edit
│  │  │  │  ├─ components
│  │  │  │  │  ├─ feed-form-section.tsx
│  │  │  │  │  ├─ mapper-editor.tsx
│  │  │  │  │  ├─ supplier-form-section.tsx
│  │  │  │  │  └─ supplier-header.tsx
│  │  │  │  ├─ index.tsx
│  │  │  │  └─ queries.ts
│  │  │  ├─ index.tsx
│  │  │  └─ queries.ts
│  │  └─ system
│  │     ├─ healthz
│  │     │  └─ queries.ts
│  │     ├─ manual-runs
│  │     │  └─ index.tsx
│  │     ├─ update-stream
│  │     │  ├─ index.tsx
│  │     │  └─ queries.ts
│  │     └─ update-stream-errors
│  │        ├─ index.tsx
│  │        └─ queries.ts
│  ├─ helpers
│  │  ├─ fmtDate.ts
│  │  ├─ fmtNumbers.ts
│  │  ├─ fmtPrices.ts
│  │  └─ html.ts
│  ├─ index.css
│  ├─ lib
│  │  ├─ auth-hooks.ts
│  │  ├─ auth-store.ts
│  │  ├─ formatters.ts
│  │  ├─ http-client.ts
│  │  ├─ http.ts
│  │  ├─ product-search.ts
│  │  ├─ query-client.ts
│  │  └─ utils.ts
│  ├─ main.tsx
│  └─ providers
│     └─ theme-provider.tsx
├─ src.zip
├─ TODO.md
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```