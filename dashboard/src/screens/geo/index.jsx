import Header from "../../components/Header";
import { Box } from "@mui/material";
import GeoChart from "../../components/geoChart";
const Geo = () => {
    return ( <Box m="20px">
        <Header title="GEO CHART" 
        subtitle="Simple Geography Chart "></Header>
        <Box height="75vh">
        <GeoChart></GeoChart>
        </Box>
    </Box> );
}
 
export default Geo;