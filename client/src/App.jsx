import { Route, Routes } from "react-router-dom";
import Call from "./screens/Call";
import Home from "./screens/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/call/" element={<Call />} />
    </Routes>
  );
}

export default App;
