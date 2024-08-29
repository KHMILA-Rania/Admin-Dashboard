import Header from "../../components/Header";
import { Box,Typography } from "@mui/material";
import LineChart from "../../components/lineChart";
const Line = () => {
    return ( <Box m="20px">
        <Header title="LINE CHART" 
        subtitle="Simple Line Chart "></Header>
        <Box height="75vh">
            <LineChart></LineChart>
        </Box>
    </Box> );
}
 
export default Line;