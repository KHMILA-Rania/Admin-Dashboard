
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline ,ThemeProvider } from "@mui/material";
import TopBar from "./screens/global/topBar";
import Dashboard from "./screens/dashboard";
import SideBar from  "./screens/dashboard";



function App() {
  const [theme , colorMode]=useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
            <div className="app">
              <main className="content"><TopBar></TopBar> </main>
            </div>
     </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
