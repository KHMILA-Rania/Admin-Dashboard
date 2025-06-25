
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline ,ThemeProvider } from "@mui/material";
import TopBar from "./screens/global/topBar";
import Dashboard from "./screens/dashboard";
import MainDashboard from "./screens/dashboard/mainDashboard"
import Sidebar from  "./screens/global/sideBar";
import {Routes, Route} from "react-router-dom";
import Team from "./screens/team/index";
import Contacts from "./screens/contacts";
import Invoices from "./screens/invoices";
import Calendar from "./screens/calendar";
import Form from "./screens/form";
import Faq from "./screens/faq";
import BarChart from "./components/barChart";
import Bar from "./screens/bar";
import Pie from "./screens/pie";
import Line from "./screens/line";
import Geo from "./screens/geo";
import AdminLogin from "./screens/login";
import Comment from "./screens/comments";
function App() {
  const [theme , colorMode]=useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
            <div className="app">
            
              <main className="content">
             
              
                <Routes>
                    <Route path="/" element={<AdminLogin />} />
                    <Route path="/dashboard" element={<MainDashboard />}>
                         <Route index element={<MainDashboard />} />
                        <Route path="dash" element={<Dashboard></Dashboard>} />
                        <Route path="team" element={<Team></Team>} />
                        <Route path="contacts" element={<Contacts></Contacts>}></Route>
                        <Route path="invoices" element={<Invoices></Invoices>}></Route>
                        <Route path="calendar" element={<Calendar></Calendar>}></Route>
                        <Route path="form" element={<Form></Form>}></Route>
                        <Route path="bar" element={<Bar></Bar>}> </Route>
                        <Route path="line" element={<Line></Line>}></Route>
                        <Route path="geography" element={<Geo></Geo>}></Route>
                          <Route path="comments" element={<Comment></Comment>}></Route>
                        <Route path="pie" element={<Pie></Pie>}></Route>
                        <Route path="faq" element={<Faq></Faq>}></Route>

                      </Route>
                     
                </Routes>

                </main>
            </div>
     </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
