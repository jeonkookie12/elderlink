import React, { useEffect, useState } from "react";
import CheckIcon from "../../assets/announcements/check.svg";

function Announcement() {
  const [announcements, setAnnouncements] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementDetails, setAnnouncementDetails] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortAsc, setSortAsc] = useState(true);
  const [errors, setErrors] = useState({ title: "", content: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showPostSuccessModal, setShowPostSuccessModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAnnouncements = () => {
    fetch("http://localhost/elder-db/admin-process/fetch_announcement.php")
      .then((response) => response.json())
      .then((data) => setAnnouncements(data))
      .catch((error) => console.error("Fetch error:", error));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const toggleAnnouncementVisibility = (id, currentStatus) => {
    fetch("http://localhost/elder-db/admin-process/toggle_visibility.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: currentStatus === "Visible" ? "Hidden" : "Visible" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          fetchAnnouncements();
          setViewModalOpen(false);
        } else {
          alert("Failed to update status.");
        }
      });
  };

const handleDeleteAnnouncement = async (id) => {
  if (!id) return;


  setShowDeleteModal(false);
  const startTime = Date.now(); // Record start time
  setIsSubmitting(true); // Show modal
  try {
    const response = await fetch(`http://localhost/elder-db/admin-process/delete_announcement.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const timeElapsed = Date.now() - startTime;
    const remainingTime = 2000 - timeElapsed;

    // Ensure modal stays up for at least 2 seconds
    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    if (response.ok) {
      setViewModalOpen(false);
      fetchAnnouncements();
      
      setShowDeleteSuccessModal(true);
    } else {
      alert("Failed to delete announcement.");
    }
  } catch (error) {
    console.error("Error deleting announcement:", error);
    alert("An error occurred. Please try again.");
  } finally {
    setIsSubmitting(false); // Hide modal
  }
};
const postAnnouncement = () => {
  const newErrors = {
    title: announcementTitle.trim() === "" ? "Title is required." : "",
    content: announcementDetails.trim() === "" ? "Details are required." : "",
  };
  setErrors(newErrors);

  if (newErrors.title || newErrors.content) return;

  setIsSubmitting(true);
  const startTime = Date.now(); // Record start time

  fetch("http://localhost/elder-db/admin-process/create_announcement.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: announcementTitle,
      content: announcementDetails,
    }),
  })
    .then((res) => res.json())
    .then(async (data) => {
      const elapsed = Date.now() - startTime;
      const remaining = 2000 - elapsed;
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }

      if (data.success) {
        setViewModalOpen(false);
        setAnnouncementTitle("");
        setAnnouncementDetails("");
        fetchAnnouncements();
        setShowPostSuccessModal(true);
      } else {
        alert("Failed to create announcement.");
      }
    })
    .catch(async (error) => {
      const elapsed = Date.now() - startTime;
      const remaining = 2000 - elapsed;
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }

      alert("An error occurred.");
      console.error("Error:", error);
    })
    .finally(() => {
      setIsSubmitting(false);
    });
};



  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (sortBy === "date") {
      return sortAsc
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === "status") {
      const valA = a.status === "Visible" ? 1 : 0;
      const valB = b.status === "Visible" ? 1 : 0;
      return sortAsc ? valA - valB : valB - valA;
    }
    return 0;
  });

  return (
    <div className="w-full">
      <div className="flex justify-end mb-2">
        <button
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
          onClick={() => {
            setViewModalOpen("create");
            setAnnouncementTitle("");
            setAnnouncementDetails("");
            setErrors({ title: "", content: "" });
          }}
        >
          Create Announcement
        </button>
      </div>

      <div className="overflow-x-auto max-h-[680px] border border-green-800 rounded-md">
        <table className="min-w-full text-sm border-collapse table-fixed">
          <thead className="bg-green-800 text-white sticky top-0 z-10">
            <tr>
              <th className="w-[10%] p-3 text-center">No.</th>
              <th className="w-[30%] p-3 text-center">Name</th>
              <th
                className="w-[20%] p-3 text-center cursor-pointer hover:underline"
                onClick={() => {
                  setSortBy("date");
                  setSortAsc(sortBy === "date" ? !sortAsc : true);
                }}
              >
                Date Posted {sortBy === "date" && (sortAsc ? "▲" : "▼")}
              </th>
              <th
                className="w-[20%] p-3 text-center cursor-pointer hover:underline"
                onClick={() => {
                  setSortBy("status");
                  setSortAsc(sortBy === "status" ? !sortAsc : true);
                }}
              >
                Status {sortBy === "status" && (sortAsc ? "▲" : "▼")}
              </th>
            </tr>
          </thead>
          <tbody className="text-center">
            {sortedAnnouncements.map((item, index) => (
              <tr
                key={item.id}
                className="bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => setViewModalOpen({ mode: "view", data: item })}
              >
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{item.title}</td>
                <td className="p-3">
                  {new Date(item.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status === "Visible"
                        ? "bg-green-200 text-green-800"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {viewModalOpen === "create" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Announcement</h2>
              <button onClick={() => setViewModalOpen(false)} className="text-xl">
                &times;
              </button>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <input
                className={`w-full border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } rounded p-2 mt-1 mb-4`}
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
              />
              {errors.title && <p className="text-sm text-red-500 mb-2">{errors.title}</p>}

              <label className="text-sm font-medium">Details</label>
              <textarea
                className={`w-full border ${
                  errors.content ? "border-red-500" : "border-gray-300"
                } rounded p-2 mt-1`}
                rows="6"
                value={announcementDetails}
                onChange={(e) => setAnnouncementDetails(e.target.value)}
              />
              {errors.content && <p className="text-sm text-red-500 mb-2">{errors.content}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={postAnnouncement}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )} 
      
      {viewModalOpen === "create" && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm px-4 py-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow p-6 my-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Announcement</h2>
              <button onClick={() => setViewModalOpen(false) || setConfirmPostOpen(true)} className="text-xl">
                &times;
              </button>
            </div>
            <hr className="mb-4" />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded border border-gray-300"
                  placeholder="Enter title"
                  value={announcementTitle}
                  onChange={(e) => {
                    setAnnouncementTitle(e.target.value);
                    if (e.target.value.trim() !== "") {
                      setErrors((prev) => ({ ...prev, title: "" }));
                    }
                  }}
                />
                {errors.title && (
                  <p className="text-red-600 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Details</label>
                <textarea
                  rows="10"
                  className="w-full px-3 py-2 rounded resize-none border border-gray-300"
                  value={announcementDetails}
                  onChange={(e) => {
                    setAnnouncementDetails(e.target.value);
                    if (e.target.value.trim() !== "") {
                      setErrors((prev) => ({ ...prev, content: "" }));
                    }
                  }}
                  placeholder={`You can put links like this. Always put the "|" to make as a link.\n• One (1) Valid Government Issued ID\nGSIS Pension Info|https://gsis.gov.ph`}
                />
                {errors.content && (
                  <p className="text-red-600 text-xs mt-1">{errors.content}</p>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Preview</label>
                <div className="w-full px-3 py-2 rounded bg-gray-100 whitespace-pre-wrap break-words text-sm text-black min-h-[150px]">
                  {announcementDetails.trim() === "" ? (
                    <span className="text-gray-400">Preview will appear here...</span>
                  ) : (
                    announcementDetails.split("\n").map((line, index) => {
                      if (line.includes("|")) {
                        const [text, url] = line.split("|");
                        return (
                          <div key={index}>
                            <a
                              href={url.trim()}
                              className="text-blue-600 underline break-all"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {text.trim()}
                            </a>
                          </div>
                        );
                      }
                      return <div key={index}>{line}</div>;
                    })
                  )}
                </div>
              </div>
            </div>
             <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded text-white ${
                    (announcementTitle.trim() === "" || announcementDetails.trim() === "")
                      ? "bg-green-300 hover:bg-green-300"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                  onClick={postAnnouncement}
                >
                  Post
                </button>
              </div>
          </div>
        </div>
      )}


      {/* View Modal */}
      {viewModalOpen?.mode === "view" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Announcement</h2>
              <button onClick={() => setViewModalOpen(false)} className="text-xl">
                &times;
              </button>
            </div>
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                className="w-full border border-gray-300 rounded p-2 mt-1 mb-4"
                value={viewModalOpen?.data?.title}
                disabled
              />
              <label className="text-sm font-medium">Details</label>
              <textarea
                className="w-full border border-gray-300 rounded p-2 mt-1"
                rows="8"
                value={viewModalOpen?.data?.content}
                disabled
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setDeleteId(viewModalOpen?.data?.id);
                  setShowDeleteModal(true);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
              <button
                onClick={() =>
                  toggleAnnouncementVisibility(
                    viewModalOpen?.data?.id,
                    viewModalOpen?.data?.status
                  )
                }
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
              >
                {viewModalOpen?.data?.status === "Visible" ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg max-w-sm text-center shadow-lg">

          {/* Centered Icon */}
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-red-600 mb-4">
            Are you sure you want to delete this announcement?
          </h2>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteAnnouncement(deleteId)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}

      {/* Success Modal */}
    {showPostSuccessModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-white mx-10 py-10 rounded-lg shadow-lg flex flex-col items-center max-w-md text-center">
          <img src={CheckIcon} alt="Success" className="w-15 h-12 mb-2" />
          <p className="text-xl font-semibold mb-2 text-green-700">Announcement Posted Successfully!</p>
          <button
            onClick={() => setShowPostSuccessModal(false)}
            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            OK
          </button>
        </div>
      </div>
    )}

      {/* Delete Success Modal */}
      {showDeleteSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white mx-10 py-10 rounded-lg shadow-lg flex flex-col items-center max-w-md text-center">
            <img src={CheckIcon} alt="Deleted" className="w-15 h-12 mb-2" />
            <p className="text-xl font-semibold mb-2 text-green-700">Announcement Deleted Successfully!</p>
            <button
              onClick={() => setShowDeleteSuccessModal(false)}
              className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs backdrop-brightness-50">
          <div className="bg-white rounded-xl shadow-xl w-80 p-6 text-center animate-fadeIn">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 mb-4 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
              <h3 className="text-lg font-semibold text-gray-800">Processing...</h3>
              <p className="text-sm text-gray-500 mt-1">
                Please wait while we submit your feedback.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Announcement;
