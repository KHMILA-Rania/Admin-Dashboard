import { useState } from "react";
import FullCalendar  from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import {Box , List , ListItem ,ListItemText, Typography , useTheme} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { formatDate } from "@fullcalendar/core";

const Calendar = () => {
    const theme = useTheme();
    const colors=tokens(theme.palette.mode);
    const [currentEvents,setCurrentEvents]=useState([]);
   const handleDateClick = (selected) => {
    const title=prompt("please enter new title for your event ");
    const calendarApi=selected.view.calendar;
    calendarApi.unselect();

    if(title) {
        const newEvent = {
            id: `${selected.dateStr}-${title}`,
            title,
            start: selected.startStr,
            end: selected.endStr || selected.startStr, // Ensure the end date is handled
            allDay: selected.allDay,
        };

        calendarApi.addEvent(newEvent);
        console.log(newEvent);
        setCurrentEvents([...currentEvents, newEvent]); // Update the state with the new event
    }
};

    const handleEventClick=(selected)=>{
        if(window.confirm(`are you sure you wnat to delete this event '${selected.event.title}'?`)){
            selected.event.remove();
            setCurrentEvents((prevEvents) =>
                prevEvents.filter((event) => event.id !== selected.event.id)
            );
    }};
   
    return (
        <Box marginLeft="10px">
        <Header title="CALENDAR" subtitle="Full Calendar Intercative Page"></Header>
            <Box display="flex " justifyContent="space-between" marginLeft="10px"
            >
                {/* calendar sidebar*/}
                <Box flex="1 1 20%" 
                backgroundColor={colors.primary[400]} 
                p="15px" borderRadius="4px" >
                    <Typography variant="h5">
                        Events
                    </Typography>
                    <List>
    {currentEvents.map((event) => (
        <ListItem
            key={event.id}
            sx={{
                backgroundColor: colors.greenAccent[500],
                margin: "10px 0",
                borderRadius: "2px",
            }}
        >
            <ListItemText
                primary={event.title}
                secondary={
                    <Typography>
                        {formatDate(event.start, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </Typography>
                }
            />
        </ListItem>
    ))}
</List>


                </Box>
                {/*Calendar*/ }
                <Box flex="1 1 100%" marginLeft="15px">
                        <FullCalendar height="75vh" 
                        plugins={[dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                            listPlugin
                        ]}
                        headerToolbar={{
                            left:"prev ,next today",
                            center: "title",
                            right:"dayGridMonth,timeGridWeek,timeGridDay,listMonth"
                        }}
                        initialView="dayGridMonth" 
                        editable={true} 
                        selectable={true}
                        selectMirror={true} 
                        dayMaxEvents={true} 
                        select={handleDateClick}
                        eventClick={handleEventClick}
                        eventsSet={(events)=>{setCurrentEvents(events)}}
                        initialEvents={[
                            {id:"1", title:"all day event", date:"2022-09-14" },
                            { id: "2", title: "Timed Event", date: "2024-09-15T12:00:00" },
                        ]}>

                        </FullCalendar>
                </Box>
            </Box>
    
    </Box> );
};
 
export default Calendar;