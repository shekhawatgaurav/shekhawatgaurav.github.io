import { BrowserRouter, Route, Routes } from "react-router-dom";
import RouteScrollReset from "./components/RouteScrollReset.tsx";
import Index from "./pages/Index.tsx";
import Archive from "./pages/Archive.tsx";
import ProjectDetail from "./pages/ProjectDetail.tsx";
import NotFound from "./pages/NotFound.tsx";

const App = () => (
  <BrowserRouter>
    <RouteScrollReset />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/archive" element={<Archive />} />
      <Route path="/projects/:slug" element={<ProjectDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
