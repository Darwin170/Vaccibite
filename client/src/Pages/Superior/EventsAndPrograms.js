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
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    details: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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

  const handleAddEvent = async () => {
    const { title, start, end, details } = newEvent;
    if (!title || !start || !end || !details) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8787/auth/createEvent", {
        title,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        details,
      });

      const created = response.data.event;
      setEvents([
        ...events,
        {
          ...created,
          start: new Date(created.start),
          end: new Date(created.end),
        },
      ]);
      setNewEvent({ title: "", start: "", end: "", details: "" });
      setShowModal(false);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event.");
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      await axios.delete(`http://localhost:8787/auth/deleteEvents/${selectedEvent._id}`);
      setEvents(events.filter((event) => event._id !== selectedEvent._id));
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event.");
    }
  };

  return (
  
    <div style={{ display: "flex" }}>
      
      <Sidebar />
      
      <div className="reporting-container" style={{ marginLeft: "220px" }}>

      
        <button className="add-button" onClick={() => setShowModal(true)}>
          + Add Event
        </button>

        {/* Add Event Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3 className="modal-title">New Event</h3>
              <input
                type="text"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="input"
              />
              <label>Start:</label>
              <input
                type="datetime-local"
                value={newEvent.start}
                onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                className="input"
              />
              <label>End:</label>
              <input
                type="datetime-local"
                value={newEvent.end}
                onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                className="input"
              />
              <label>Details:</label>
              <textarea
                placeholder="Event Details or Description"
                value={newEvent.details}
                onChange={(e) => setNewEvent({ ...newEvent, details: e.target.value })}
                className="textarea"
              />
              <div className="modal-buttons">
                <button onClick={() => setShowModal(false)} className="cancel-button">
                  Cancel
                </button>
                <button onClick={handleAddEvent} className="save-button">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View & Delete Modal */}
        {selectedEvent && (
          <div className="modal-overlay">
            <div className="modal">
              <h3 className="modal-title">Event Details</h3>
              <p><strong>Title:</strong> {selectedEvent.title}</p>
              <p><strong>Start:</strong> {new Date(selectedEvent.start).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(selectedEvent.end).toLocaleString()}</p>
              <p><strong>Details:</strong> {selectedEvent.details}</p>
              <div className="modal-buttons">
                <button onClick={() => setSelectedEvent(null)} className="cancel-button">
                  Close
                </button>
                <button onClick={handleDeleteEvent} className="delete-button">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="calendar-wrapper">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            views={["month", "week", "day", "agenda"]}
            defaultView="month"
            toolbar={true}
            popup={true}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarScheduler;
