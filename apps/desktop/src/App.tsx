import { RouterProvider } from "react-router-dom";
import { Providers } from "./components/providers";
import { router } from "./routes";
import "./App.css";

function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}

export default App;
