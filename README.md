# DailySync

DailySync is a modern, beautifully designed web application built to help you sync your daily tasks and collaborate in groups. It boasts an advanced, highly customizable theming system and a rich, interactive UI.

## ✨ Features

- **Advanced Theming System:** Mix and match Design Systems and Color Palettes!
  - **Design Systems:** Choose between sleek **Glassmorphism** (frosted glass, blurs, smooth shadows) and aggressive **Neobrutalism** (hard edges, thick borders, solid colors).
  - **Color Palettes:** Toggle between Default, the ultra-stark **Noir** (Black & White monochrome), or the vibrant **Hello Kitty** theme.
  - **Dark/Light Mode:** Seamlessly switch between dark and light modes with dynamic background particle effects and aurora gradients.
- **Fluid Animations:** Powered by Framer Motion for smooth page transitions and interactive micro-animations.
- **Dynamic Backgrounds:** Ambient, responsive backgrounds using `tsparticles`.
- **Authentication & Data:** Secure and real-time backend integrated with Supabase.
- **Responsive Layout:** A clean sidebar for desktop and a bottom navigation bar for mobile, providing a native app feel.

## 🚀 Tech Stack

- **Framework:** [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS for deep theme control
- **Animations:** [Framer Motion](https://www.framer.com/motion/) & [tsparticles](https://particles.js.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Backend:** [Supabase](https://supabase.com/)
- **Routing:** [React Router v7](https://reactrouter.com/)

## 🛠️ Getting Started

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/television-x/DailySync.git
   cd DailySync
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port provided in your terminal) to see the app in action!

## 🎨 Customizing Themes

The magic of DailySync lies in its `ThemeContext.tsx` and `index.css`. The app dynamically applies CSS classes to the `<html>` root:
- Design System classes: `.design-glass` or `.design-brutal`
- Palette classes: `.theme-noir` or `.theme-hello-kitty`
- Mode class: `.dark`

Try combining them! *Noir + Brutal + Dark Mode* provides a hacker-style high-contrast interface, while *Default + Glass + Light Mode* offers a serene, frosted aesthetic.
