# File Analysis

## Repo-Level Read

- This repo is a Vite + React + TypeScript marketing site and admin portal for Aditya Genset.
- The current architecture mixes three content strategies: hardcoded TypeScript data, a Supabase-backed CMS/API layer, and an older Sanity/local-storage fallback layer.
- The most important runtime paths today are `src/App.tsx`, the Supabase client/API files under `src/lib`, the editable CMS flow under `src/components/cms`, and the admin pages under `src/pages/admin`.
- A few files look legacy or partially orphaned: `src/App.css`, `src/hooks/useCMS.ts`, `src/lib/migrateToSupabase.ts`, `src/components/NavLink.tsx`, and `src/pages/SalesDashboard.tsx`.

## Verification Notes

- `npm test` failed because `vitest` is not available in the current workspace, which strongly suggests dependencies are not fully installed locally.
- `npm run build` initially failed in the sandbox because `esbuild` could not spawn; rerunning outside the sandbox then failed because `@vitejs/plugin-react-swc` could not be resolved from the current environment.
- Because of that, the analysis below is code-structure based rather than a confirmed clean runtime pass.

## Root Files

- `.env.example`: Minimal Supabase env template; the app will not authenticate or fetch data without real values here.
- `.gitignore`: Standard frontend ignore file with env, build, cache, and raw asset exclusions; also explicitly prevents a large local Escorts asset folder from being committed.
- `apply-theme.cjs`: One-off migration script that bulk-replaces hardcoded admin colors with theme tokens in admin files.
- `bun.lockb`: Bun lockfile; indicates the project has been installed with Bun at least once.
- `components.json`: shadcn/ui registry config; maps aliases and points generated UI components at `src/index.css` and `tailwind.config.ts`.
- `EKL15_TEMPLATE_GUIDE.md`: Human documentation for the EKL15 product-template system and its intended Supabase migration workflow.
- `eslint.config.js`: ESLint setup for TS/React Hooks with `react-refresh`; notably disables `no-unused-vars`, so dead code can linger.
- `gen_showcase.cjs`: Helper script that extracts showcase copy/specs from `src/data/products.ts` and writes them to `showcase.txt`.
- `generate.cjs`: Helper script that parses `src/pages/DGSetsCategory.tsx` data and writes flattened CMS-style product keys to `output.txt`.
- `generate.js`: Duplicate of `generate.cjs`; same purpose, just redundant.
- `index.html`: Vite entry HTML with Adityagenset SEO metadata, favicon, and root mount node.
- `output.txt`: Generated flattened product metadata snapshot; useful for seeding CMS content, not part of runtime logic.
- `package-lock.json`: npm lockfile; current workspace state does not appear to match it because build/test dependencies are missing.
- `package.json`: Main manifest; confirms a feature-rich frontend stack with React Query, Supabase, Sanity, Three.js, Framer Motion, Radix, Recharts, and Vitest.
- `postcss.config.js`: Standard Tailwind + Autoprefixer PostCSS pipeline.
- `README.md`: Basic setup guide and tech-stack summary; accurate at a high level but lighter than the actual Supabase/CMS complexity in code.
- `showcase.txt`: Generated flattened showcase content snapshot, likely used to port content into CMS.
- `supabase schems.txt`: Large SQL schema/reference dump for the Supabase backend; appears to be a working schema artifact rather than app runtime input.
- `tailwind.config.ts`: Tailwind theme extension for brand fonts, color tokens, and animation names used throughout the site/admin UI.
- `tsconfig.app.json`: Loose frontend TS config for the app bundle; strict mode is off.
- `tsconfig.json`: Shared project TS config with path aliasing and relaxed safety checks.
- `tsconfig.node.json`: Stricter TS config for Vite/node-side files like `vite.config.ts`.
- `vite.config.ts`: Vite config with React SWC, `@` alias, dev-server port `8080`, and `lovable-tagger` in development.
- `vitest.config.ts`: Vitest config for JSDOM, global APIs, and `src/test/setup.ts`.

## Public Assets

- `public/aditya-logo.png`: App favicon/social image and likely the primary lightweight brand mark for browser surfaces.
- `public/models/realistic.glb`: 3D generator model asset for any Three.js-based showcase or hero experience.

## Supabase Backend

- `supabase/functions/admin-users/index.ts`: Deno Edge Function for admin-only user listing and user creation via service-role privileges.
- `supabase/migrations/202605070001_admin_profile_reads.sql`: Migration focused on enabling admin-side profile reads; part of the access-control backend story.

