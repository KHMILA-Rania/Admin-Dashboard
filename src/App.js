
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline ,ThemeProvider } from "@mui/material";
import TopBar from "./screens/global/topBar";
import Dashboard from "./screens/dashboard";
import Sidebar from  "./screens/global/sideBar";
import {Routes, Route} from "react-router-dom";


function App() {
  const [theme , colorMode]=useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
            <div className="app">
            <Sidebar ></Sidebar>
              <main className="content">
             
                <TopBar></TopBar> 
                <Routes>
                    <Route path="/" element={<Dashboard></Dashboard>}></Route>

                </Routes>
                </main>
            </div>
     </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
