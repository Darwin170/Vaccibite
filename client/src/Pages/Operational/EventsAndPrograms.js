import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Calendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { dateFnsLocalizer } from "react-big-calendar";
import Sidebar from "./Sidebar";
import "./Sidebar.css";
import "./EventsAndPrograms.css";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const CalendarScheduler = () => {
  const [events, setEvents] = useState([]);

  // Control current view: month, week, day, agenda
  const [view, setView] = useState("month");

  // Control current date displayed on calendar
  const [date, setDate] = useState(new Date());

  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8787/auth/getAllEvents");
      const formattedEvents = response.data.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="reporting-container" style={{ marginLeft: "220px", flex: 1 }}>
        
        <div className="calendar-wrapper">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            view={view}           // controlled view
            onView={setView}      // update view on change
            date={date}           // controlled date
            onNavigate={setDate}  // update date on navigation (next/back/today)
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarScheduler;