## App Shell

- `src/App.css`: Default Vite starter stylesheet; looks stale and out of step with the actual Tailwind-driven design system.
- `src/App.tsx`: Main app composition; wires React Query, auth, CMS editor state, routing, admin protection, and public site routes.
- `src/index.css`: Real design-system stylesheet; defines the brand token system, typography, utility classes, motion tokens, and custom animation helpers.
- `src/main.tsx`: Browser entrypoint; mounts `App` and loads local font packages to avoid remote font/CORS issues.
- `src/vite-env.d.ts`: Standard Vite type reference file.

## Tests

- `src/test/example.test.ts`: Placeholder smoke test only; it does not validate any real app behavior.
- `src/test/setup.ts`: Test environment bootstrap that adds `jest-dom` and a `matchMedia` mock for UI code.

## Hooks

- `src/hooks/use-mobile.tsx`: Small responsive hook that returns `true` below the 768px breakpoint.
- `src/hooks/use-toast.ts`: Local toast state manager modeled after shadcn examples; separate from `sonner` usage elsewhere.
- `src/hooks/useCMS.ts`: Older Sanity-based CMS hook; currently appears unused in the live app.
- `src/hooks/useInView.ts`: Generic `IntersectionObserver` hook for reveal-on-scroll behavior.
- `src/hooks/useReducedMotion.ts`: Accessibility hook for `prefers-reduced-motion`.

## Data Files

- `src/data/adminData.ts`: Shared TypeScript interfaces for admin products, KPIs, dealers, reps, and notifications.
- `src/data/ekl15Data.ts`: Dense chapter-by-chapter interactive content model for the EKL15 Escorts product experience.
- `src/data/products.ts`: Core hardcoded catalog/showcase fallback; contains the 62.5 kVA demo showcase, an `EKL15_SHOWCASE`, product summary lists, and localStorage-backed dynamic product helpers.

## Library Files

- `src/lib/animations.ts`: Shared Framer Motion timing/easing/variant tokens used across the premium storytelling UI.
- `src/lib/auth.ts`: Role helpers and auth state types; centralizes who counts as admin vs sales and where each role lands.
- `src/lib/migrateToSupabase.ts`: Older one-product migration helper for the 62.5 kVA showcase; useful historically but likely superseded by the EKL15-specific migration path.
- `src/lib/pdfExtractor.ts`: PDF text extraction plus Gemini-based structured spec extraction for AI-assisted product creation.
- `src/lib/productGenerator.ts`: Generates a new `ShowcaseProduct` from extracted PDF data using `EKL15_SHOWCASE` as the structural template, then stores it in localStorage.
- `src/lib/sanity.ts`: Very large legacy/bridge content module; defines default CMS content and Sanity fetch/save helpers, but the active editing flow now leans on Supabase instead.
- `src/lib/supabase.ts`: Supabase client and handwritten schema types for products, CMS sections, quotes, leads, profiles, and presentations.
- `src/lib/utils.ts`: Standard `cn()` class-merging helper via `clsx` + `tailwind-merge`.
- `src/lib/api/cms.ts`: Supabase CMS read/write layer for global sections plus product-scoped showcase/presentation content.
- `src/lib/api/presentation.ts`: Supabase analytics/session helpers for guided presentations.
- `src/lib/api/products.ts`: Supabase product queries for published lists, slug lookup, filters, and inquiry incrementing.
- `src/lib/migrations/migrateEKL15.ts`: Primary product migration script for inserting EKL15 data, media, specs, and CMS sections into Supabase.
- `src/lib/templates/escortsProductTemplate.ts`: Template generator that converts one Escorts product data object into card, showcase, and presentation payloads.

## Pages

- `src/pages/DGSetsCategory.tsx`: Filterable Supabase-backed DG catalog page with engine, kVA, application, and search filters.
- `src/pages/Home.tsx`: Scroll-snap landing page assembling the branded storytelling sections and CMS-editable hero content.
- `src/pages/Login.tsx`: Role-aware Supabase login screen that rejects users who choose the wrong portal for their assigned role.
- `src/pages/MigrationRunner.tsx`: Admin utility page for manually running and verifying the EKL15 migration.
- `src/pages/NotFound.tsx`: Simple 404 page that logs the missing route to the console.
- `src/pages/ProductDetail.tsx`: Product showcase detail page that fetches product-scoped CMS content from Supabase and renders the long-form scroll story.
- `src/pages/Products.tsx`: Category chooser for the broader product catalog with CMS-editable copy.
- `src/pages/SalesDashboard.tsx`: Lightweight sales-role dashboard; currently not wired into `src/App.tsx`, so it appears orphaned.

