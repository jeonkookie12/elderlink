import React, { useEffect, useState } from "react";


export default function FeedbackTable() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [modalData, setModalData] = useState(null);
  
useEffect(() => {
  if (modalData && modalData.status === "Unread") {
    markAsRead(modalData.id).then(() => {
      // Update the modal data locally to reflect the read status
      setModalData((prev) => ({ ...prev, status: "Read" }));
    });
  }
}, [modalData]);

useEffect(() => {
  fetchFeedbacks();
}, []);

const fetchFeedbacks = () => {
  fetch("http://localhost/elder-dB/admin-process/get_feedback.php")
    .then((res) => res.text()) // for debugging
    .then((text) => {
      const data = JSON.parse(text);
      setFeedbacks(data);
      setFilteredFeedback(data);
    })
    .catch((err) => console.error("Error fetching feedback:", err));
};

const handleCloseModal = () => {
  setModalData(null);
  fetchFeedbacks(); // Optional: ensure state is synced
};

  useEffect(() => {
    fetch("http://localhost/elder-dB/admin-process/get_feedback.php")
      .then((res) => res.text()) // temporarily use .text() to inspect what we actually get
    .then((text) => {
      const data = JSON.parse(text);      // now manually parse
      setFeedbacks(data);
      setFilteredFeedback(data);
    })
    .catch((err) => console.error("Error fetching feedback:", err));
}, []);


  const handleSort = (key) => {
    const newOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(key);
    setSortOrder(newOrder);

    const sorted = [...filteredFeedback].sort((a, b) => {
      if (key === "az")
        return newOrder === "asc"
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      if (key === "rating")
        return newOrder === "asc" ? a.rating - b.rating : b.rating - a.rating;
      if (key === "status")
        return newOrder === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      if (key === "date")
        return newOrder === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      return 0;
    });

    setFilteredFeedback(sorted);
  };
const markAsRead = async (id) => {
  try {
    const response = await fetch("http://localhost/elder-dB/admin-process/mark_feedback_read.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();
    console.log("Marked as read:", data);

    // Optionally update your state here too
    setFeedbacks((prev) =>
      prev.map((fb) => (fb.id === id ? { ...fb, status: "Read" } : fb))
    );

    return data; // ✅ RETURN something
  } catch (error) {
    console.error("Error marking as read:", error);
    throw error; // Optional, to allow .catch() to work if needed
  }
};


  const deleteFeedback = (id) => {
    const updated = filteredFeedback.filter((fb) => fb.id !== id);
    setFilteredFeedback(updated);
    setModalData(null);
    // Optional: delete from backend
    fetch("http://localhost/elder-dB/admin-process/delete_feedback.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };
  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto max-h-[680px] border border-green-800 rounded-md">
        <table className="min-w-full text-xs sm:text-sm border-collapse table-fixed">
          <thead className="bg-green-800 text-white sticky top-0 z-10">
            <tr>
              <th
                className="w-[30%] p-3 text-center cursor-pointer hover:underline"
                onClick={() => handleSort("az")}
              >
                Email {sortBy === "az" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="w-[15%] p-3 text-center cursor-pointer hover:underline"
                onClick={() => handleSort("rating")}
              >
                Rating{" "}
                {sortBy === "rating" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="w-[20%] p-3 text-center cursor-pointer hover:underline"
                onClick={() => handleSort("status")}
              >
                Status{" "}
                {sortBy === "status" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="w-[35%] p-3 text-center cursor-pointer hover:underline"
                onClick={() => handleSort("date")}
              >
                Date {sortBy === "date" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>
          <tbody className="text-black text-center">
            {filteredFeedback.map((item, index) => (
              <tr
                key={index}
                className="bg-white border-b border-gray-200 hover:bg-gray-100 transition cursor-pointer"
                onClick={() => setModalData(item)}
              >
                <td className="w-[30%] p-3 break-words">{item.email || "Anonymous"}</td>
                <td className="w-[15%] p-3 text-yellow-500">
                  {renderStars(item.rating)}
                </td>
                <td className="w-[20%] p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status === "Read"
                        ? "bg-green-200 text-green-800"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="w-[35%] p-3">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-white/10 backdrop-blur-sm overflow-y-auto py-16 px-4">
          <div className="bg-white rounded-lg w-full max-w-3xl p-9 max-h-[100vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg text-green-800 font-semibold">
                Feedback Information
              </h2>
              <button onClick={() => setModalData(null)}>&times;</button>
            </div>
            <hr className="mb-4 border-green-600 " />
            <label className="block text-green-800 text-sm font-medium mb-1">
            User ID
            </label>
             <input
              type="text"
              className="w-full bg-gray-200 text-green-900 px-3 py-2 rounded mb-4"
              value={modalData.user_id || "guest"}
              disabled
            />
            <label className="block text-green-800 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="text"
              className="w-full bg-gray-200 text-green-900 px-3 py-2 rounded mb-4"
              value={modalData.email || "Anonymous"}
              disabled
            />
            <label className="block text-green-800 text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              className="w-full px-3 py-2 bg-gray-200 text-green-900 rounded mb-4"
              value={modalData.message}
              rows={6}
              disabled
            />
            <label className="block text-green-800 text-sm font-medium mb-1">
              Date
            </label>
            <input
              type="text"
              className="w-full bg-gray-200 text-green-900 px-3 py-2 rounded mb-4"
              value={modalData.date}
              disabled
            />
            <label className="block text-green-800 text-sm font-medium mb-1">
              Rating
            </label>
            <input
              type="text"
              className="w-full bg-gray-200 text-green-900 px-3 py-2 rounded mb-4"
              value={renderStars(modalData.rating)}
              disabled
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition-all"
              >
                Close
              </button>
              
              {/*<button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
                onClick={() => deleteFeedback(modalData.id)}
              >
                Delete
              </button>*/}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
