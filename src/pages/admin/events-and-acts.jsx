import { useState, useEffect } from 'react';

import CameraIcon from '../../assets/admin-assets/events/camera.svg';
import CalendarIcon from '../../assets/admin-assets/events/calendar.svg';
import ClockIcon from '../../assets/admin-assets/events/clock.svg';
import LocationIcon from '../../assets/admin-assets/events/location.svg';
import ArchivedIcon from '../../assets/admin-assets/events/archived.svg';

import UpcomingIcon from '../../assets/admin-assets/events/upcoming.svg';
import PastIcon from '../../assets/admin-assets/events/past.svg';

import CreateEvent from '../../assets/events/create.svg';
import CloseIcon from '../../assets/events/close.svg';

function AdminEventsAndActivites() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [goingUsers, setGoingUsers] = useState([]);
  const [formData, setFormData] = useState({
    event_name: '',
    location: '',
    event_type: '',
    s_date: '',
    e_date: '',
    s_time: '',
    e_time: '',
    details: '',
    upload_pic: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
const [formErrors, setFormErrors] = useState({
  s_date: "",
  e_date: "",
  s_time: "",
  e_time: "",
});
  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetch(`http://localhost/elder-dB/admin-process/get_event_going_users.php?event_id=${selectedEvent.id}`, {
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setGoingUsers(data.users);
          }
        })
        .catch((err) => console.error('Error fetching users:', err));
    }
  }, [selectedEvent]);


const fetchArchivedEvents = async () => {
  try {
    const response = await fetch("http://localhost/elder-dB/admin-process/admin_fetch_archived_events.php");
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      console.log("Archived events data:", data);  // Add this line to debug
      setFilteredEvents(data);
    } catch (jsonError) {
      console.error("Error parsing archived JSON:", jsonError);
      console.error("Raw response:", text);
    }
  } catch (error) {
    console.error("Error fetching archived events:", error);
  }
};


