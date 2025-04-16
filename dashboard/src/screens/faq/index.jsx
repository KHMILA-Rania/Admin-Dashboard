import {Box, useTheme,Typography} from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";
const Faq = () => {
    const theme=useTheme();
    const colors=tokens(theme.palette.mode)
    return ( <Box m="20px">
        <Header title="FAQ" subtitle="Frequently asked Questions Page" ></Header>

        <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon></ExpandMoreIcon>}>
                <Typography color={colors.greenAccent[500] } variant="h5">
                    An important question
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography>
                    
                    Note that the development build is not optimized.
                    To create a production build, use npm run build.

                </Typography>
            </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon></ExpandMoreIcon>}>
                <Typography color={colors.greenAccent[500] } variant="h5">
                    An important question
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography>
                    
                    Note that the development build is not optimized.
                    To create a production build, use npm run build.

                </Typography>
            </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon></ExpandMoreIcon>}>
                <Typography color={colors.greenAccent[500] } variant="h5">
                    An important question
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography>
                    
                    Note that the development build is not optimized.
                    To create a production build, use npm run build.

                </Typography>
            </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon></ExpandMoreIcon>}>
                <Typography color={colors.greenAccent[500] } variant="h5">
                    An important question
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography>
                    
                    Note that the development build is not optimized.
                    To create a production build, use npm run build.

                </Typography>
            </AccordionDetails>
        </Accordion>
    </Box> );
}
 
export default Faq;