## Admin Pages

- `src/pages/admin/AddProduct.tsx`: The heaviest admin page; rich product form with manual fields, tags, media/spec entry, PDF import, and product-generation helpers.
- `src/pages/admin/AdminCMS.tsx`: CMS landing page for choosing which global page or product showcase to edit.
- `src/pages/admin/AdminComingSoon.tsx`: Reusable placeholder screen for admin modules that are planned but not implemented.
- `src/pages/admin/AdminProducts.tsx`: Supabase-backed product table with search, filters, bulk actions, duplication, publishing, archiving, and deletion.
- `src/pages/admin/AdminReports.tsx`: Reporting dashboard page for business/admin analytics.
- `src/pages/admin/AdminSettings.tsx`: Settings UI for site info, notifications, and security records stored in Supabase singleton-style tables.
- `src/pages/admin/AdminUsers.tsx`: User-management page that prefers the `admin-users` Edge Function and falls back to the `profiles` table when needed.
- `src/pages/admin/CMSEditor.tsx`: Full-screen live CMS editor wrapper that overlays the real page and saves edits through `CMSEditorProvider`.
- `src/pages/admin/Dashboard.tsx`: Main admin dashboard aggregating product, quote, presentation, and user metrics from Supabase.

## Shared Components

- `src/components/NavLink.tsx`: Compatibility wrapper around `react-router-dom` `NavLink`; currently appears unused.

## Auth Components

- `src/components/auth/AuthContext.ts`: Context contract and `useAuth()` hook for authenticated app state.
- `src/components/auth/AuthProvider.tsx`: Session/profile loader that syncs Supabase auth state into React context.
- `src/components/auth/AuthRoutes.tsx`: Route guards for authenticated access, role-restricted access, and login redirection.

## CMS Components

- `src/components/cms/CMSEditorProvider.tsx`: In-memory CMS state manager with load, save, undo/redo, discard, and product-scoped section support.
- `src/components/cms/EditableImage.tsx`: Click-to-edit CMS image wrapper for live editing mode.
- `src/components/cms/EditableText.tsx`: Inline editable text wrapper used across the marketing site and showcase flows.

## Admin Components

- `src/components/admin/AdminLayout.tsx`: Custom admin shell with sidebar, search, role display, logout, and responsive menu behavior.
- `src/components/admin/PDFImportZone.tsx`: Drag-drop PDF ingestion UI that runs text extraction plus AI structuring before applying values to the product form.

## Site Components

- `src/components/site/ChapterInteractive.tsx`: Rich Escorts-specific interactive chapter renderer driven by `EKL15_CHAPTER_DATA`.
- `src/components/site/CompanyOverview.tsx`: Home-page company overview section with CMS-driven copy and presentation styling.
- `src/components/site/ContactCTA.tsx`: Home-page final contact/CTA section with editable business details.
- `src/components/site/CountUp.tsx`: Animated numeric counter used in stats and showcase highlights.
- `src/components/site/DealerNetwork.tsx`: Home-page dealer/service footprint section using editable location content.
- `src/components/site/Footer.tsx`: Shared public-site footer with editable business/contact copy.
- `src/components/site/GeneratorModel.tsx`: Three.js/R3F-based product model viewer component for 3D experiences.
- `src/components/site/GuidedPresentation.tsx`: Full-screen presentation mode with hotspot-driven scroll progression and CMS-editable media/text.
- `src/components/site/HappyCustomers.tsx`: Client/testimonial-style home section.
- `src/components/site/Hotspots.tsx`: Interactive hotspot image explorer with intro overlay, zoom/pan, and per-part overlays.
- `src/components/site/LogoMarquee.tsx`: Animated brand/client logo marquee section component.
- `src/components/site/ManufacturingProcess.tsx`: Home-page process/workflow section for the manufacturing story.
- `src/components/site/MissionVision.tsx`: Home-page mission and vision section using CMS copy.
- `src/components/site/Navbar.tsx`: Public-site top navigation with responsive behavior and route-aware links.
- `src/components/site/OEMPartners.tsx`: Home-page OEM/engine partner showcase section.
- `src/components/site/ProductCard.tsx`: Reusable DG product card for listing/catalog surfaces.
- `src/components/site/ProductCategories.tsx`: Category navigation/promo component for product families.
- `src/components/site/ProgressRail.tsx`: Vertical progress rail with chapter numbers and preview imagery for the scroll story.
- `src/components/site/RouteFade.tsx`: Route-transition animation wrapper.
- `src/components/site/ScrollStory.tsx`: Core product storytelling engine; manages active chapter, split layout, presentation mode, wheel/touch chapter jumps, and Escorts chapter switching.
- `src/components/site/SectionReveal.tsx`: Generic reveal/stagger animation wrapper for marketing sections.
- `src/components/site/SEO.tsx`: Small helper for document title and meta description management.
- `src/components/site/SiteLayout.tsx`: Shared public-site layout container, likely composing navbar/footer around children.
- `src/components/site/StatStrip.tsx`: Compact stats bar used in the hero area.
- `src/components/site/StickyImageStack.tsx`: Layered/sticky image presentation for showcase chapters.
- `src/components/site/TrustGainers.tsx`: Home-page strengths/why-choose-us section.
- `src/components/site/VerticalNav.tsx`: Vertical dot navigation for the home story and chapter navigation, including exported `HOME_SECTIONS`.

