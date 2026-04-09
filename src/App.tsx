import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Snake from "@/pages/games/snake";
import Tetris from "@/pages/games/tetris";
import Memory from "@/pages/games/memory";
import Game2048 from "@/pages/games/2048";
import Reaction from "@/pages/games/reaction";
import WordScramble from "@/pages/games/word-scramble";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/games/snake" component={Snake} />
      <Route path="/games/tetris" component={Tetris} />
      <Route path="/games/memory" component={Memory} />
      <Route path="/games/2048" component={Game2048} />
      <Route path="/games/reaction" component={Reaction} />
      <Route path="/games/word-scramble" component={WordScramble} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
