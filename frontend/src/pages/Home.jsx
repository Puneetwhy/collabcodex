// frontend/src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code2, Lock, Users, TerminalSquare, Zap, GitPullRequest, Sparkles, Play, MessageSquare } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const features = [
  {
    icon: <Lock className="h-10 w-10 text-primary" />,
    title: "Secure & Isolated Execution",
    description: "Every run, terminal, and dev server lives in its own Docker container. No installations, zero risk to your machine.",
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Real-Time Collaboration",
    description: "Multiple developers work together with live cursors, selections, presence indicators, and instant chat.",
  },
  {
    icon: <GitPullRequest className="h-10 w-10 text-primary" />,
    title: "Safe Git-like Workflow",
    description: "No one touches Main directly. Personal drafts → push → review → accept. Protected from accidental breaks.",
  },
  {
    icon: <TerminalSquare className="h-10 w-10 text-primary" />,
    title: "Integrated Terminal + Preview",
    description: "Full interactive shell (npm, pip, javac, etc.) + auto-detected live preview in iframe. Just code and see.",
  },
  {
    icon: <Sparkles className="h-10 w-10 text-primary" />,
    title: "AI-Powered Assistance",
    description: "Built-in Groq/OpenAI chat explains code, fixes bugs, generates tests, refactors — with selected code context.",
  },
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: "Zero Friction Setup",
    description: "Open browser → log in → code instantly. No Node, Python, Java, Docker install required. Everything on server.",
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Create or Join a Project",
    description: "Sign up, create a new project or accept an invite. Choose visibility and language (Node, Python, Java).",
    icon: <Play className="h-8 w-8" />,
  },
  {
    step: 2,
    title: "Code in Your Personal Draft",
    description: "Edit files safely in your isolated draft. Real-time sync, cursor tracking, chat — all without touching Main.",
    icon: <Code2 className="h-8 w-8" />,
  },
  {
    step: 3,
    title: "Push → Review → Accept",
    description: "Push changes → create merge request → teammates review diff → owner accepts → Main updates + draft.",
    icon: <GitPullRequest className="h-8 w-8" />,
  },
  {
    step: 4,
    title: "Run, Debug, Preview, Chat",
    description: "Run code in Docker sandbox, use terminal, see live preview, get AI help, discuss in team chat — all in browser.",
    icon: <MessageSquare className="h-8 w-8" />,
  },
];

const Home = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen text-foreground  overflow-x-hidden absolute inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]">
      
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-32">
  <div className="container mx-auto px-4 sm:px-6 text-center">

    <div className="inline-flex items-center rounded-full p-[1px] bg-gradient-to-r from-indigo-500 via-pink-500 to-cyan-500 shadow-sm mb-6">

      <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium bg-white/90 text-primary">
        <span className="mr-2">New in 2026</span> • Secure Docker IDE in your browser
      </div>

    </div>

    <div className='mb-14'>
      <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold -tracking-normal leading-tight">
        Collab <span className="text-cyan-700">Code</span>
        <span className="text-amber-800 text-4xl sm:text-6xl md:text-7xl lg:text-8xl">X</span>
      </h1>

      <span className="from-primary md:text-xl lg:text-2xl sm:text-xl font-semibold">
        Real-Time <span className='text-red-700'>Collaborative</span> Cloud IDE
      </span>
    </div>

    <p className="text-base md:text-xl text-gray-700 text-shadow-gray-600 font-light text-muted-foreground max-w-3xl mx-auto mb-16 px-2">
      VS Code experience in browser. No installs. Isolated Docker execution. Git-PR workflow. AI assistance. Team coding without breaking Main — ever.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Button size="lg" className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg w-full sm:w-auto" asChild>
        <Link to="/signup">Get Started — It's Free</Link>
      </Button>
      <Button size="lg" variant="outline" className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg w-full sm:w-auto" asChild>
        <Link to="/login">Log In</Link>
      </Button>
    </div>

    <p className="text-xs sm:text-sm text-muted-foreground mt-6">
      No credit card required • Full MERN/Python/Java support • 512MB/0.5 CPU sandbox
    </p>
  </div>
</section>
      {/* Features */}
      <section className="py-10 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6">

          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-3xl md:text-3xl font-semibold mb-4">
              Why Teams <span className='text-red-700'>Love</span> Collab<span className='text-cyan-700'>Code</span><span className='text-amber-800'>X</span>
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto text-gray-600">
              Built for speed, safety, and real collaboration — no setup hell.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl sm:text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm sm:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">

            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">
                How It Works
              </h2>
              <p className="text-base sm:text-xl text-gray-700 text-muted-foreground max-w-3xl mx-auto">
                From zero to coding together in under 60 seconds.
              </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {howItWorks.map((step, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-gray-700 text-center px-4 transition-transform duration-300 hover:-translate-y-2"
                >
                  {/* Step Number */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 sm:mb-6 text-primary text-xl sm:text-2xl font-bold shadow-sm">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="mb-4 p-4 bg-primary/10 rounded-full shadow-inner text-primary text-2xl sm:text-3xl transition-all duration-300 group-hover:scale-110">
                    {step.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center mt-12 sm:mt-16">
              <Button
                size="lg"
                className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg w-full sm:w-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md hover:shadow-xl hover:brightness-110 transition-all duration-300"
                asChild
              >
                <Link to="/signup">Start Collaborating Now</Link>
              </Button>
            </div>

          </div>
        </section>

      {/* Footer */}
     <footer className="border-t border-border py-16 rounded-t-4xl bg-blur-10% shadow-gray-700">
  <div className="container mx-auto px-4 sm:px-6">

    {/* Grid Links */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 text-center sm:text-left">
      
      {/* Logo + Tagline */}
      <div className="flex flex-col items-center sm:items-start">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="h-7 w-7 text-primary" />
          <span className="font-bold text-xl sm:text-2xl text-foreground">CollabCodeX</span>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xs">
          Secure real-time collaborative cloud IDE — built for teams who value safety and speed.
        </p>
      </div>

      {/* Product */}
      <div>
        <h4 className="font-semibold mb-4 text-foreground">Product</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors duration-150">Features</Link></li>
          <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors duration-150">Pricing</Link></li>
          <li><Link to="/roadmap" className="text-muted-foreground hover:text-foreground transition-colors duration-150">Roadmap</Link></li>
        </ul>
      </div>

      {/* Company */}
      <div>
        <h4 className="font-semibold mb-4 text-foreground">Company</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors duration-150">About</Link></li>
          <li><Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors duration-150">Blog</Link></li>
          <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors duration-150">Contact</Link></li>
        </ul>
      </div>

      {/* Legal */}
      <div>
        <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors duration-150">Privacy Policy</Link></li>
          <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors duration-150">Terms of Service</Link></li>
        </ul>
      </div>

    </div>

    {/* Bottom */}
    <div className="mt-12 pt-8 border-t border-border text-center sm:text-left text-sm text-muted-foreground">
      © {new Date().getFullYear()} CollabCodeX. All rights reserved.
    </div>

  </div>
</footer>
    </div>
  );
};

export default Home;