## UI Components

- `src/components/ui/accordion.tsx`: shadcn/Radix accordion primitive for collapsible content blocks.
- `src/components/ui/alert-dialog.tsx`: shadcn/Radix confirmation dialog for destructive or blocking actions.
- `src/components/ui/alert.tsx`: Simple styled alert container/component.
- `src/components/ui/aspect-ratio.tsx`: Radix aspect-ratio wrapper for predictable media sizing.
- `src/components/ui/avatar.tsx`: Avatar primitive wrapper.
- `src/components/ui/badge.tsx`: Small badge/chip component with variant styling.
- `src/components/ui/breadcrumb.tsx`: Breadcrumb navigation primitives.
- `src/components/ui/button.tsx`: Core button component using class-variance-authority variants.
- `src/components/ui/calendar.tsx`: Styled date-picker wrapper built on `react-day-picker`.
- `src/components/ui/card.tsx`: Card container primitives used across admin and utility pages.
- `src/components/ui/carousel.tsx`: Embla-based carousel wrapper.
- `src/components/ui/chart.tsx`: Recharts helper layer for themed charts, legends, and tooltips.
- `src/components/ui/checkbox.tsx`: Checkbox primitive wrapper.
- `src/components/ui/collapsible.tsx`: Collapsible wrapper for simple disclosure UI.
- `src/components/ui/command.tsx`: `cmdk`-based command palette/list component.
- `src/components/ui/context-menu.tsx`: Radix context menu primitives.
- `src/components/ui/dialog.tsx`: Modal dialog wrapper.
- `src/components/ui/drawer.tsx`: Vaul-based drawer/sheet-style mobile panel.
- `src/components/ui/dropdown-menu.tsx`: Dropdown menu primitives.
- `src/components/ui/form.tsx`: React Hook Form helpers and field wrappers.
- `src/components/ui/hover-card.tsx`: Hover card/popover primitive.
- `src/components/ui/input-otp.tsx`: OTP input wrapper around `input-otp`.
- `src/components/ui/input.tsx`: Styled text input component.
- `src/components/ui/label.tsx`: Form label primitive.
- `src/components/ui/menubar.tsx`: Radix menubar primitives.
- `src/components/ui/navigation-menu.tsx`: Navigation menu primitives.
- `src/components/ui/pagination.tsx`: Pagination UI primitives.
- `src/components/ui/popover.tsx`: Popover primitives.
- `src/components/ui/progress.tsx`: Progress-bar primitive.
- `src/components/ui/radio-group.tsx`: Radio group primitives.
- `src/components/ui/resizable.tsx`: Resizable panels wrapper based on `react-resizable-panels`.
- `src/components/ui/scroll-area.tsx`: Custom scroll area primitives.
- `src/components/ui/select.tsx`: Styled Radix select component used in forms and login.
- `src/components/ui/separator.tsx`: Divider primitive.
- `src/components/ui/sheet.tsx`: Side-sheet/dialog wrapper.
- `src/components/ui/sidebar.tsx`: Larger shadcn sidebar framework; more generic than the project’s custom `AdminLayout`.
- `src/components/ui/skeleton.tsx`: Loading skeleton block.
- `src/components/ui/slider.tsx`: Range slider primitive.
- `src/components/ui/SmoothImage.tsx`: Custom image component with shimmer skeleton and blur-to-sharp load transition.
- `src/components/ui/sonner.tsx`: App-level `sonner` toaster mounting component.
- `src/components/ui/switch.tsx`: Toggle switch primitive.
- `src/components/ui/table.tsx`: Table markup primitives.
- `src/components/ui/tabs.tsx`: Tabs primitives.
- `src/components/ui/textarea.tsx`: Styled textarea component.
- `src/components/ui/toast.tsx`: Radix toast primitives and styling.
- `src/components/ui/toaster.tsx`: Toast viewport/renderer wired to the local toast store.
- `src/components/ui/toggle-group.tsx`: Toggle-group primitives.
- `src/components/ui/toggle.tsx`: Toggle-button primitive.
- `src/components/ui/tooltip.tsx`: Tooltip primitives.
- `src/components/ui/use-toast.ts`: Hook bridge for the Radix toast system under `src/components/ui`.

