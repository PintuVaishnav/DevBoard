import { Route, Switch } from "wouter";
import Dashboard from "@/components/Dashboard";
import GitHubRepo from "@/pages/githubrepo";
import Overview from "@/pages/Home";
import Pipelines from "@/pages/Pipelines";
import Health from "@/pages/Health";
import Dockerhub from "@/pages/dockerhub";
import Kubernetes from "@/pages/kubernetes";
import Gcp from "@/pages/gcp";
import Aws from "@/pages/aws";
import Helm from "@/pages/helm";
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
        {/* <Route path="/grafana" component={Grafana} />*/}
        <Route path="/aws" component={Aws} /> 
        <Route path="/helm" component={Helm} />
        <Route path="/gcp" component={Gcp} /> 
        <Route path="/dockerhub" component={Dockerhub} />
        <Route path="/kubernetes" component={Kubernetes} />
        <Route path="/costs" component={Costs} />
        <Route path="/tokens" component={Tokens} />
        <Route path="/githubrepo" component={GitHubRepo} />
        <Route component={NotFound} />
      </Switch>
    </Dashboard>
  );
}
