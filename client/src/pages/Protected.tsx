import { Route, Switch } from "wouter";
import Dashboard from "@/components/Dashboard";
import GitHubRepo from "@/pages/githubrepo";
import Overview from "@/pages/Home";
import Pipelines from "@/pages/Pipelines";
import Health from "@/pages/Health";
import Features from "@/pages/Features";
import Releases from "@/pages/Releases";
import Costs from "@/pages/Costs";
import Tokens from "@/pages/Tokens";
import NotFound from "@/pages/not-found";

export default function ProtectedRoutes() {
  return (
    <Dashboard>
      <Switch>
        <Route path="/overview" component={Overview} />
        <Route path="/pipelines" component={Pipelines} />
        <Route path="/health" component={Health} />
        <Route path="/features" component={Features} />
        <Route path="/releases" component={Releases} />
        <Route path="/costs" component={Costs} />
        <Route path="/tokens" component={Tokens} />
        <Route path="/githubrepo" component={GitHubRepo} />
        <Route component={NotFound} />
      </Switch>
    </Dashboard>
  );
}
