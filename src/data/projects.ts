export type ProjectMetric = {
  label: string;
  value: string;
};

export type Project = {
  slug: string;
  year: string;
  title: string;
  category: string;
  desc: string;
  color: string;
  image?: string;
  galleryImages?: string[];
  tags: string[];
  featured?: boolean;
  role: string;
  timeline: string;
  client: string;
  liveUrl?: string;
  sourceUrl?: string;
  overview: string;
  problem: string;
  solution: string;
  features: string[];
  responsibilities: string[];
  metrics: ProjectMetric[];
};

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const projects: Project[] = [
  {
    slug: "scratch-pixel",
    year: "2026",
    title: "Scratch Pixel",
    category: "Android App - Rewards & Scratch Cards",
    desc: "A modern rewards app with scratch cards, daily rewards, referrals, wallet system, notifications, admin-controlled ads, and redeem features.",
    color: "from-electric to-sage",
    image: publicAsset("images/ScratchPixel_Home.jpeg"),
    galleryImages: [
      publicAsset("images/ScratchPixel_Splash0.jpeg"),
      publicAsset("images/ScratchPixel_Splash1.jpeg"),
      publicAsset("images/ScratchPixel_Splash2.jpeg"),
      publicAsset("images/ScratchPixel_Splash3.jpeg"),
      publicAsset("images/ScratchPixel_Splash4.jpeg"),
      publicAsset("images/ScratchPixel_Home.jpeg"),
      publicAsset("images/ScratchPixel_Scratch.jpeg"),
      publicAsset("images/ScratchPixel_wallet.jpeg"),
      publicAsset("images/ScratchPixel_Refferal.jpeg"),
      publicAsset("images/ScratchPixel_Profile.jpeg"),
      publicAsset("images/ScratchPixel_Profile2.jpeg"),
    ],
    tags: [
      "Flutter",
      "Dart",
      "Firebase",
      "AdMob",
      "Android",
      "Rewards App",
      "Admin Panel",
    ],
    featured: true,
    role: "Flutter app developer and UI designer",
    timeline: "1 week",
    client: "Personal project",
    liveUrl: "https://drive.google.com/drive/folders/1GH5yExYpPScekNaLJidpcv7Tfy00AlP1?usp=sharing",
    overview:
      "Scratch Pixel is a Flutter-based Android rewards app where users can earn coins using scratch cards, ads, referrals, and daily rewards. The app includes wallet tracking, withdrawal requests, notifications, admin-controlled settings, and Firebase integration.",
    problem:
      "The goal was to build a modern rewards application with a smooth mobile experience, dynamic admin controls, and a scalable earning system connected with Firebase and AdMob.",
    solution:
      "I created a complete Flutter application with a separate admin dashboard for controlling ads, rewards, withdrawals, notifications, and app settings in real time. The app uses Firebase services for authentication, database management, and dynamic content updates.",
    features: [
      "Scratch cards reward system",
      "Daily rewards and coin earning",
      "Wallet balance and activity tracking",
      "Withdrawal request system",
      "Referral rewards and referral history",
      "Push notifications with read status",
      "Admin-controlled AdMob ads system",
      "Firebase authentication and database integration",
      "Dynamic settings controlled from admin panel",
      "Modern mobile UI with multiple screens",
    ],
    responsibilities: [
      "Developed the full Flutter Android application",
      "Built Firebase backend integration",
      "Created wallet and rewards system",
      "Integrated AdMob rewarded and banner ads",
      "Designed responsive mobile UI screens",
      "Connected admin dashboard controls with app",
      "Implemented notifications and referral features",
      "Optimized app structure and user experience",
    ],
    metrics: [
      { label: "Platform", value: "Android" },
      { label: "Framework", value: "Flutter" },
      { label: "Backend", value: "Firebase" },
      { label: "Screens", value: "10+" },
    ],
  },
  {
    slug: "scratch-pixel-admin",
    year: "2026",
    title: "Scratch Pixel Admin",
    category: "Web Admin Dashboard - Rewards Management",
    desc: "A complete admin dashboard for managing users, rewards, withdrawals, ads, notifications, referrals, and app settings for the Scratch Pixel ecosystem.",
    color: "from-ink to-electric",
    image: publicAsset("images/ScratchPixelAdmin_Dashboard.png"),
    galleryImages: [
      publicAsset("images/ScratchPixelAdmin_1.png"),
      publicAsset("images/ScratchPixelAdmin_2.png"),
      publicAsset("images/ScratchPixelAdmin_3.png"),
      publicAsset("images/ScratchPixelAdmin_4.png"),
    ],
    tags: [
      "Admin Dashboard",
      "Firebase",
      "Web App",
      "JavaScript",
      "Realtime Database",
      "AdMob Control",
      "Rewards System",
    ],
    featured: true,
    role: "Full-stack developer and dashboard designer",
    timeline: "1 week",
    client: "Personal project",
    liveUrl: publicAsset("scratch-pixel-admin/index.html"),
    overview:
      "ScratchPixel Admin is a web-based dashboard created to manage the Scratch Pixel rewards application. It allows real-time control over users, rewards, withdrawals, ads, notifications, referrals, and app-wide settings through Firebase integration.",
    problem:
      "The rewards app required a centralized admin system to control user activities, app rewards, advertisements, notifications, and withdrawal requests efficiently in real time.",
    solution:
      "I built a responsive admin dashboard connected with Firebase to manage all app operations dynamically. The panel enables live updates for ads, settings, notifications, reward systems, and withdrawal approvals without updating the mobile app.",
    features: [
      "User management dashboard",
      "Withdrawal request approval system",
      "AdMob ads management",
      "Realtime app settings control",
      "Notification sending system",
      "Referral reward management",
      "Rewards and scratch card controls",
      "Firebase realtime integration",
      "Dynamic app configuration system",
      "Responsive admin interface",
    ],
    responsibilities: [
      "Developed the complete admin dashboard",
      "Integrated Firebase database and services",
      "Connected app settings dynamically with mobile app",
      "Built withdrawal and rewards management system",
      "Implemented notifications and referral controls",
      "Designed responsive admin UI and layouts",
      "Managed AdMob integration controls",
      "Optimized realtime admin operations",
    ],
    metrics: [
      { label: "Platform", value: "Web" },
      { label: "Backend", value: "Firebase" },
      { label: "Controls", value: "Realtime" },
      { label: "Modules", value: "10+" },
    ],
  },
  {
    slug: "gaurav-organics",
    year: "2026",
    title: "Gaurav Organics",
    category: "Organic Products - E-commerce Website",
    desc: "A static e-commerce site for cold-pressed oils and spices with variants, cart, checkout, wholesale inquiry, and admin tools.",
    color: "from-terracotta to-butter",
    image: publicAsset("images/Gaurav%20Organics.png"),
    tags: ["HTML", "Tailwind CSS", "JavaScript", "LocalStorage"],
    featured: true,
    role: "Frontend developer and e-commerce UI designer",
    timeline: "2 weeks",
    client: "Gaurav Organics",
    liveUrl: publicAsset("gaurav-organics/index.html"),
    overview:
      "Gaurav Organics is a static e-commerce website for oils and spices. It combines brand storytelling with a working shopping flow, wholesale inquiry, and a localStorage-powered admin panel.",
    problem:
      "The brand needed a site that could explain product quality, show pack sizes clearly, and handle retail plus bulk inquiries.",
    solution:
      "I built a self-contained storefront using HTML, Tailwind CSS, Lucide icons, and vanilla JavaScript. Products, cart, orders, customers, subscriptions, and admin updates.",
    features: [
      "Brand homepage with product highlights, trust points, FAQs, and newsletter/WhatsApp capture",
      "Shop with search, filters, quick view, variants, ratings, and responsive product cards",
      "Cart, checkout, order success, account screens, subscriptions, and reorder flow",
      "Wholesale inquiry and admin dashboard for products, orders, customers, and subscriptions",
    ],
    responsibilities: [
      "Designed the organic visual direction, content hierarchy, and product-focused UI",
      "Built the storefront pages, catalog, cart, checkout, account, and wholesale flow",
      "Modeled variants, pricing, cart items, orders, customers, subscriptions, and admin state",
      "Connected the admin dashboard to browser storage for a backend-free demo",
    ],
    metrics: [
      { label: "Storefront", value: "Product Catalog" },
      { label: "Checkout", value: "Cart + Orders" },
      { label: "Operations", value: "Admin + B2B" },
    ],
  },
  {
    slug: "purniq-management",
    year: "2026",
    title: "Purniq Management",
    category: "ERP Dashboard - Business Management",
    desc: "A unified management dashboard for stock, billing, customers, quality checks, finance, reports, and admin settings.",
    color: "from-ink to-electric",
    image: publicAsset("images/Purniq%20Management.png"),
    tags: ["HTML", "Tailwind CSS", "JavaScript", "Chart.js", "LocalStorage"],
    featured: true,
    role: "Frontend developer and dashboard UI designer",
    timeline: "Prototype build",
    client: "Purniq ERP concept",
    liveUrl: publicAsset("purniq-management/index.html"),
    overview:
      "Purniq Management is an ERP-style dashboard for daily business operations. It brings sales, inventory, invoicing, customers, quality checks, finance, and reports into one interface.",
    problem:
      "Small teams often track stock, invoices, dues, and reports across separate tools, which makes daily decisions slower and easier to miss.",
    solution:
      "I built a single-page management dashboard with tabbed modules, local data, charts, invoice tools, customer records, and operational reports.",
    features: [
      "Dashboard with sales, profit, cash balance, stock status, activity, and growth charts",
      "Inventory, invoice, customer, supplier, loyalty, quality, and finance modules",
      "Admin settings, backup tools, locked mode, notifications, and report filters",
      "LocalStorage-powered data model for products, customers, suppliers, expenses, and invoices",
    ],
    responsibilities: [
      "Designed the dashboard layout, sidebar navigation, cards, tables, forms, and modal flows",
      "Built tab switching, stock management, invoice actions, customer records, and reports",
      "Connected charts, QR utilities, filters, notifications, and local browser storage",
      "Prepared the static HTML demo for portfolio preview and screenshot extraction",
    ],
    metrics: [
      { label: "Modules", value: "ERP Suite" },
      { label: "Core Flow", value: "Stock + Billing" },
      { label: "Data", value: "Local Demo" },
    ],
  },
  {
    slug: "gaurav-organics-kiosk",
    year: "2026",
    title: "Gaurav Organics Kiosk",
    category: "Retail Kiosk - Self Order Website",
    desc: "A touch-friendly self-order kiosk for Gaurav Organics with product browsing, pack selection, cart, converter, and payment success flow.",
    color: "from-terracotta to-butter",
    image: publicAsset("images/Gaurav%20Kiosk.png"),
    tags: ["HTML", "Tailwind CSS", "JavaScript", "Retail UI"],
    featured: true,
    role: "Frontend developer and kiosk UI designer",
    timeline: "Prototype build",
    client: "Gaurav Organics",
    liveUrl: publicAsset("gaurav-kiosk/index.html"),
    overview:
      "A self-order kiosk concept for Gaurav Organics retail counters. The interface helps customers browse oils and spices, choose pack sizes, add items to cart, and complete an assisted counter order.",
    problem:
      "Retail counters need a simple way to present products, sizes, and bulk options without slowing staff down during busy hours.",
    solution:
      "I redesigned the kiosk around large touch targets, branded product imagery, fast category switching, size selection, a custom amount converter, and a clear cart summary.",
    features: [
      "Branded welcome screen with Gaurav Organics imagery and tap-to-start flow",
      "Touch-friendly product cards for oils, spices, retail packs, and bulk packs",
      "Size picker, custom amount converter, cart review, and payment success modal",
      "Local static demo packaged for portfolio live preview",
    ],
    responsibilities: [
      "Reworked the kiosk visual design for Gaurav Organics branding",
      "Connected product data, product images, category tabs, cart state, and quantity selection",
      "Improved the order flow for large-screen touch use",
      "Prepared the public preview route and screenshot asset",
    ],
    metrics: [
      { label: "Mode", value: "Touch Kiosk" },
      { label: "Flow", value: "Cart + Pay" },
      { label: "Brand", value: "Gaurav Organics" },
    ],
  },
  {
    slug: "portfolio-forge",
    year: "2025",
    title: "Portfolio Forge",
    category: "Developer Portfolio - Interactive",
    desc: "A dark interactive developer portfolio with particle visuals, project cards, modal case studies, and disabled preview links.",
    color: "from-ink to-electric",
    image: publicAsset("images/Portfolio%201.png"),
    tags: ["HTML", "Tailwind CSS", "Three.js", "GSAP"],
    featured: true,
    role: "Frontend developer and interaction designer",
    timeline: "Concept build",
    client: "Portfolio concept",
    liveUrl: publicAsset("portfolio-1/index.html"),
    overview:
      "Portfolio Forge is a high-contrast developer portfolio concept with animated particles, bold hero typography, project cards, and popup case-study details.",
    problem:
      "The project section needed to show work details without sending visitors to unfinished or unavailable external previews.",
    solution:
      "I kept the project modal experience and changed the View Project button into a polished notice popup, so every project stays self-contained inside the demo.",
    features: [
      "Animated hero with particle background and bold developer positioning",
      "Project grid with image cards, tech labels, and case-study modals",
      "View Project notice popup instead of external preview links",
      "Copied local project images into the public preview package",
    ],
    responsibilities: [
      "Updated the project CTA behavior to avoid broken preview links",
      "Added a dedicated preview notice popup and escape-close handling",
      "Made the hero content screenshot-ready by removing the stuck loader state",
      "Packaged the static portfolio for live preview",
    ],
    metrics: [
      { label: "Style", value: "Dark Motion" },
      { label: "Projects", value: "Popup Cards" },
      { label: "Links", value: "Disabled" },
    ],
  },
  {
    slug: "portfolio-studio",
    year: "2026",
    title: "Portfolio Studio",
    category: "Developer Portfolio - Editorial",
    desc: "A polished editorial portfolio concept personalized with my branding, 3D hero visuals, skills, process, contact flow, and five built project entries.",
    color: "from-sage to-butter",
    image: publicAsset("images/Portfolio%202.png"),
    tags: ["HTML", "CSS", "Three.js", "JavaScript"],
    featured: true,
    role: "Frontend developer and portfolio designer",
    timeline: "Concept build",
    client: "Portfolio concept",
    liveUrl: publicAsset("portfolio-2/index.html"),
    overview:
      "Portfolio Studio is an editorial developer portfolio concept with a soft visual system, 3D hero scene, skills, process, contact form, and a cleaned project archive using my own work.",
    problem:
      "The original version still had demo branding, sample contact details, and generic concept projects that did not feel personal.",
    solution:
      "I cleaned the branding, contact details, skills, about copy, testimonial area, and work list so the page reads like a Gaurav Shekhawat portfolio build.",
    features: [
      "Full portfolio structure with hero, about, skills, work, process, statement, and contact sections",
      "Five project entries based on my actual portfolio work with summaries, tags, and metrics",
      "Three.js hero sculpture, particles, custom cursor, reveal effects, and hover previews",
      "Personalized metadata, email, footer, form examples, and technology labels",
    ],
    responsibilities: [
      "Removed generic demo identity and replaced it with my own portfolio branding",
      "Changed the work archive from fake company concepts to my built project names",
      "Tightened the contact and footer spacing for a cleaner bottom section",
      "Prepared the public preview route and screenshot asset",
    ],
    metrics: [
      { label: "Archive", value: "5 Projects" },
      { label: "Visuals", value: "3D Hero" },
      { label: "Sections", value: "Full Portfolio" },
    ],
  },
  {
    slug: "dfn-store",
    year: "2026",
    title: "DFN Store",
    category: "Organic Oils - E-commerce Website",
    desc: "A bright product website for DFN oils with hero storytelling, product cards, purity promises, cart pages, and policy screens.",
    color: "from-butter to-sage",
    image: publicAsset("images/DFN%20Store.png"),
    tags: ["HTML", "Tailwind CSS", "JavaScript", "E-commerce"],
    featured: true,
    role: "Frontend developer and product UI designer",
    timeline: "Static website build",
    client: "DFN concept",
    liveUrl: publicAsset("dfn/index.html"),
    overview:
      "DFN Store is a static e-commerce website for cooking oils. It focuses on product clarity, purity messaging, deal sections, cart flow, and supporting content pages.",
    problem:
      "The brand needed a cleaner way to present oils, pricing, health benefits, and trust details in one browsing flow.",
    solution:
      "I packaged the existing DFN website as a portfolio preview and connected it to the project archive with a focused project summary.",
    features: [
      "Hero section with large product bottle visual and Direct From Nature positioning",
      "Product cards, deal section, product detail pages, cart, FAQ, contact, and policy pages",
      "Purity promise blocks with health, safety, sourcing, and packaging messaging",
      "Public preview added without changing the original DFN source files",
    ],
    responsibilities: [
      "Organized the DFN demo into a portfolio-ready preview route",
      "Added a screenshot asset and project archive entry",
      "Kept the original DFN files unchanged while making the preview accessible",
      "Summarized the important product and commerce features for the case study",
    ],
    metrics: [
      { label: "Pages", value: "Store + Policy" },
      { label: "Focus", value: "Organic Oils" },
      { label: "Flow", value: "Browse + Cart" },
    ],
  },
  {
    slug: "purniq-website",
    year: "2026",
    title: "Purniq Website",
    category: "Organic Products - E-commerce Website",
    desc: "A premium Purniq storefront for cold-pressed oils and spices with animated product storytelling, shop sections, and wholesale actions.",
    color: "from-amber-600 to-stone-900",
    image: publicAsset("images/Purniq%20Website.png"),
    tags: ["HTML", "Tailwind CSS", "JavaScript", "Lucide"],
    featured: true,
    role: "Frontend developer and storefront designer",
    timeline: "Static website build",
    client: "Purniq concept",
    liveUrl: publicAsset("purniq-website/index.html"),
    overview:
      "Purniq Website is a polished storefront concept for cold-pressed oils and spices. It pairs premium brand visuals with product browsing, shop actions, and wholesale entry points.",
    problem:
      "The storefront needed to feel more premium while still keeping shopping, product packs, and business inquiries easy to find.",
    solution:
      "I added the Purniq website to the portfolio with its needed image assets so the live preview can load properly.",
    features: [
      "Premium hero with oil bottle mockup, floating quality badges, and shop CTAs",
      "Product cards for oils and spices with pack-size messaging and quick actions",
      "Wholesale path, testimonial sections, authentication UI, and brand storytelling",
      "Preview package includes the local assets needed by the HTML file",
    ],
    responsibilities: [
      "Packaged the existing Purniq HTML as a public portfolio preview",
      "Copied the required product imagery so the preview loads cleanly",
      "Added a dedicated project screenshot and archive entry",
      "Kept the original source file unchanged",
    ],
    metrics: [
      { label: "Storefront", value: "Premium Shop" },
      { label: "Products", value: "Oils + Spices" },
      { label: "Business", value: "Wholesale CTA" },
    ],
  },
  {
    slug: "shekhawat-market",
    year: "2025",
    title: "Shekhawat Market",
    category: "Property Management - Live Web App",
    desc: "A live property management web app with admin and tenant login flows for rent, tenants, payments, charges, and reports.",
    color: "from-electric to-ink",
    image: publicAsset("images/Shekhawat-Market.png"),
    tags: ["HTML", "JavaScript", "Firebase", "Dashboard"],
    featured: true,
    role: "Frontend developer and dashboard builder",
    timeline: "Live deployment",
    client: "Shekhawat Properties",
    liveUrl: "https://shekhawatproperties.github.io/",
    overview:
      "Shekhawat Market is a live property management system for tracking tenants, rent collections, property records, payments, charges, reports, and tenant self-service.",
    problem:
      "Property work needs one clear place for rent status, tenant details, documents, charges, and payment history.",
    solution:
      "I linked the portfolio entry directly to the live GitHub Pages deployment and kept the local source files untouched.",
    features: [
      "Admin demo: shekhawatproperties1@gmail.com / 123456",
      "Tenant demo: testlogin1@gmail.com / 123456",
      "Dashboards for rent income, deposits, tenants, properties, payments, charges, and reports",
      "Live preview uses the deployed website URL instead of the local code folder",
    ],
    responsibilities: [
      "Added the deployed Shekhawat Properties URL as the live preview",
      "Documented the admin and tenant demo credentials in the project detail page",
      "Added a project screenshot and archive card",
      "Left the local website source files unchanged",
    ],
    metrics: [
      { label: "Status", value: "Live Site" },
      { label: "Roles", value: "Admin + Tenant" },
      { label: "Core", value: "Rent Management" },
    ],
  },
  {
    slug: "portfolio-3",
    year: "2024",
    title: "Personal Portfolio 2024",
    category: "Developer Portfolio - Web + App Showcase",
    desc: "A clean personal portfolio showing web and app work, skills, about content, contact details, and project cards.",
    color: "from-sage to-electric",
    image: publicAsset("images/Portfolio%203.png"),
    tags: ["HTML", "CSS", "JavaScript", "Responsive UI"],
    featured: true,
    role: "Frontend developer and portfolio designer",
    timeline: "Portfolio build",
    client: "Personal portfolio",
    liveUrl: publicAsset("portfolio-3/index.html"),
    overview:
      "Personal Portfolio 2024 is a lighter portfolio focused on web and app development work. It includes a hero section, project cards, skills, about copy, and contact area.",
    problem:
      "The portfolio needed to show both website work and Android app work in a simple, complete layout.",
    solution:
      "I added the portfolio folder as a public preview and connected it as a full project in the archive.",
    features: [
      "Hero section with web/app developer positioning and illustration",
      "Project cards for Quotes App and Cyberwit with external links",
      "About, skills, responsive navigation, contact, and resume call-to-action",
      "Preview package copied from the folder without editing its original code",
    ],
    responsibilities: [
      "Packaged the portfolio folder into the public preview area",
      "Added project data, screenshot, and live preview route",
      "Kept the original portfolio files unchanged",
      "Connected the project to the main archive",
    ],
    metrics: [
      { label: "Type", value: "Portfolio" },
      { label: "Work", value: "Web + App" },
      { label: "Preview", value: "Static Site" },
    ],
  },
  {
    slug: "quotes-app",
    year: "2025",
    title: "Quotes App",
    category: "Android App - Quotes & Sharing",
    desc: "A mobile quotes app with categories, favorites, search, themes, like/share actions, and a focused screen gallery.",
    color: "from-butter to-terracotta",
    image: publicAsset("images/Quotes%20App.png"),
    galleryImages: [
      publicAsset("images/Quotes%20App%20Home%202.png"),
      publicAsset("images/Quotes%20App%20Home%203.png"),
      publicAsset("images/Quotes%20App%20Categories.png"),
      publicAsset("images/Quotes%20App%20Favorite.png"),
      publicAsset("images/Quotes%20App%20Search.png"),
      publicAsset("images/Quotes%20App%20Settings.png"),
    ],
    tags: ["Android", "Kotlin", "Mobile UI", "Screen Gallery"],
    featured: true,
    role: "Android app developer and UI designer",
    timeline: "App build",
    client: "Personal app",
    liveUrl: "https://drive.google.com/drive/folders/1iulb5DLlnWtbHOWZPIeOPEuv0_hlEMvd?usp=sharing",
    overview:
      "Quotes App is an Android app for browsing daily quotes, saving favorites, searching categories, changing themes, and sharing quote images.",
    problem:
      "The app needed a simple mobile interface for quote discovery, quick actions, and visual sharing.",
    solution:
      "I added the app as a project using the provided app screenshots and APK folder, with the project detail focused on the actual mobile features.",
    features: [
      "Daily quote screen with category label, like, copy, refresh, and share actions",
      "Favorites, categories, search, about, and settings screens",
      "Multiple visual themes for the app interface",
      "Screen gallery for the main app states and interactions",
    ],
    responsibilities: [
      "Added the app as a dedicated project entry",
      "Used the provided Android screenshots as the project image",
      "Documented the app features clearly for the project detail page",
      "Kept the portfolio package focused on screenshots instead of build artifacts",
    ],
    metrics: [
      { label: "Platform", value: "Android" },
      { label: "Screens", value: "7+" },
      { label: "Preview", value: "Gallery" },
    ],
  },
];
export const featuredProjects = projects.filter((project) => project.featured);

export const getProjectBySlug = (slug: string) =>
  projects.find((project) => project.slug === slug);
