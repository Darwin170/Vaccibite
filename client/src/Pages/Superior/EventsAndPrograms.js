import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Calendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { dateFnsLocalizer } from "react-big-calendar";
import Sidebar from "./Sidebar";
import "./Sidebar.css";
import "./EventsAndPrograms.css";

const API_URL = 'http://localhost:8787';
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

const CustomToolbar = ({ label, onNavigate, onView, view }) => (
  <div className="rbc-toolbar">
    <span className="rbc-btn-group">
      <button onClick={() => onNavigate("TODAY")}>Today</button>
      <button onClick={() => onNavigate("PREV")}>Back</button>
      <button onClick={() => onNavigate("NEXT")}>Next</button>
    </span>
    <span className="rbc-toolbar-label">{label}</span>
    <span className="rbc-btn-group">
      <button className={view === "month" ? "rbc-active" : ""} onClick={() => onView("month")}>Month</button>
      <button className={view === "week" ? "rbc-active" : ""} onClick={() => onView("week")}>Week</button>
      <button className={view === "day" ? "rbc-active" : ""} onClick={() => onView("day")}>Day</button>
      <button className={view === "agenda" ? "rbc-active" : ""} onClick={() => onView("agenda")}>Agenda</button>
    </span>
  </div>
);

const CalendarScheduler = () => {
  const [events, setEvents] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    details: "",
    barangayId: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch barangays with districts
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/auth/getAllBarangays`)
      .then(res => setBarangays(res.data))
      .catch(err => console.error("Error fetching barangays:", err));
  }, []);

  // Fetch events from backend
  const fetchEvents = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/getAllEvents`);
      const formatted = res.data.map(ev => ({
        ...ev,
        start: new Date(ev.start),
        end: new Date(ev.end),
      }));
      setEvents(formatted);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Create new event
  const handleAddEvent = async () => {
    const { title, start, end, details, barangayId } = newEvent;
    if (!title || !start || !end || !details || !barangayId) {
      console.error("Please fill out all fields.");
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/createEvent`, {
        title,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        details,
        barangayId
      });

      const created = res.data.event;
      setEvents([...events, { ...created, start: new Date(created.start), end: new Date(created.end) }]);
      setNewEvent({ title: "", start: "", end: "", details: "", barangayId: "" });
      setShowModal(false);
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  // Update event
  const handleUpdateEvent = async () => {
    if (!editedEvent) return;

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/auth/updateEvent/${editedEvent._id}`, {
        title: editedEvent.title,
        start: new Date(editedEvent.start).toISOString(),
        end: new Date(editedEvent.end).toISOString(),
        details: editedEvent.details,
        barangayId: editedEvent.barangayId
      });

      setEvents(events.map(ev =>
        ev._id === editedEvent._id
          ? { ...editedEvent, start: new Date(editedEvent.start), end: new Date(editedEvent.end) }
          : ev
      ));
      setShowEditModal(false);
      setEditedEvent(null);
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  // Delete event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/auth/deleteEvents/${selectedEvent._id}`);
      setEvents(events.filter(ev => ev._id !== selectedEvent._id));
      setSelectedEvent(null);
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  // Format for datetime-local input
  const formatDateForInput = (date) => {
    if (!date) return "";
    const dt = new Date(date);
    dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
    return dt.toISOString().slice(0, 16);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="reporting-container" style={{ marginLeft: "220px" }}>
        <button className="add-button" onClick={() => setShowModal(true)}>+ Add Event</button>

        {/* Add Event Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>New Event</h3>
              <input
                type="text"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="input"
              />

              <label>Barangay:</label>
              <select
                value={newEvent.barangayId}
                onChange={(e) => setNewEvent({ ...newEvent, barangayId: e.target.value })}
                className="input"
              >
                <option value="">-- Select Barangay --</option>
                {barangays.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.districtId?.name})
                  </option>
                ))}
              </select>

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
                placeholder="Event Details"
                value={newEvent.details}
                onChange={(e) => setNewEvent({ ...newEvent, details: e.target.value })}
                className="textarea"
              />

              <div className="modal-buttons">
                <button onClick={() => setShowModal(false)} className="cancel-button">Cancel</button>
                <button onClick={handleAddEvent} className="save-button">Save</button>
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
            date={currentDate}
            view={currentView}
            onNavigate={setCurrentDate}
            onView={setCurrentView}
            components={{ toolbar: CustomToolbar }}
            popup
            onSelectEvent={setSelectedEvent}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarScheduler;

