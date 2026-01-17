<template>
  <div class="max-w-3xl">
    <!-- Hero -->
    <header class="mb-16">
      <h1 class="text-4xl font-bold tracking-tight mb-4">
        Liquid Glass <span class="text-black/40 dark:text-white/40">Vue</span>
      </h1>
      <p class="text-xl text-black/60 dark:text-white/60 leading-relaxed">
        An open-source Vue 3 UI experiment exploring liquid glass and frosted glass effects inspired by Apple's design language.
      </p>
      <p class="mt-4 text-lg text-black/50 dark:text-white/50">
        Translucency, blur, depth, and motion — using CSS, SVG filters, and Vue 3.
      </p>
      <a 
        href="https://www.patreon.com/15295508/join" 
        target="_blank"
        class="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
      >
        ☕ Buy Me a Coffee
      </a>
    </header>

    <!-- Features -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold mb-6">✨ Features</h2>
      <ul class="space-y-2 text-black/70 dark:text-white/70">
        <li>• Apple-inspired liquid glass visuals</li>
        <li>• Translucent layers with realistic blur</li>
        <li>• SVG-based refraction and distortion</li>
        <li>• Smooth, natural animations</li>
        <li>• Lightweight and dependency-free</li>
        <li>• Reusable Vue components</li>
      </ul>
    </section>

    <!-- Demo -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold mb-6">🎬 Demo</h2>
      <div class="grid grid-cols-2 gap-6">
        <div class="text-center">
          <img src="/search.gif" alt="Search Component" class="rounded-xl w-full" />
          <p class="mt-3 font-medium text-black/70 dark:text-white/70">Searchbox</p>
        </div>
        <div class="text-center">
          <img src="/toggleSwitch.gif" alt="Toggle Switch" class="rounded-xl w-full" />
          <p class="mt-3 font-medium text-black/70 dark:text-white/70">Toggle Switch</p>
        </div>
        <div class="text-center">
          <img src="/slide-progress.gif" alt="Slider" class="rounded-xl w-full" />
          <p class="mt-3 font-medium text-black/70 dark:text-white/70">Slider</p>
        </div>
        <div class="text-center">
          <img src="/navbottom.gif" alt="Bottom Navigation" class="rounded-xl w-full" />
          <p class="mt-3 font-medium text-black/70 dark:text-white/70">Bottom NavBar</p>
        </div>
      </div>
    </section>

    <!-- Motivation -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold mb-6">🧠 Motivation</h2>
      <p class="text-black/70 dark:text-white/70 leading-relaxed mb-4">
        Apple's interfaces demonstrate a high level of visual refinement through subtle glass effects and motion.
      </p>
      <p class="text-black/70 dark:text-white/70 leading-relaxed">
        This project exists to study and understand liquid glass principles, recreate similar effects using pure web technologies and Vue 3, and share learnings with the open-source community.
      </p>
      <p class="mt-4 text-black/50 dark:text-white/50 italic">
        It is not a clone, but a technical and visual exploration.
      </p>
    </section>

    <!-- Tech Stack -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold mb-6">🛠 Tech Stack</h2>
      <ul class="space-y-2 text-black/70 dark:text-white/70">
        <li>• <strong>Vue 3</strong> — Composition API</li>
        <li>• <strong>CSS</strong> — filters, masks, blend modes</li>
        <li>• <strong>SVG filters</strong> — advanced glass effects</li>
        <li>• <strong>Vite</strong> — fast development</li>
      </ul>
      <p class="mt-4 text-sm text-black/50 dark:text-white/50">
        No UI frameworks or design systems are used.
      </p>
    </section>

    <!-- Installation -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold mb-6">📦 Installation</h2>
      <div class="bg-black/5 dark:bg-white/5 rounded-xl p-6 font-mono text-sm">
        <p class="text-black/80 dark:text-white/80">git clone https://github.com/mkj0kjay/vue-web-liquid-glass.git</p>
        <p class="text-black/80 dark:text-white/80">cd vue-web-liquid-glass</p>
        <p class="text-black/80 dark:text-white/80">npm install</p>
        <p class="text-black/80 dark:text-white/80">npm run dev</p>
      </div>
    </section>

    <!-- Components -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold mb-6">🧩 Vue Components</h2>
      <p class="text-black/70 dark:text-white/70 mb-4">
        The project includes a growing set of Vue 3 glass-based components:
      </p>
      <ul class="space-y-2 text-black/70 dark:text-white/70 mb-4">
        <li>• Liquid glass containers</li>
        <li>• Navigation elements</li>
        <li>• Panels and surfaces</li>
        <li>• Interactive glass effects</li>
      </ul>
      <p class="text-black/50 dark:text-white/50 text-sm">
        Each component is self-contained, customizable, and built with performance in mind.
      </p>
    </section>

    <!-- References -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold mb-6">📚 References & Credits</h2>
      <p class="text-black/70 dark:text-white/70 mb-2">
        This project was heavily inspired by:
      </p>
      <p class="text-black/80 dark:text-white/80 font-medium">
        Liquid Glass with CSS & SVG
      </p>
      <a 
        href="https://kube.io/blog/liquid-glass-css-svg/" 
        target="_blank"
        class="text-blue-500 hover:underline"
      >
        kube.io/blog/liquid-glass-css-svg
      </a>
      <p class="mt-4 text-black/50 dark:text-white/50 text-sm">
        Full credit to the original author for the research and experimentation.
      </p>
    </section>

    <!-- Browser Notes -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold mb-6">⚠️ Browser & Performance</h2>
      <ul class="space-y-2 text-black/70 dark:text-white/70">
        <li>• <strong>Currently works only in Chrome</strong></li>
        <li>• Visual results may vary depending on GPU and OS</li>
        <li>• SVG filters can be GPU-intensive in large quantities</li>
      </ul>
    </section>

    <!-- Status -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold mb-6">🚧 Project Status</h2>
      <p class="text-black/70 dark:text-white/70">
        This project is <strong>experimental</strong> and under active development.
      </p>
      <p class="mt-2 text-black/50 dark:text-white/50 text-sm">
        Breaking changes may occur as visuals, APIs, and performance are refined.
      </p>
    </section>

    <!-- Disclaimer -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold mb-6">📄 Disclaimer</h2>
      <ul class="space-y-2 text-black/70 dark:text-white/70">
        <li>• Apple-inspired, <strong>not affiliated with Apple</strong></li>
        <li>• No Apple assets or proprietary designs are used</li>
        <li>• All trademarks belong to their respective owners</li>
      </ul>
    </section>

    <!-- Contributing -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold mb-6">🤝 Contributing</h2>
      <p class="text-black/70 dark:text-white/70 mb-4">
        Contributions are welcome. You can help by:
      </p>
      <ul class="space-y-2 text-black/70 dark:text-white/70">
        <li>• Improving realism or performance</li>
        <li>• Adding new glass components</li>
        <li>• Refactoring for clarity</li>
        <li>• Testing across browsers</li>
      </ul>
    </section>

    <!-- License -->
    <section class="mb-14">
      <h2 class="text-2xl font-semibold mb-6">📜 License</h2>
      <p class="text-black/70 dark:text-white/70">
        MIT License — feel free to use, modify, and share.
      </p>
    </section>

    <!-- Support -->
    <section>
      <h2 class="text-2xl font-semibold mb-6">⭐ Support</h2>
      <p class="text-black/70 dark:text-white/70">
        If you find this project useful or interesting, consider giving it a star.
        It helps the project grow and reach more developers.
      </p>
    </section>
  </div>
</template>