## Brand Assets

- `src/assets/brand/dealer-network.jpg`: Brand/supporting image for the dealer network section.
- `src/assets/brand/logo.png`: Internal brand logo asset for site/admin usage.

## Product Showcase Assets

- `src/assets/products/showcase/cinematic-view.png`: Premium hero/render image for the featured generator showcase.
- `src/assets/products/showcase/container.png`: Visual for the non-standard/container product category.
- `src/assets/products/showcase/factory.jpg`: Manufacturing/facility hero image used on marketing and login surfaces.
- `src/assets/products/showcase/main-view.png`: Main fallback/showcase generator image used across product stories.
- `src/assets/products/showcase/non-standard.jpg`: Supporting image for non-standard/custom product messaging.
- `src/assets/products/showcase/product-video.mp4`: Short product video used in showcase/presentation content.

## Product Parts Assets

- `src/assets/products/parts/enclosure.jpg`: Generic enclosure image used as reusable or placeholder content.
- `src/assets/products/parts/engine-real.jpg`: Generic real-engine image used in showcase sections and migrations.

## Escorts Product Assets

- `src/assets/products/escorts/escort_15kva.jpg`: Primary EKL 15 product photo; reused in templates and migrations.
- `src/assets/products/escorts/escort_15kva_2.jpg`: Alternate EKL 15 angle used in galleries/presentations.
- `src/assets/products/escorts/escort_20kva.jpg`: Base photo for 20 kVA Escorts product content.
- `src/assets/products/escorts/escort_20kva_1.jpg`: Alternate 20 kVA view used in generated showcase/migration content.
- `src/assets/products/escorts/escort_20kva_2.jpg`: Additional 20 kVA gallery image.
- `src/assets/products/escorts/escort_25kva.jpg`: 25 kVA Escorts product image.
- `src/assets/products/escorts/escort_30kva.jpg`: 30 kVA Escorts product image, also reused as placeholder in some EKL15 chapters.
- `src/assets/products/escorts/escort_30kva_1.jpg`: Alternate 30 kVA view.
- `src/assets/products/escorts/escort_40kva.jpg`: 40 kVA Escorts product image.
- `src/assets/products/escorts/escort_40kva_2.jpg`: Alternate 40 kVA image.
- `src/assets/products/escorts/escort_40kva_3.jpg`: Additional 40 kVA gallery image.
- `src/assets/products/escorts/escort_40kva_4.jpg`: Additional 40 kVA gallery image.
- `src/assets/products/escorts/escort_40kva_main.jpg`: Main 40 kVA product image used in template placeholders and migration content.
- `src/assets/products/escorts/escort_58_5kva_1.jpg`: 58.5 kVA product gallery image.
- `src/assets/products/escorts/escort_58_5kva_2.jpg`: 58.5 kVA product gallery image.
- `src/assets/products/escorts/escort_58_5kva_3.jpg`: 58.5 kVA product gallery image.
- `src/assets/products/escorts/escort_58_5kva_4.jpg`: 58.5 kVA product gallery image.
- `src/assets/products/escorts/escort_58_5kva_5.jpg`: 58.5 kVA product gallery image.
- `src/assets/products/escorts/escort_58_5kva_6.jpg`: 58.5 kVA product gallery image.

## Practical Takeaways

- The repo’s center of gravity is clearly shifting toward Supabase; the Sanity-based content layer is now mostly fallback/legacy.
- The admin experience is already fairly ambitious, especially around CMS editing and product creation, but it still carries some migration-era duplication and unused code.
- The next cleanup wins would likely be removing or consolidating legacy CMS paths, deleting the Vite starter CSS, wiring or removing orphaned routes/components, and restoring a healthy dependency install so build/test status is trustworthy.