useEffect(() => {
  if (eventFilter === 'archived') {
    fetchArchivedEvents();
  } else {
    filterEvents(events, eventFilter);
  }
}, [eventFilter, events]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost/elder-dB/admin-process/admin_fetch_events.php");
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        setEvents(data);
        filterEvents(data, eventFilter);
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        console.error("Raw response:", text);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const filterEvents = (eventsList, filterType) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const filtered = eventsList.filter(event => {
      const eventDate = new Date(event.s_date).setHours(0, 0, 0, 0);
      return filterType === 'upcoming' ? eventDate >= today : eventDate < today;
    });
    setFilteredEvents(filtered);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const { event_name, location, event_type, s_date, e_date, s_time, e_time, details } = formData;

  const errors = {
    event_name: "",
    location: "",
    event_type: "",
    s_date: "",
    e_date: "",
    s_time: "",
    e_time: "",
    details: ""
  };

  const now = new Date();
  const startDateTime = s_date && s_time ? new Date(`${s_date}T${s_time}`) : null;
  const endDateTime = e_date && e_time ? new Date(`${e_date}T${e_time}`) : null;

  // Required fields
  if (!event_name) errors.event_name = "Event name is required.";
  if (!location) errors.location = "Location is required.";
  if (!event_type) errors.event_type = "Event type is required.";
  if (!s_date) errors.s_date = "Start date is required.";
  if (!s_time) errors.s_time = "Start time is required.";
  if (!e_date) errors.e_date = "End date is required.";
  if (!e_time) errors.e_time = "End time is required.";
  if (!details) errors.details = "Details are required.";

  // Date/Time validations
  if (startDateTime && startDateTime < now) {
    errors.s_date = "Start date/time must be in the future.";
  }

  if (startDateTime && endDateTime && endDateTime < startDateTime) {
    errors.e_date = "End date/time must be after start date/time.";
    errors.e_time = "End date/time must be after start date/time.";
  }

  setFormErrors(errors);

  const hasErrors = Object.values(errors).some((msg) => msg !== "");
  if (hasErrors) return;

  // Submit data
  const data = new FormData();
  Object.keys(formData).forEach(key => {
    if (formData[key]) data.append(key, formData[key]);
  });

  try {
    const response = await fetch('http://localhost/elder-dB/admin-process/create_event.php', {
      method: 'POST',
      body: data,
    });

    const text = await response.text();
    console.log("Raw response:", text);

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      alert("Server response is not valid JSON.");
      return;
    }

    if (result.success) {
      alert('Event added successfully!');
      setShowCreateModal(false);
      setFormData({
        event_name: '',
        location: '',
        event_type: '',
        s_date: '',
        e_date: '',
        s_time: '',
        e_time: '',
        details: '',
        upload_pic: null
      });
      setPreviewImage(null);
      fetchEvents();
    } else {
      alert(`Failed to add event: ${result.message}`);
    }
  } catch (error) {
    console.error('Error adding event:', error);
    alert('An error occurred while adding the event. Please try again.');
  }
};


  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden ml-0 lg:ml-0 transition-all">
        <div className="lg:px-25 py-5 px-5">
            <div className="flex items-center justify-between gap-2 mb-12 px-4 flex-wrap sm:flex-nowrap">
              {/* Left Side: Filter Buttons */}
              <div className="flex flex-nowrap items-center gap-1 sm:gap-2 min-w-0 overflow-hidden">
                {/* Upcoming Button */}
                <button
                  onClick={() => setEventFilter('upcoming')}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-[10px] sm:text-sm lg:text-base rounded-sm flex-shrink-0 min-w-0 truncate ${
                    eventFilter === 'upcoming'
                      ? 'bg-green-700 text-white'
                      : 'bg-white border border-gray-300 text-gray-600'
                  }`}
                >
                  <img
                    src={UpcomingIcon}
                    alt="Upcoming"
                    className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-6 transition-filter duration-100 ease-in-out ${
                      eventFilter === 'upcoming' ? 'filter brightness-100' : 'filter brightness-65'
                    }`}
                  />
                  Upcoming
                </button>

                {/* Past Button */}
                <button
                  onClick={() => setEventFilter('past')}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-[10px] sm:text-sm lg:text-base rounded-sm flex-shrink-0 min-w-0 truncate ${
                    eventFilter === 'past'
                      ? 'bg-green-700 text-white'
                      : 'bg-white border border-gray-300 text-gray-600'
                  }`}
                >
                  <img
                    src={PastIcon}
                    alt="Archived"
                    className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 transition-filter duration-100 ease-in-out ${
                      eventFilter === 'past' ? 'filter brightness-100' : 'filter brightness-65'
                    }`}
                  />
                  Past
                </button>

                {/* Archived Button */}
                <button
                  onClick={() => setEventFilter('archived')}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-[10px] sm:text-sm lg:text-base rounded-sm flex-shrink-0 min-w-0 truncate ${
                    eventFilter === 'archived'
                      ? 'bg-green-700 text-white'
                      : 'bg-white border border-gray-300 text-gray-600'
                  }`}
                >Archived
                  <img
                    src={ArchivedIcon}
                    alt="Archived"
                    className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-6 transition-filter duration-100 ease-in-out ${
                      eventFilter === 'archived' ? 'filter brightness-100' : 'filter brightness-65'
                    }`}
                  />
                  
                </button>
              </div>

              {/* Right Side: Create Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2.5 bg-green-700 text-white text-[10px] sm:text-sm lg:text-base rounded hover:bg-green-800 flex-shrink-0 min-w-[90px] sm:min-w-[110px]"
              >
                <img src={CreateEvent} alt="Create" className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                Create
              </button>
            </div>




          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 overflow-hidden">
            
           {filteredEvents.map((event, index) => (
              <div
                key={index}
                className="bg-white shadow hover:shadow-lg cursor-pointer rounded-lg"
                onClick={() => {
                  setShowViewModal(true);
                  setSelectedEvent(event);
                }}
              >
                <img
                  src={`http://localhost/elder-dB/events-img/${event.upload_pic}`} 
                  alt={event.title}
                  className="w-full h-68 object-cover mb-3 rounded-t-lg"
                />
                <h3 className="font-semibold text-green-800 text-center py-3">
              {event.title || event.event_name || "Untitled Event"}
            </h3>
              </div>
            ))}
          </div>
        </div>
        

        {showViewModal && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
              <div className="flex justify-end items-end mb-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-black"
                >
                 <img
                   src={CloseIcon}
                   alt="Close"
                    className="w-5 h-5 transition-filter duration-200 ease-in-out hover:filter hover:brightness-55"
                  />
                </button>
              </div>
              <img
                src={`http://localhost/elder-dB/events-img/${selectedEvent.upload_pic}`}
                className="w-full rounded mb-4 h-90"
                alt="Event"
              />
              <h3 className=" text-green-700 text-lg py-3 font-bold">{selectedEvent.title}</h3>
              <div className="flex items-center gap-2 text-green-700 py-1 text-md">
                <img src={CalendarIcon} alt="Date" className="w-4 h-4" />
                <span>Date: {selectedEvent.s_date}</span>
              </div>
              <div className="flex items-center gap-2 text-green-700 py-1 text-md">
                <img src={ClockIcon} alt="Time" className="w-4 h-4" />
                <span>Time: {selectedEvent.s_time}</span>
              </div>
              <div className="flex items-center gap-2 text-green-700 py-1n text-md">
                <img src={LocationIcon} alt="Location" className="w-4 h-4" />
                <span>Location: {selectedEvent.location}</span>
              </div>
              <p className="text-green-700 mt-5 mb-10">{selectedEvent.details}</p>
              <table className="w-full mt-4 text-sm">
                <thead>
                  <tr className="bg-green-700 text-white">
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {goingUsers.length > 0 ? (
                    goingUsers.map((user, i) => (
                      <tr key={i} className="text-green-800">
                        <td className="text-center py-2">{user.username}</td>
                        <td className="text-center py-2">{user.email}</td>
                        <td className="text-center py-2 capitalize">{user.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-2 text-gray-500">
                        No users marked as going.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

 {showCreateModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-2 sm:px-4 py-6">
    <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl mx-3 p-6 sm:p-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-green-900">CREATE AN EVENT</h3>
        <button
          onClick={() => setShowCreateModal(false)}
          className="text-gray-500 hover:text-black"
        >
          <img
            src={CloseIcon}
            alt="Close"
            className="w-5 h-5 transition-filter duration-200 ease-in-out hover:filter hover:brightness-55"
          />
        </button>
      </div>
      <hr className="mb-8 border-green-900" />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm h-[calc(90vh-10rem)]">
        {/* Left Column */}
        <div className="space-y-2 flex flex-col">
          {/* Image Upload */}
          <div className="text-center">
            <div className="border border-gray-400 w-full h-40 flex items-center justify-center rounded">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="object-cover w-full h-full rounded"
                />
              ) : (
                <img
                  src={CameraIcon}
                  alt="Upload"
                  className="w-12 h-12 text-green-700"
                />
              )}
            </div>
            <p className="text-xs mt-2">Image must not exceed 10MB</p>
            <div>
              <input
                type="file"
                id="uploadImage"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormData({ ...formData, upload_pic: file });
                    setPreviewImage(URL.createObjectURL(file));
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="uploadImage"
                className="bg-green-700 text-white mt-3 px-5 mb-4 py-2 rounded cursor-pointer hover:bg-green-800 inline-block "
              >
                Upload Photo
              </label>
            </div>
          </div>

          {/* Event Type */}
          <select
            value={formData.event_type}
            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            className="w-full border px-4 py-3 rounded"
            required
          >
            <option value="" disabled>Select event type</option>
            <option value="In person">In person</option>
            <option value="Virtual">Virtual</option>
          </select>

          {/* Start Date */}
          <div>
            <label className="block mb-1 text-gray-700">Start Date</label>
            <input
              type="date"
              value={formData.s_date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFormData({ ...formData, s_date: e.target.value })}
              className="w-full border px-4 py-3 rounded"
              required
            />
            {formErrors.s_date && (
              <p className="text-red-600 text-sm mt-1">{formErrors.s_date}</p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="block mb-1 text-gray-700">Start Time</label>
            <input
              type="time"
              value={formData.s_time}
              onChange={(e) => setFormData({ ...formData, s_time: e.target.value })}
              className="w-full border px-4 py-3 rounded"
              required
            />
            {formErrors.s_time && (
              <p className="text-red-600 text-sm mt-1">{formErrors.s_time}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block mb-1 text-gray-700">End Date</label>
            <input
              type="date"
              value={formData.e_date}
              min={formData.s_date || new Date().toISOString().split("T")[0]}
              onChange={(e) => setFormData({ ...formData, e_date: e.target.value })}
              className="w-full border px-4 py-3 rounded"
              required
            />
            {formErrors.e_date && (
              <p className="text-red-600 text-sm mt-1">{formErrors.e_date}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="block mb-1 text-gray-700">End Time</label>
            <input
              type="time"
              value={formData.e_time}
              onChange={(e) => setFormData({ ...formData, e_time: e.target.value })}
              className="w-full border px-4 py-3 rounded"
              required
            />
            {formErrors.e_time && (
              <p className="text-red-600 text-sm mt-1">{formErrors.e_time}</p>
            )}
          </div>
        </div>

              
        <div className="flex flex-col h-full space-y-6">
          <div className="space-y-6">
            <input
              type="text"
              value={formData.event_name}
              onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
              placeholder="Event Name"
              className="w-full border px-4 py-3 rounded"
              required
            />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Location"
              className="w-full border px-4 py-3 rounded"
              required
            />
          </div>

          <textarea
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            placeholder="Details"
            className="w-full border px-4 py-3 rounded resize-none h-[473px]"
            required
          />
        </div>


        {/* Submit Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="bg-green-700 text-white w-full py-3 rounded text-lg hover:bg-green-800"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      </main>
    </div>
  );
}

export default AdminEventsAndActivites;
