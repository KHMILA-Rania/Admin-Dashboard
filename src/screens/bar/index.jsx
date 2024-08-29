import { Box } from "@mui/material";
import Header from "../../components/Header";
import BarChart from "../../components/barChart";



const Bar = () => {
    return (  
        <Box m="20px">
            <Header title="BARCHAR" subtitle="Simple barchart"></Header>
        
            <Box height="75vh">
                <BarChart></BarChart>
            </Box>
        
        </Box>
    );
}
 
export default Bar;