import { Box } from "@mui/material";
import Header from "../../components/Header";
import PieChart from "../../components/pieChart";


const Pie = () => {
    return ( 
        <Box m="20px">
            <Header title="PIE CHART" subtitle="Simple Pie Chart"></Header>
            <Box height="75vh">
                <PieChart></PieChart>
            </Box>
        
        </Box>
     );
}
 
export default Pie;